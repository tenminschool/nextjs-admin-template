import { Command } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LogoProps {
  variant?: 'default' | 'inverse';
  iconSize?: number;
  className?: string;
}

export function Logo({
  variant = 'default',
  iconSize = 18,
  className,
}: LogoProps) {
  const palette =
    variant === 'inverse'
      ? 'bg-white text-zinc-950'
      : 'bg-foreground text-background';

  return (
    <div
      className={cn(
        'flex shrink-0 items-center justify-center rounded-lg shadow-sm ring-1 ring-black/5',
        palette,
        className,
      )}
    >
      <Command size={iconSize} strokeWidth={2.25} aria-hidden />
    </div>
  );
}
