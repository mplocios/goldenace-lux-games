import { useNavigate } from "@tanstack/react-router";
import { Play, Heart } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useFavorites } from "@/lib/favorites";

export interface Game {
  id: string;
  title: string;
  provider: string;
  image: string;
  players?: number;
  tag?: string;
}

export function GameCard({ game }: { game: Game }) {
  const { isFavorite, toggle } = useFavorites();
  const { user } = useAuth();
  const navigate = useNavigate();
  const fav = isFavorite(game.id);
  return (
    <button
      onClick={() => {
        if (!user) navigate({ to: "/login" });
      }}
      className="group relative aspect-[3/4] w-full overflow-hidden rounded-lg sm:rounded-xl border border-border/60 bg-card text-left transition-all duration-300 hover:-translate-y-1 hover:border-gold/70 hover:glow-gold-pulse">
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
        <span className="absolute left-1.5 top-1.5 sm:left-2 sm:top-2 rounded-full bg-gold-gradient px-1.5 py-0.5 text-[8px] sm:text-[10px] font-bold uppercase tracking-wider text-primary-foreground">
          {game.tag}
        </span>
      )}

      <span
        role="button"
        tabIndex={0}
        aria-label={fav ? "Remove from favorites" : "Add to favorites"}
        aria-pressed={fav}
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          toggle(game.id);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.stopPropagation();
            e.preventDefault();
            toggle(game.id);
          }
        }}
        className="absolute right-1.5 top-1.5 sm:right-2 sm:top-2 z-10 flex h-6 w-6 sm:h-8 sm:w-8 cursor-pointer items-center justify-center rounded-full border border-border/60 bg-background/70 text-muted-foreground backdrop-blur transition-colors hover:border-gold hover:text-gold"
      >
        <Heart className={`h-3 w-3 sm:h-4 sm:w-4 ${fav ? "fill-gold text-gold" : ""}`} />
      </span>

      <div className="absolute inset-x-0 bottom-0 p-2 sm:p-3">
        <p className="truncate font-display text-xs sm:text-sm font-semibold text-foreground">{game.title}</p>
        <p className="truncate text-[9px] sm:text-[11px] text-muted-foreground">{game.provider}</p>
        {game.players !== undefined && (
          <div className="mt-0.5 sm:mt-1 flex items-center gap-1 sm:gap-1.5 text-[9px] sm:text-[11px] text-gold">
            <span className="inline-block h-1 w-1 sm:h-1.5 sm:w-1.5 animate-pulse rounded-full bg-gold" />
            {game.players.toLocaleString()} playing
          </div>
        )}
      </div>

      <div className="absolute inset-0 flex items-center justify-center bg-background/60 opacity-0 backdrop-blur-sm transition-opacity duration-300 group-hover:opacity-100">
        <div className="flex h-10 w-10 sm:h-14 sm:w-14 items-center justify-center rounded-full bg-gold-gradient shadow-[var(--shadow-gold)]">
          <Play className="ml-0.5 h-4 w-4 sm:h-6 sm:w-6 fill-primary-foreground text-primary-foreground" />
        </div>
      </div>
    </button>
  );
}