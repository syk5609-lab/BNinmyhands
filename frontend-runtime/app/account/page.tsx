"use client";

import { useEffect, useState } from "react";

import { useAuth } from "@/components/auth/auth-provider";
import { LoginRequiredCTA } from "@/components/auth/login-required-cta";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { AuthApiError, requestVerification, updateAccountProfile } from "@/lib/api/auth";

export default function AccountPage() {
  const { user, loading, setUser } = useAuth();
  const [nickname, setNickname] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    setNickname(user.nickname);
    setBio(user.profile.bio ?? "");
    setAvatarUrl(user.profile.avatar_url ?? "");
  }, [user]);

  if (loading) {
    return <main className="mx-auto max-w-3xl p-4 text-sm text-zinc-400">Loading account...</main>;
  }

  if (!user) {
    return (
      <main className="mx-auto max-w-3xl p-4">
        <LoginRequiredCTA
          title="Account access requires login"
          description="Log in or sign up to edit your profile and manage launch account settings."
        />
      </main>
    );
  }

  const handleSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      const updatedUser = await updateAccountProfile({
        nickname,
        bio,
        avatar_url: avatarUrl,
      });
      setUser(updatedUser);
      setMessage("Profile updated.");
    } catch (err) {
      setError(err instanceof AuthApiError ? err.message : "Could not update profile.");
    } finally {
      setSaving(false);
    }
  };

  const handleVerificationRequest = async () => {
    setError(null);
    setMessage(null);
    try {
      const result = await requestVerification(user.email);
      setMessage(result.token_preview ? `${result.message} Dev token: ${result.token_preview}` : result.message);
    } catch (err) {
      setError(err instanceof AuthApiError ? err.message : "Could not request verification.");
    }
  };

  return (
    <main className="mx-auto max-w-3xl space-y-4 p-4">
      <Card>
        <CardHeader>
          <h1 className="text-lg font-semibold text-zinc-100">Account</h1>
        </CardHeader>
        <CardContent className="grid gap-3 text-sm text-zinc-300 md:grid-cols-2">
          <p><span className="text-zinc-500">Email:</span> {user.email}</p>
          <p><span className="text-zinc-500">Role:</span> {user.role}</p>
          <p><span className="text-zinc-500">Status:</span> {user.status}</p>
          <p><span className="text-zinc-500">Verification:</span> {user.email_verified_at ? "Verified" : "Pending"}</p>
          {!user.email_verified_at ? (
            <div className="md:col-span-2">
              <Button type="button" onClick={handleVerificationRequest}>
                Request verification email
              </Button>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-sm font-semibold text-zinc-100">Profile</h2>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSave}>
            <div>
              <label className="mb-1 block text-xs text-zinc-400">Nickname</label>
              <Input value={nickname} onChange={(event) => setNickname(event.target.value)} required />
            </div>
            <div>
              <label className="mb-1 block text-xs text-zinc-400">Avatar URL</label>
              <Input value={avatarUrl} onChange={(event) => setAvatarUrl(event.target.value)} />
            </div>
            <div>
              <label className="mb-1 block text-xs text-zinc-400">Bio</label>
              <Textarea rows={4} value={bio} onChange={(event) => setBio(event.target.value)} />
            </div>

            {error ? <p className="text-sm text-rose-400">{error}</p> : null}
            {message ? <p className="text-sm text-emerald-300">{message}</p> : null}

            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save profile"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
