"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";

import { useAuth } from "@/components/auth/auth-provider";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AuthApiError, login, requestPasswordReset } from "@/lib/api/auth";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = useMemo(() => searchParams.get("next") || "/account", [searchParams]);
  const { setUser } = useAuth();

  const [email, setEmail] = useState("");
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
      const result = await login({ email, password });
      setUser(result.user);
      router.push(next);
      router.refresh();
    } catch (err) {
      setError(err instanceof AuthApiError ? err.message : "Could not sign in.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = async () => {
    setError(null);
    setMessage(null);
    try {
      const result = await requestPasswordReset(email);
      setMessage(result.token_preview ? `${result.message} Dev token: ${result.token_preview}` : result.message);
    } catch (err) {
      setError(err instanceof AuthApiError ? err.message : "Could not request reset.");
    }
  };

  return (
    <main className="mx-auto max-w-md p-4">
      <Card>
        <CardHeader>
          <h1 className="text-lg font-semibold text-zinc-100">Log in</h1>
        </CardHeader>
        <CardContent className="space-y-4">
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="mb-1 block text-xs text-zinc-400">Email</label>
              <Input value={email} onChange={(event) => setEmail(event.target.value)} type="email" required />
            </div>
            <div>
              <label className="mb-1 block text-xs text-zinc-400">Password</label>
              <Input value={password} onChange={(event) => setPassword(event.target.value)} type="password" required />
            </div>

            {error ? <p className="text-sm text-rose-400">{error}</p> : null}
            {message ? <p className="text-sm text-emerald-300">{message}</p> : null}

            <div className="flex flex-wrap gap-2">
              <Button type="submit" disabled={submitting}>
                {submitting ? "Logging in..." : "Log in"}
              </Button>
              <Button
                type="button"
                className="border-zinc-600 bg-transparent hover:bg-zinc-800"
                onClick={handleReset}
                disabled={!email}
              >
                Send reset link
              </Button>
            </div>
          </form>

          <p className="text-sm text-zinc-400">
            No account yet?{" "}
            <Link href={`/signup?next=${encodeURIComponent(next)}`} className="text-emerald-300 hover:underline">
              Sign up
            </Link>
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
