"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";

import { useAuth } from "@/components/auth/auth-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { AuthApiError, signup } from "@/lib/api/auth";

export default function SignupPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = useMemo(() => searchParams.get("next") || "/account", [searchParams]);
  const { setUser } = useAuth();

  const [email, setEmail] = useState("");
  const [nickname, setNickname] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    setMessage(null);
    try {
      const result = await signup({ email, password, nickname: nickname || undefined });
      setUser(result.user);
      if (result.verification_token_preview) {
        setMessage(`Account created. Dev verification token: ${result.verification_token_preview}`);
      }
      router.push(next);
      router.refresh();
    } catch (err) {
      setError(err instanceof AuthApiError ? err.message : "Could not create account.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="mx-auto max-w-md p-4">
      <Card>
        <CardHeader>
          <h1 className="text-lg font-semibold text-zinc-100">Create account</h1>
        </CardHeader>
        <CardContent className="space-y-4">
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="mb-1 block text-xs text-zinc-400">Email</label>
              <Input value={email} onChange={(event) => setEmail(event.target.value)} type="email" required />
            </div>
            <div>
              <label className="mb-1 block text-xs text-zinc-400">Nickname</label>
              <Input value={nickname} onChange={(event) => setNickname(event.target.value)} placeholder="trader_name" />
            </div>
            <div>
              <label className="mb-1 block text-xs text-zinc-400">Password</label>
              <Input value={password} onChange={(event) => setPassword(event.target.value)} type="password" required />
            </div>

            {error ? <p className="text-sm text-rose-400">{error}</p> : null}
            {message ? <p className="text-sm text-emerald-300">{message}</p> : null}

            <Button type="submit" disabled={submitting}>
              {submitting ? "Creating account..." : "Sign up"}
            </Button>
          </form>

          <p className="text-sm text-zinc-400">
            Already have an account?{" "}
            <Link href={`/login?next=${encodeURIComponent(next)}`} className="text-emerald-300 hover:underline">
              Log in
            </Link>
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
