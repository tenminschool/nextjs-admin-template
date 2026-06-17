'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { Spinner } from '@/components/ui/spinner';
import { getAccessToken } from '@/lib/auth/storage';
import { LOGIN_PATH } from '@/lib/auth/config';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [hasToken] = useState(() => {
    if (typeof window === 'undefined') return false;
    return Boolean(getAccessToken());
  });

  useEffect(() => {
    if (!hasToken) {
      router.replace(LOGIN_PATH);
    }
  }, [hasToken, router]);

  if (!hasToken) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner className="size-6 text-muted-foreground" />
      </div>
    );
  }

  return <DashboardShell>{children}</DashboardShell>;
}
