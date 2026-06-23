import { useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import { GameCard, type Game } from "@/components/game-card";
import { slotGames, liveGames, originals, tableGames } from "@/lib/games";

const ALL: Game[] = [...slotGames, ...liveGames, ...originals, ...tableGames];

export function GameSearch() {
  const [q, setQ] = useState("");

  const results = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return [];
    return ALL.filter(
      (g) =>
        g.title.toLowerCase().includes(term) || g.provider.toLowerCase().includes(term),
    ).slice(0, 12);
  }, [q]);

  return (
    <section className="space-y-4">
      <div className="relative">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gold" />
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search games or providers…"
          className="h-12 w-full rounded-xl border border-gold/30 bg-card/60 pl-11 pr-11 text-sm text-foreground placeholder:text-muted-foreground backdrop-blur transition-colors focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30"
          aria-label="Search games"
        />
        {q && (
          <button
            onClick={() => setQ("")}
            className="absolute right-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground hover:bg-secondary hover:text-gold"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
      {q && (
        <div>
          {results.length === 0 ? (
            <p className="rounded-lg border border-border/60 bg-card/60 p-4 text-sm text-muted-foreground">
              No games match "{q}".
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
              {results.map((g) => (
                <GameCard key={g.id} game={g} />
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
}