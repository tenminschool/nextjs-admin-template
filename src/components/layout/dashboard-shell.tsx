'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { AppSidebar } from '@/components/layout/sidebar/app-sidebar';
import {
  SidebarProvider,
  SidebarTrigger,
} from '@tenminuteschool/design-system';
import { useIsEmbedded } from '@/hooks/use-embedded';
import { FullBleedContext } from './full-bleed-context';
import { Header } from './header';

/**
 * Navbar height, and the offset the fixed rail hangs from — the rail is
 * positioned against the viewport while the content sits in flow, so both read
 * this one value. Zero when embedded, where there is no navbar.
 */
const HEADER_HEIGHT = '3.5rem';

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const [fullBleed, setFullBleed] = useState(false);
  const isEmbedded = useIsEmbedded();

  return (
    <SidebarProvider
      className="h-svh flex-col overflow-hidden"
      // A secondary rail is pinned open — there is no mode to switch, and HQ's
      // own rail is the one that collapses.
      mode={isEmbedded ? 'expanded' : undefined}
      onModeChange={isEmbedded ? () => {} : undefined}
      style={
        {
          '--sidebar-offset-top': isEmbedded ? '0px' : HEADER_HEIGHT,
        } as React.CSSProperties
      }
    >
      {/* Inside HQ the host draws the navbar; a second one would just stack. */}
      {!isEmbedded && <Header />}

      <div className="flex min-h-0 flex-1">
        <AppSidebar />
        {/* Embedded, the rail runs flush to the top edge like a secondary nav,
            so the inset the navbar used to provide moves onto the content. */}
        <main
          className={cn(
            'flex min-w-0 flex-1 flex-col overflow-hidden',
            isEmbedded && 'pt-2',
          )}
        >
          <div className="mr-4 mb-4 ml-2 flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-border bg-background shadow-sm">
            <div
              className={cn(
                'scrollbar-hide flex min-h-0 flex-1 flex-col',
                fullBleed ? 'overflow-hidden' : 'overflow-y-auto',
              )}
            >
              <div
                className={cn(
                  'flex min-h-0 w-full min-w-0 flex-1 flex-col',
                  fullBleed ? 'h-full' : 'p-6',
                )}
              >
                <FullBleedContext.Provider value={setFullBleed}>
                  {children}
                </FullBleedContext.Provider>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Below `lg` the rail is a drawer opened from the navbar — which is gone
          when embedded, so the trigger has to float instead. */}
      {isEmbedded && (
        <SidebarTrigger className="fixed top-3 left-3 z-50 size-8 rounded-lg border border-border bg-background shadow-sm lg:hidden" />
      )}
    </SidebarProvider>
  );
}
