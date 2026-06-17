'use client';

import { SWRConfig } from 'swr';
import { Toaster } from '@/components/ui/sonner';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SWRConfig
      value={{
        revalidateOnFocus: true,
        shouldRetryOnError: false,
      }}
    >
      {children}
      <Toaster richColors closeButton />
    </SWRConfig>
  );
}
