import { ChevronRight } from "lucide-react";
import { GameCard, type Game } from "@/components/game-card";

interface GameRowProps {
  id?: string;
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  games: Game[];
}

export function GameRow({ id, title, subtitle, icon, games }: GameRowProps) {
  return (
    <section id={id} className="space-y-4">
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
        <button className="flex items-center gap-1 text-sm font-medium text-gold transition-colors hover:text-gold-bright">
          View all
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {games.map((g) => (
          <GameCard key={g.id} game={g} />
        ))}
      </div>
    </section>
  );
}