'use client';

import Script from 'next/script';
import { useCallback, useEffect, useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { loginWithGoogleToken } from '@/lib/auth/api';
import { GOOGLE_CLIENT_ID, POST_LOGIN_REDIRECT } from '@/lib/auth/config';
import { setAccessToken, setStoredUser } from '@/lib/auth/storage';

interface CredentialResponse {
  credential?: string;
}

interface GoogleAccountsId {
  initialize: (config: {
    client_id: string;
    callback: (response: CredentialResponse) => void;
    ux_mode?: 'popup' | 'redirect';
    auto_select?: boolean;
    use_fedcm_for_prompt?: boolean;
  }) => void;
  renderButton: (parent: HTMLElement, options: Record<string, unknown>) => void;
  cancel: () => void;
}

declare global {
  interface Window {
    google?: {
      accounts: {
        id: GoogleAccountsId;
      };
    };
  }
}

export function GoogleSignIn() {
  const buttonRef = useRef<HTMLDivElement>(null);
  const [scriptReady, setScriptReady] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleCredential = useCallback(
    (res: CredentialResponse) => {
      if (!res.credential) {
        toast.error('Google sign-in failed. Please try again.');
        return;
      }

      startTransition(async () => {
        try {
          const { tokens, user } = await loginWithGoogleToken(res.credential!);
          setStoredUser(user);
          setAccessToken(tokens.accessToken);
          router.replace(POST_LOGIN_REDIRECT);
        } catch (err) {
          toast.error(
            err instanceof Error ? err.message : 'Google sign-in failed.',
          );
        }
      });
    },
    [router],
  );

  useEffect(() => {
    if (!scriptReady || !buttonRef.current) return;
    if (!GOOGLE_CLIENT_ID) {
      console.warn('NEXT_PUBLIC_GOOGLE_CLIENT_ID is not set.');
      return;
    }

    const gsi = window.google?.accounts.id;
    if (!gsi) return;

    gsi.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: handleCredential,
      ux_mode: 'popup',
      auto_select: false,
      use_fedcm_for_prompt: true,
    });

    gsi.renderButton(buttonRef.current, {
      theme: 'outline',
      size: 'large',
      type: 'standard',
      text: 'continue_with',
      width: buttonRef.current.offsetWidth,
    });

    return () => gsi.cancel();
  }, [scriptReady, handleCredential]);

  return (
    <>
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
        onReady={() => setScriptReady(true)}
      />
      <div className="relative">
        <div
          ref={buttonRef}
          className="flex min-h-[40px] w-full items-center justify-center"
        />
        {isPending && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/60 text-sm text-muted-foreground">
            Signing in…
          </div>
        )}
      </div>
    </>
  );
}
