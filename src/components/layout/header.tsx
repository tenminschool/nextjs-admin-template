'use client';

import { Menu, PanelLeft } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { navItems } from '@/lib/nav';
import { Button } from '@tenminuteschool/design-system';

interface HeaderProps {
  onToggleSidebar: () => void;
  onMobileMenuClick: () => void;
}

export function Header({ onToggleSidebar, onMobileMenuClick }: HeaderProps) {
  const pathname = usePathname();
  const title =
    navItems.find(
      (item) => pathname === item.href || pathname.startsWith(`${item.href}/`),
    )?.label ?? 'Dashboard';

  return (
    <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center border-b border-border/60 bg-background/70 px-4 backdrop-blur-xl backdrop-saturate-150">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 md:hidden"
          onClick={onMobileMenuClick}
          aria-label="Open menu"
        >
          <Menu size={16} />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="hidden h-8 w-8 text-muted-foreground hover:text-foreground md:flex"
          onClick={onToggleSidebar}
          aria-label="Toggle sidebar"
        >
          <PanelLeft size={16} />
        </Button>

        <span className="text-sm font-semibold tracking-tight">{title}</span>
      </div>
    </header>
  );
}
