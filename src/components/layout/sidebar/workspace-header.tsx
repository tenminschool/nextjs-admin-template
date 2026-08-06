'use client';

import { Logo } from '@/components/logo';
import { cn } from '@/lib/utils';
import { APP_NAME } from '@/constants';

export function WorkspaceHeader({ isCollapsed }: { isCollapsed: boolean }) {
  return (
    <div className="px-2 pt-3 pb-2">
      <div className="flex w-full items-center rounded-lg px-2 py-1.5">
        <Logo className="h-8 w-8 shrink-0" iconSize={15} />
        <div
          className={cn(
            'flex min-w-0 flex-1 items-center overflow-hidden transition-[max-width,margin-left,opacity] duration-300 ease-in-out',
            isCollapsed
              ? 'ml-0 max-w-0 opacity-0'
              : 'ml-2.5 max-w-[200px] opacity-100',
          )}
        >
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 whitespace-nowrap">
              <span className="truncate text-sm font-semibold tracking-tight text-sidebar-foreground">
                {APP_NAME}
              </span>
            </div>
            <p className="truncate text-[11px] text-sidebar-foreground/55">
              Internal workspace
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
