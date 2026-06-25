import { ChevronRight } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { GameCard, type Game } from "@/components/game-card";

interface GameRowProps {
  id?: string;
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  games: Game[];
  categorySlug?: string;
}

export function GameRow({ id, title, subtitle, icon, games, categorySlug }: GameRowProps) {
  return (
    <section id={id} className="space-y-4 animate-fade-in">
      <div className="flex items-end justify-between gap-4">
        <div className="flex items-center gap-3">
          {icon && (
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gold-gradient text-primary-foreground shadow-[var(--shadow-gold)]">
              {icon}
            </div>
          )}
          <div>
            <h2 className="font-display text-xl font-semibold tracking-wide text-foreground sm:text-2xl">{title}</h2>
            {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
          </div>
        </div>
        {categorySlug ? (
          <Link
            to="/category/$category"
            params={{ category: categorySlug }}
            className="flex items-center gap-1 text-sm font-medium text-gold transition-colors hover:text-gold-bright"
          >
            View all
            <ChevronRight className="h-4 w-4" />
          </Link>
        ) : (
          <span className="flex items-center gap-1 text-sm font-medium text-gold/60">View all<ChevronRight className="h-4 w-4" /></span>
        )}
      </div>

      {/* Mobile: horizontal slider; Desktop: grid */}
      <div className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pt-2 -mt-2 pb-2 scrollbar-hide sm:mx-0 sm:px-0 sm:grid sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {games.map((g) => (
          <div key={g.id} className="w-28 shrink-0 snap-start sm:w-auto">
            <GameCard game={g} />
          </div>
        ))}
      </div>
    </section>
  );
}