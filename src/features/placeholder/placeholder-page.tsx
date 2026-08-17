/**
 * Stand-in page for the dummy `Menu 1/2/3` nav entries — delete this folder,
 * `app/(dashboard)/menu-*\/` and the "Examples" section in `lib/nav.ts` once
 * real features replace them.
 */
export function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="flex flex-col gap-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold leading-[1.1] sm:text-4xl">
          {title}
        </h1>
        <p className="max-w-2xl text-[15px] leading-relaxed text-muted-foreground">
          Placeholder route wired to the sidebar. Swap it for a real feature
          under <code className="font-mono text-[13px]">src/features/</code>.
        </p>
      </div>

      <div className="rounded-xl border border-dashed border-border/70 p-12 text-center">
        <p className="text-sm text-muted-foreground">
          Nothing here yet — {title.toLowerCase()} content goes here.
        </p>
      </div>
    </div>
  );
}
