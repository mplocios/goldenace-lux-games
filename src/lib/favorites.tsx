import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

type FavoritesCtx = {
  ids: string[];
  count: number;
  isFavorite: (id: string) => boolean;
  toggle: (id: string) => void;
  add: (id: string) => void;
  remove: (id: string) => void;
  clear: () => void;
};

const Ctx = createContext<FavoritesCtx | null>(null);
const KEY = "goldenace:favorites";

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [ids, setIds] = useState<string[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setIds(JSON.parse(raw));
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(ids));
    } catch {}
  }, [ids]);

  const value: FavoritesCtx = {
    ids,
    count: ids.length,
    isFavorite: (id) => ids.includes(id),
    toggle: (id) =>
      setIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id])),
    add: (id) => setIds((prev) => (prev.includes(id) ? prev : [...prev, id])),
    remove: (id) => setIds((prev) => prev.filter((x) => x !== id)),
    clear: () => setIds([]),
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useFavorites() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useFavorites must be used within FavoritesProvider");
  return ctx;
}