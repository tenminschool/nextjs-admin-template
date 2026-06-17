import type { Metadata } from 'next';
import { Separator } from '@/components/ui/separator';
import { Logo } from '@/components/logo';
import { LoginForm } from './components/login-form';
import { GoogleSignIn } from './components/google-sign-in';
import { APP_NAME } from '@/constants';

export const metadata: Metadata = {
  title: `Sign in — ${APP_NAME}`,
};

export default function LoginPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center gap-2.5 lg:hidden">
        <Logo className="h-9 w-9" iconSize={18} />
        <span className="text-base font-semibold tracking-tight">
          {APP_NAME}
        </span>
      </div>

      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">
          Sign in to your account
        </h1>
        <p className="text-sm text-muted-foreground">
          Welcome back. Enter your credentials to continue.
        </p>
      </div>

      <LoginForm />

      <div className="flex items-center gap-3">
        <Separator className="flex-1" />
        <span className="text-xs uppercase tracking-wider text-muted-foreground">
          or
        </span>
        <Separator className="flex-1" />
      </div>
      <GoogleSignIn />
    </div>
  );
}
