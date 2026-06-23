import { Play } from "lucide-react";

export interface Game {
  id: string;
  title: string;
  provider: string;
  image: string;
  players?: number;
  tag?: string;
}

export function GameCard({ game }: { game: Game }) {
  return (
    <button className="group relative aspect-[3/4] w-full overflow-hidden rounded-xl border border-border/60 bg-card text-left transition-all duration-300 hover:-translate-y-1 hover:border-gold/70 hover:shadow-[var(--shadow-gold)]">
      <img
        src={game.image}
        alt={game.title}
        loading="lazy"
        width={400}
        height={533}
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent opacity-90" />

      {game.tag && (
        <span className="absolute left-2 top-2 rounded-full bg-gold-gradient px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary-foreground">
          {game.tag}
        </span>
      )}

      <div className="absolute inset-x-0 bottom-0 p-3">
        <p className="truncate font-display text-sm font-semibold text-foreground">{game.title}</p>
        <p className="truncate text-[11px] text-muted-foreground">{game.provider}</p>
        {game.players !== undefined && (
          <div className="mt-1 flex items-center gap-1.5 text-[11px] text-gold">
            <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-gold" />
            {game.players.toLocaleString()} playing
          </div>
        )}
      </div>

      <div className="absolute inset-0 flex items-center justify-center bg-background/60 opacity-0 backdrop-blur-sm transition-opacity duration-300 group-hover:opacity-100">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gold-gradient shadow-[var(--shadow-gold)]">
          <Play className="ml-0.5 h-6 w-6 fill-primary-foreground text-primary-foreground" />
        </div>
      </div>
    </button>
  );
}