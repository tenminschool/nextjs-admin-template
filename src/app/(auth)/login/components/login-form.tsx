'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { loginWithPassword } from '@/lib/auth/api';
import { POST_LOGIN_REDIRECT } from '@/lib/auth/config';
import { setAccessToken, setStoredUser } from '@/lib/auth/storage';

const loginSchema = z.object({
  email: z.email({ message: 'Please enter a valid email.' }).trim(),
  password: z.string().min(1, { message: 'Password is required.' }),
});

export function LoginForm() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const form = new FormData(e.currentTarget);
    const parsed = loginSchema.safeParse({
      email: form.get('email'),
      password: form.get('password'),
    });

    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? 'Invalid input.');
      return;
    }

    setLoading(true);
    try {
      const { tokens, user } = await loginWithPassword(
        parsed.data.email,
        parsed.data.password,
      );
      setStoredUser(user);
      setAccessToken(tokens.accessToken);
      router.replace(POST_LOGIN_REDIRECT);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Login failed.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          required
          className="h-11 text-[15px]"
          disabled={loading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          placeholder="••••••••"
          autoComplete="current-password"
          required
          className="h-11 text-[15px]"
          disabled={loading}
        />
      </div>

      <Button
        size="lg"
        className="h-11 w-full text-[15px]"
        type="submit"
        disabled={loading}
      >
        {loading ? <Spinner /> : 'Sign in'}
      </Button>
    </form>
  );
}
