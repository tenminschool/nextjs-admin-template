'use client';

import { ChevronsUpDown, LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { Skeleton } from '@/components/ui/skeleton';
import { Spinner } from '@/components/ui/spinner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

function LogoutOverlay() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-0 z-[100] flex items-center justify-center bg-background/85 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div className="flex items-center gap-3 rounded-xl border bg-card px-5 py-4 shadow-lg animate-in zoom-in-95 duration-200">
        <Spinner className="size-4 text-muted-foreground" />
        <span className="text-sm font-medium">Signing you out…</span>
      </div>
    </div>
  );
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? '';
  const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
  return (first + last).toUpperCase() || 'U';
}

function Avatar({
  initials,
  size = 'sm',
}: {
  initials: string;
  size?: 'sm' | 'md';
}) {
  return (
    <span className="relative shrink-0">
      <span
        className={cn(
          'flex items-center justify-center rounded-full bg-primary font-semibold text-primary-foreground ring-1 ring-black/5',
          size === 'sm' ? 'h-8 w-8 text-[11px]' : 'h-9 w-9 text-[12px]',
        )}
      >
        {initials}
      </span>
      <span
        aria-hidden
        className={cn(
          'absolute right-0 bottom-0 rounded-full bg-emerald-500 ring-2 ring-sidebar',
          size === 'sm' ? 'h-2 w-2' : 'h-2.5 w-2.5',
        )}
      />
    </span>
  );
}

function FooterSkeleton({ isCollapsed }: { isCollapsed?: boolean }) {
  return (
    <div className="border-t border-sidebar-border/70 p-2">
      <div className="flex w-full items-center rounded-lg px-2 py-2">
        <Skeleton className="h-8 w-8 shrink-0 rounded-full" />
        <div
          className={cn(
            'flex flex-1 items-center overflow-hidden transition-[max-width,margin-left,opacity] duration-300 ease-in-out',
            isCollapsed
              ? 'ml-0 max-w-0 opacity-0'
              : 'ml-3 max-w-[200px] opacity-100',
          )}
        >
          <div className="min-w-0 flex-1 space-y-1.5">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-2.5 w-32" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function UserFooter({ isCollapsed }: { isCollapsed?: boolean }) {
  const { user, hydrated, logout, isLoggingOut } = useAuth();

  if (isLoggingOut) {
    return (
      <>
        <FooterSkeleton isCollapsed={isCollapsed} />
        <LogoutOverlay />
      </>
    );
  }

  if (!hydrated) return <FooterSkeleton isCollapsed={isCollapsed} />;

  const displayName = user?.name ?? '';
  const displayEmail = user?.username ?? '';
  const initials = user ? getInitials(user.name) : '··';

  return (
    <div className="border-t border-sidebar-border/70 p-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            aria-label="Account menu"
            className="group flex w-full items-center rounded-lg px-2 py-2 text-left transition-colors hover:bg-sidebar-accent/70"
          >
            <Avatar initials={initials} />
            <div
              className={cn(
                'flex min-w-0 flex-1 items-center overflow-hidden transition-[max-width,margin-left,opacity] duration-300 ease-in-out',
                isCollapsed
                  ? 'pointer-events-none ml-0 max-w-0 opacity-0'
                  : 'ml-3 max-w-[200px] opacity-100',
              )}
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium leading-tight text-sidebar-foreground">
                  {displayName}
                </p>
                <p className="mt-0.5 truncate text-[11px] leading-tight text-sidebar-foreground/55">
                  {displayEmail}
                </p>
              </div>
              <ChevronsUpDown
                size={14}
                className="ml-2 shrink-0 text-sidebar-foreground/40 transition-colors group-hover:text-sidebar-foreground/75"
              />
            </div>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          side="top"
          align="end"
          sideOffset={8}
          className="w-60"
        >
          <div className="flex items-center gap-3 p-2">
            <Avatar initials={initials} size="md" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium leading-tight">
                {displayName}
              </p>
              <p className="mt-0.5 truncate text-xs leading-tight text-muted-foreground">
                {displayEmail}
              </p>
            </div>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive" onSelect={() => logout()}>
            <LogOut size={14} />
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
