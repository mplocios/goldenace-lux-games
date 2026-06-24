import { useState } from "react";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import { GameCard } from "@/components/game-card";
import { categoryMap, type CategoryId } from "@/lib/games";
import { Button } from "@/components/ui/button";

const PAGE_SIZE = 50;

const isCategoryId = (s: string): s is CategoryId => s in categoryMap;

export const Route = createFileRoute("/category/$category")({
  head: ({ params }) => ({
    meta: [{ title: `${isCategoryId(params.category) ? categoryMap[params.category].label : "Games"} — GoldenAce` }],
  }),
  loader: ({ params }) => {
    if (!isCategoryId(params.category)) throw notFound();
    return { id: params.category };
  },
  component: CategoryPage,
  notFoundComponent: () => (
    <div className="p-10 text-center text-muted-foreground">Category not found.</div>
  ),
});

function CategoryPage() {
  const params = Route.useParams();
  const id = params.category as CategoryId;
  const cat = categoryMap[id];
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(cat.games.length / PAGE_SIZE));
  const start = (page - 1) * PAGE_SIZE;
  const items = cat.games.slice(start, start + PAGE_SIZE);

  return (
    <div className="mx-auto min-h-screen max-w-7xl px-4 py-8 animate-fade-in sm:px-6">
      <Link to="/" className="mb-4 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-gold">
        <ArrowLeft className="h-4 w-4" /> Back to home
      </Link>
      <header className="mb-6 flex items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl tracking-wide text-gold-gradient">{cat.label}</h1>
          <p className="text-sm text-muted-foreground">{cat.games.length} games · Page {page} of {totalPages}</p>
        </div>
      </header>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {items.map((g) => (
          <GameCard key={g.id} game={g} />
        ))}
      </div>

      <div className="mt-8 flex items-center justify-center gap-2">
        <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="border-gold/40">
          <ChevronLeft className="h-4 w-4" /> Prev
        </Button>
        {Array.from({ length: totalPages }).map((_, i) => (
          <button
            key={i}
            onClick={() => setPage(i + 1)}
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
    </div>
  );
}