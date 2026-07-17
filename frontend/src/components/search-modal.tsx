import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Search, X, ArrowLeft, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { GameCard, type Game } from "@/components/game-card";
import { apiGetGames, type DbGame } from "@/lib/api";

function mapDbGame(g: DbGame): Game {
  return {
    id: g.uuid,
    title: g.name,
    provider: g.provider,
    image: g.thumbnail || g.image || "",
    tag: g.type === "live" ? "Live" : g.volatility === "high" ? "Hot" : undefined,
  };
}

const PAGE_SIZE = 50;

export function SearchModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [results, setResults] = useState<Game[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      document.body.style.overflow = "";
      setQuery("");
      setDebouncedQuery("");
      setResults([]);
      setPage(0);
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedQuery(query.trim());
      setPage(0);
    }, 350);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query]);

  const fetchResults = useCallback(async (q: string, p: number) => {
    if (!q) { setResults([]); setHasMore(false); return; }
    setLoading(true);
    try {
      const data = await apiGetGames({ q, limit: PAGE_SIZE + 1, offset: p * PAGE_SIZE });
      setHasMore(data.length > PAGE_SIZE);
      setResults(data.slice(0, PAGE_SIZE).map(mapDbGame));
    } catch {
      setResults([]);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchResults(debouncedQuery, page);
  }, [debouncedQuery, page, fetchResults]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <>
      {/* Overlay - hidden on mobile since modal is fullscreen */}
      <div className="fixed inset-0 z-[9999] hidden bg-black/70 backdrop-blur-sm md:block" onClick={onClose} />

      {/* Modal */}
      <div className="fixed inset-0 z-[9999] flex items-start justify-center md:items-center md:p-8">
        <div className="flex h-full w-full flex-col bg-background md:h-[85vh] md:max-h-[800px] md:max-w-4xl md:rounded-xl md:border md:border-border/60 md:shadow-2xl">
          {/* Header */}
          <div className="flex items-center gap-3 border-b border-border/40 px-4 py-3">
            <button
              onClick={onClose}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:bg-secondary hover:text-foreground"
              aria-label="Go back"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search games, providers, or categories..."
              className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
              autoComplete="off"
            />
            {query ? (
              <button
                onClick={() => setQuery("")}
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:bg-secondary hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            ) : (
              <Search className="h-5 w-5 shrink-0 text-muted-foreground" />
            )}
          </div>

          {/* Results */}
          <div className="flex-1 overflow-y-auto px-4 py-4">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-6 w-6 animate-spin text-gold" />
              </div>
            ) : !debouncedQuery ? (
              <p className="py-20 text-center text-sm text-muted-foreground">
                Type to search for games...
              </p>
            ) : results.length === 0 ? (
              <p className="py-20 text-center text-sm text-muted-foreground">
                No games found for "{debouncedQuery}"
              </p>
            ) : (
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
                {results.map((g) => (
                  <GameCard key={g.id} game={g} />
                ))}
              </div>
            )}
          </div>

          {/* Pagination */}
          {(page > 0 || hasMore) && results.length > 0 && (
            <div className="flex items-center justify-between border-t border-border/40 px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="flex items-center gap-1 rounded-md px-3 py-1.5 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </button>
              <span className="text-xs text-muted-foreground">Page {page + 1}</span>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={!hasMore}
                className="flex items-center gap-1 rounded-md px-3 py-1.5 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground disabled:opacity-40"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </>,
    document.body,
  );
}
