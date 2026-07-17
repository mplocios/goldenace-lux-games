import { useEffect, useState } from "react";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, Heart } from "lucide-react";
import { Paginator } from "@/components/paginator";
import { GameCard, type Game } from "@/components/game-card";
import { isValidCategory, categoryLabels, type CategoryId } from "@/lib/games";
import { useFavorites } from "@/lib/favorites";
import { GameCardSkeleton } from "@/components/game-skeleton";
import { useCategoryGames } from "@/lib/use-games";
import { apiGetGames } from "@/lib/api";

const PAGE_SIZE = 51;

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

  const [favGames, setFavGames] = useState<Game[]>([]);
  const [favLoading, setFavLoading] = useState(false);

  useEffect(() => {
    if (!isFav || ids.length === 0) {
      setFavGames([]);
      return;
    }
    setFavLoading(true);
    apiGetGames({ uuids: ids.join(",") })
      .then((dbGames) => {
        setFavGames(
          dbGames.map((g) => ({
            id: g.uuid,
            title: g.name,
            provider: g.provider,
            image: g.thumbnail || g.image || "",
          })),
        );
      })
      .catch(() => {})
      .finally(() => setFavLoading(false));
  }, [isFav, ids.join(",")]);

  const loading = isFav ? favLoading : catLoading;
  const games = isFav ? favGames : categoryGames;

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
          <p className="text-sm text-muted-foreground">{games.length} games</p>
        </div>
      </header>

      {!loading && totalPages > 1 && (
        <div className="mb-4">
          <p className="text-sm text-muted-foreground">
            Showing {items.length} of {games.length} games ({PAGE_SIZE} per page)
          </p>
          <div className="mt-2">
            <Paginator page={page} totalPages={totalPages} total={games.length} onPageChange={setPage} />
          </div>
        </div>
      )}

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

      {!loading && (
        <div className="mt-8">
          <Paginator page={page} totalPages={totalPages} total={games.length} onPageChange={setPage} />
        </div>
      )}
    </main>
  );
}
