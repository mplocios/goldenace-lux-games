const providers = [
  "Pragmatic Play",
  "Evolution",
  "NetEnt",
  "Microgaming",
  "Play'n GO",
  "Red Tiger",
  "Hacksaw Gaming",
  "Nolimit City",
  "Push Gaming",
  "Big Time Gaming",
  "Yggdrasil",
  "Relax Gaming",
  "ELK Studios",
  "Thunderkick",
];

function ProviderBadge({ name }: { name: string }) {
  return (
    <span className="inline-flex shrink-0 items-center rounded-md border border-border/40 bg-card/40 px-4 py-2 font-display text-xs font-semibold uppercase tracking-widest text-muted-foreground/80 transition-colors hover:border-gold/40 hover:text-gold">
      {name}
    </span>
  );
}

export function ProviderMarquee() {
  return (
    <div className="space-y-3">
      <p className="text-center text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
        Powered by World-Class Providers
      </p>
      <div className="relative overflow-hidden">
        <div className="absolute left-0 top-0 z-10 h-full w-16 bg-gradient-to-r from-background to-transparent" />
        <div className="absolute right-0 top-0 z-10 h-full w-16 bg-gradient-to-l from-background to-transparent" />
        <div
          className="flex gap-3"
          style={{ animation: "marquee-reverse 60s linear infinite", width: "max-content" }}
        >
          {[...providers, ...providers].map((name, i) => (
            <ProviderBadge key={i} name={name} />
          ))}
        </div>
      </div>
    </div>
  );
}
