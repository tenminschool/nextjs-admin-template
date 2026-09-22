'use client';

import { NAV } from '@/lib/nav';
import { NavMain } from '@/components/layout/sidebar/nav-main';
import { SidebarSettings } from '@/components/layout/sidebar/sidebar-settings';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  useSidebar,
} from '@tenminuteschool/design-system';
import { useIsEmbedded } from '@/hooks/use-embedded';
import { APP_NAME } from '@/constants';
import { cn } from '@/lib/utils';

// The rail takes the app's own `--sidebar` tokens — near-white in light mode,
// dark in dark mode — rather than pinning itself to one surface.
//
// The account menu lives in the navbar (`layout/header-user.tsx`); the rail
// footer only carries its own display settings.
export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { isLarge, mode, setOpenMobile } = useSidebar();
  const isEmbedded = useIsEmbedded();

  return (
    <Sidebar
      // Inside HQ the host owns the primary rail, so this one steps down to a
      // secondary nav: flat and flush against the content instead of a floating
      // card competing with HQ's own.
      variant={isEmbedded ? 'sidebar' : 'floating'}
      collapsible="icon"
      className={cn(
        'z-40 text-sidebar-foreground',
        !isEmbedded &&
          'group-data-[state=expanded]:**:data-[slot=sidebar-inner]:shadow-xl',
      )}
      {...props}
    >
      {/* HQ hides our navbar, and with it the app name — so a secondary rail
          reintroduces it as its own heading. */}
      {isEmbedded && (
        <SidebarHeader className="h-11 shrink-0 justify-center border-b border-sidebar-border px-3">
          <span className="truncate text-[13px] font-semibold tracking-tight">
            {APP_NAME}
          </span>
        </SidebarHeader>
      )}

      <SidebarContent className="scrollbar-hide gap-1 py-1 group-data-[collapsible=icon]:overflow-y-auto!">
        <NavMain
          categories={NAV}
          onNavigate={() => {
            if (!isLarge) setOpenMobile(false);
          }}
        />
      </SidebarContent>

      {/* The mode picker is primary-rail chrome; embedded, the rail is pinned
          open and has nothing to switch between. */}
      {!isEmbedded && (
        <SidebarFooter className="gap-0 p-2 pt-0">
          <SidebarSettings />
        </SidebarFooter>
      )}

      {/* Drag-strip on the sidebar's edge: the desktop expand/collapse affordance,
          since both SidebarTriggers are mobile-only. Omitted when embedded (the
          mode is controlled and pinned open) and in hover mode, where toggling is
          a no-op — the rail would still light up on hover and then do nothing. */}
      {!isEmbedded && mode !== 'hover' && (
        // The rail paints a 2px line on hover to advertise itself; between the
        // sidebar's own border and the content card's, it reads as a third stray
        // rule. The 16px hit area and the cursor are affordance enough.
        <SidebarRail className="hover:after:bg-transparent" />
      )}
    </Sidebar>
  );
}
