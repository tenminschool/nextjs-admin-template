'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { X } from 'lucide-react';
import { navItems } from '@/lib/nav';
import { cn } from '@/lib/utils';
import { Logo } from '@/components/logo';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { WorkspaceHeader } from './sidebar/workspace-header';
import { UserFooter } from './sidebar/user-footer';
import { APP_NAME } from '@/constants';

interface SidebarProps {
  isCollapsed: boolean;
  isMobileOpen: boolean;
  onMobileClose: () => void;
}

interface NavLinkProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  isCollapsed: boolean;
  isActive: boolean;
  onClick?: () => void;
}

function NavLink({
  href,
  icon,
  label,
  isCollapsed,
  isActive,
  onClick,
}: NavLinkProps) {
  return (
    <Link
      href={href}
      onClick={onClick}
      aria-current={isActive ? 'page' : undefined}
      className={cn(
        'group relative flex items-center rounded-md px-3 py-2 text-sm transition-colors',
        isActive
          ? 'bg-sidebar-accent font-medium text-sidebar-foreground'
          : 'text-sidebar-foreground/65 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground',
      )}
    >
      <span
        aria-hidden
        className={cn(
          'absolute top-1/2 left-0 h-4 w-0.5 -translate-y-1/2 rounded-r-full bg-sidebar-primary transition-opacity duration-200',
          isActive && !isCollapsed ? 'opacity-100' : 'opacity-0',
        )}
      />
      <span
        className={cn(
          'shrink-0 transition-colors',
          isActive
            ? 'text-sidebar-primary'
            : 'text-sidebar-foreground/55 group-hover:text-sidebar-foreground/85',
        )}
      >
        {icon}
      </span>
      <span
        className={cn(
          'overflow-hidden whitespace-nowrap transition-[max-width,margin-left,opacity] duration-300 ease-in-out',
          isCollapsed
            ? 'ml-0 max-w-0 opacity-0'
            : 'ml-3 max-w-[160px] opacity-100',
        )}
      >
        {label}
      </span>
    </Link>
  );
}

function NavList({
  isCollapsed,
  pathname,
  onItemClick,
}: {
  isCollapsed: boolean;
  pathname: string;
  onItemClick?: () => void;
}) {
  return (
    <nav className="flex flex-1 flex-col gap-0.5 p-2">
      <TooltipProvider delayDuration={0}>
        {navItems.map(({ label, href, icon: Icon }) => {
          const link = (
            <NavLink
              key={href}
              href={href}
              icon={<Icon size={16} />}
              label={label}
              isCollapsed={isCollapsed}
              isActive={pathname === href || pathname.startsWith(`${href}/`)}
              onClick={onItemClick}
            />
          );
          if (!isCollapsed) return link;
          return (
            <Tooltip key={href}>
              <TooltipTrigger asChild>{link}</TooltipTrigger>
              <TooltipContent side="right" sideOffset={8}>
                {label}
              </TooltipContent>
            </Tooltip>
          );
        })}
      </TooltipProvider>
    </nav>
  );
}

export function Sidebar({
  isCollapsed,
  isMobileOpen,
  onMobileClose,
}: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={cn(
          'relative hidden shrink-0 flex-col overflow-hidden border-r border-sidebar-border/60 bg-sidebar md:flex',
          'transition-[width] duration-300 ease-luxe',
          isCollapsed ? 'w-16' : 'w-64',
        )}
      >
        <WorkspaceHeader isCollapsed={isCollapsed} />
        <NavList isCollapsed={isCollapsed} pathname={pathname} />
        <UserFooter isCollapsed={isCollapsed} />
      </aside>

      {/* Mobile drawer */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-30 flex w-72 flex-col border-r border-sidebar-border/70 bg-sidebar md:hidden',
          'transition-transform duration-300 ease-in-out',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex items-center gap-2 px-2 pt-3 pb-2">
          <div className="flex flex-1 items-center gap-2.5 rounded-lg px-2 py-1.5">
            <Logo className="h-8 w-8" iconSize={15} />
            <span className="truncate text-sm font-semibold tracking-tight text-sidebar-foreground">
              {APP_NAME}
            </span>
          </div>
          <button
            type="button"
            onClick={onMobileClose}
            className="flex h-8 w-8 items-center justify-center rounded-md text-sidebar-foreground/55 transition-colors hover:bg-sidebar-accent/70 hover:text-sidebar-foreground"
            aria-label="Close sidebar"
          >
            <X size={14} />
          </button>
        </div>
        <NavList
          isCollapsed={false}
          pathname={pathname}
          onItemClick={onMobileClose}
        />
        <UserFooter />
      </aside>
    </>
  );
}
