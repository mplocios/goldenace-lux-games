import { useState } from "react";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, ChevronLeft, ChevronRight, Heart } from "lucide-react";
import { GameCard } from "@/components/game-card";
import { isValidCategory, categoryLabels, type CategoryId } from "@/lib/games";
import { Button } from "@/components/ui/button";
import { useFavorites } from "@/lib/favorites";
import { GameCardSkeleton } from "@/components/game-skeleton";
import { useCategoryGames, useGames } from "@/lib/use-games";

const PAGE_SIZE = 50;

const isValid = (s: string) => s === "favorites" || isValidCategory(s);

export const Route = createFileRoute("/category/$category")({
  loader: ({ params }) => {
    if (!isValid(params.category)) throw notFound();
    return { id: params.category };
  },
  component: CategoryPage,
  notFoundComponent: () => (
    <div className="p-10 text-center text-muted-foreground">Category not found.</div>
  ),
  errorComponent: () => (
    <div className="p-10 text-center text-muted-foreground">Something went wrong loading this category.</div>
  ),
});

function CategoryPage() {
  const params = Route.useParams();
  const slug = params.category;
  const { ids } = useFavorites();
  const isFav = slug === "favorites";

  const { games: categoryGames, loading: catLoading } = useCategoryGames(
    isFav ? "casino" : slug,
    500,
  );
  const { allGames, loading: allLoading } = useGames(50);

  const loading = isFav ? allLoading : catLoading;

  const games = isFav
    ? (() => {
        const seen = new Set<string>();
        return allGames.filter((g) => {
          if (!ids.includes(g.id) || seen.has(g.id)) return false;
          seen.add(g.id);
          return true;
        });
      })()
    : categoryGames;

  const label = isFav ? "Your Favorites" : (categoryLabels[slug as CategoryId] || slug);

  const [page, setPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(games.length / PAGE_SIZE));
  const start = (page - 1) * PAGE_SIZE;
  const items = games.slice(start, start + PAGE_SIZE);

  return (
    <main className="mx-auto min-h-dvh max-w-7xl px-4 py-8 animate-fade-in sm:px-6">
      <Link to="/" className="mb-4 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-gold">
        <ArrowLeft className="h-4 w-4" /> Back to home
      </Link>
      <header className="mb-6 flex items-end justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 font-display text-3xl tracking-wide text-gold-gradient">
            {isFav && <Heart className="h-6 w-6 fill-gold text-gold" aria-hidden="true" />}
            {label}
          </h1>
          <p className="text-sm text-muted-foreground">{games.length} games · Page {page} of {totalPages}</p>
        </div>
      </header>

      {isFav && games.length === 0 && !loading ? (
        <div className="rounded-2xl border border-dashed border-gold/30 bg-card/40 p-10 text-center">
          <Heart className="mx-auto h-10 w-10 text-gold/60" aria-hidden="true" />
          <p className="mt-3 font-display text-lg text-foreground">No favorites yet</p>
          <p className="mt-1 text-sm text-muted-foreground">Tap the heart on any game to save it here.</p>
          <Link
            to="/category/$category"
            params={{ category: "casino" }}
            className="mt-5 inline-flex items-center justify-center rounded-md bg-gold-gradient px-4 py-2 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-gold)]"
          >
            Browse featured games
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-2 pt-2 -mt-2 sm:gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {loading
            ? Array.from({ length: 12 }).map((_, i) => <GameCardSkeleton key={i} />)
            : items.map((g) => <GameCard key={g.id} game={g} />)}
        </div>
      )}

      {!loading && totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="border-gold/40">
            <ChevronLeft className="h-4 w-4" /> Prev
          </Button>
          {Array.from({ length: Math.min(totalPages, 10) }).map((_, i) => (
            <button
              key={i}
              onClick={() => setPage(i + 1)}
              aria-label={`Go to page ${i + 1}`}
              aria-current={page === i + 1 ? "page" : undefined}
              className={`h-9 w-9 rounded-md text-sm font-medium transition-colors ${
                page === i + 1 ? "bg-gold-gradient text-primary-foreground" : "border border-border/60 text-foreground hover:border-gold hover:text-gold"
              }`}
            >
              {i + 1}
            </button>
          ))}
          <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="border-gold/40">
            Next <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </main>
  );
}
