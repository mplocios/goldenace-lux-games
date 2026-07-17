import { createContext, useContext, useEffect, useRef, useState, useCallback, type ReactNode } from "react";
import { useAuth } from "@/lib/auth";
import { apiFetchFavorites, apiAddFavorite, apiRemoveFavorite } from "@/lib/api";

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
  const { user } = useAuth();
  const loaded = useRef(false);

  useEffect(() => {
    loaded.current = false;
    const token = user?.token;
    if (token) {
      apiFetchFavorites(token).then((serverIds) => {
        setIds(serverIds);
        try { localStorage.setItem(KEY, JSON.stringify(serverIds)); } catch {}
        loaded.current = true;
      }).catch(() => {
        try {
          const raw = localStorage.getItem(KEY);
          if (raw) setIds(JSON.parse(raw));
        } catch {}
        loaded.current = true;
      });
    } else {
      try {
        const raw = localStorage.getItem(KEY);
        if (raw) setIds(JSON.parse(raw));
      } catch {}
      loaded.current = true;
    }
  }, [user?.token]);

  useEffect(() => {
    if (loaded.current) {
      try { localStorage.setItem(KEY, JSON.stringify(ids)); } catch {}
    }
  }, [ids]);

  const add = useCallback((id: string) => {
    setIds((prev) => {
      if (prev.includes(id)) return prev;
      return [...prev, id];
    });
    const token = user?.token;
    if (token) apiAddFavorite(token, id).catch(() => {});
  }, [user?.token]);

  const remove = useCallback((id: string) => {
    setIds((prev) => prev.filter((x) => x !== id));
    const token = user?.token;
    if (token) apiRemoveFavorite(token, id).catch(() => {});
  }, [user?.token]);

  const toggle = useCallback((id: string) => {
    setIds((prev) => {
      const removing = prev.includes(id);
      const token = user?.token;
      if (removing) {
        if (token) apiRemoveFavorite(token, id).catch(() => {});
        return prev.filter((x) => x !== id);
      } else {
        if (token) apiAddFavorite(token, id).catch(() => {});
        return [...prev, id];
      }
    });
  }, [user?.token]);

  const value: FavoritesCtx = {
    ids,
    count: ids.length,
    isFavorite: (id) => ids.includes(id),
    toggle,
    add,
    remove,
    clear: () => setIds([]),
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useFavorites() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useFavorites must be used within FavoritesProvider");
  return ctx;
}
