import { useEffect, useState } from "react";
import { apiGetGames, type DbGame } from "./api";
import type { Game } from "@/components/game-card";

function mapDbGame(g: DbGame): Game {
  return {
    id: g.uuid,
    title: g.name,
    provider: g.provider,
    image: g.thumbnail || g.image || "",
    tag: g.type === "live" ? "Live"
      : g.volatility === "high" ? "Hot"
      : g.provider === "gg" ? "Original"
      : undefined,
  };
}

export type CategoryKey = "casino" | "slots" | "live" | "originals" | "tables" | "crash" | "bingo";

const LIVE_TYPES = ["live", "blackjack", "baccarat", "roulette", "poker", "game_shows", "monopoly", "money wheel", "megaball", "dice", "sic bo", "dragon tiger", "andar bahar", "craps"];
const TABLE_TYPES = ["table", "card"];
const CRASH_TYPES = ["crash", "instant", "instant win"];
const BINGO_TYPES = ["bingo"];

export interface GameCategories {
  casino: Game[];
  slots: Game[];
  live: Game[];
  originals: Game[];
  tables: Game[];
  crash: Game[];
  bingo: Game[];
}

const emptyCategories: GameCategories = {
  casino: [],
  slots: [],
  live: [],
  originals: [],
  tables: [],
  crash: [],
  bingo: [],
};

export function useGames(limitPerCategory = 10) {
  const [categories, setCategories] = useState<GameCategories>(emptyCategories);
  const [allGames, setAllGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [slots, live, blackjack, baccarat, roulette, pokerG, gameShows, gg, tables, card, crash, instant, instantWin, bingo] = await Promise.all([
          apiGetGames({ type: "slots", limit: limitPerCategory }),
          apiGetGames({ type: "live", limit: limitPerCategory }),
          apiGetGames({ type: "blackjack", limit: limitPerCategory }),
          apiGetGames({ type: "baccarat", limit: limitPerCategory }),
          apiGetGames({ type: "roulette", limit: limitPerCategory }),
          apiGetGames({ type: "poker", limit: limitPerCategory }),
          apiGetGames({ type: "game_shows", limit: limitPerCategory }),
          apiGetGames({ provider: "gg", limit: limitPerCategory }),
          apiGetGames({ type: "table", limit: limitPerCategory }),
          apiGetGames({ type: "card", limit: limitPerCategory }),
          apiGetGames({ type: "crash", limit: limitPerCategory }),
          apiGetGames({ type: "instant", limit: limitPerCategory }),
          apiGetGames({ type: "instant win", limit: limitPerCategory }),
          apiGetGames({ type: "bingo", limit: limitPerCategory }),
        ]);

        if (cancelled) return;

        const slotsMapped = slots.map(mapDbGame);
        const liveMapped = [...live, ...blackjack, ...baccarat, ...roulette, ...pokerG, ...gameShows]
          .slice(0, limitPerCategory)
          .map(mapDbGame);
        const originalsMapped = gg.map(mapDbGame);
        const tablesMapped = [...tables, ...card].slice(0, limitPerCategory).map(mapDbGame);
        const crashMapped = [...crash, ...instant, ...instantWin].slice(0, limitPerCategory).map(mapDbGame);
        const bingoMapped = bingo.map(mapDbGame);

        const featured = [
          ...slotsMapped.slice(0, 3),
          ...liveMapped.slice(0, 3),
          ...originalsMapped.slice(0, 2),
          ...tablesMapped.slice(0, 2),
        ];

        const cats: GameCategories = {
          casino: featured,
          slots: slotsMapped,
          live: liveMapped,
          originals: originalsMapped,
          tables: tablesMapped,
          crash: crashMapped,
          bingo: bingoMapped,
        };

        setCategories(cats);

        const all = [...slotsMapped, ...liveMapped, ...originalsMapped, ...tablesMapped, ...crashMapped, ...bingoMapped];
        const seen = new Set<string>();
        setAllGames(all.filter((g) => {
          if (seen.has(g.id)) return false;
          seen.add(g.id);
          return true;
        }));
      } catch (e) {
        console.error("Failed to load games:", e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [limitPerCategory]);

  return { categories, allGames, loading };
}

function getTypesForCategory(category: string): { types: string[]; provider?: string } {
  switch (category) {
    case "casino": return { types: ["slots", "live", "table", "crash"] };
    case "slots": return { types: ["slots"] };
    case "live": return { types: LIVE_TYPES };
    case "originals": return { types: [], provider: "gg" };
    case "tables": return { types: TABLE_TYPES };
    case "crash": return { types: CRASH_TYPES };
    case "bingo": return { types: BINGO_TYPES };
    default: return { types: [category] };
  }
}

export function useCategoryGames(category: string, limit?: number, offset?: number) {
  const [games, setGames] = useState<Game[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    async function load() {
      try {
        const { types, provider } = getTypesForCategory(category);

        let results: DbGame[];
        if (provider) {
          results = await apiGetGames({ provider, limit, offset });
        } else {
          const fetches = await Promise.all(
            types.map((t) => apiGetGames({ type: t, limit, offset })),
          );
          results = fetches.flat();
        }

        if (cancelled) return;
        const mapped = results.map(mapDbGame);
        setGames(mapped);
        setTotal(mapped.length);
      } catch (e) {
        console.error("Failed to load category games:", e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [category, limit, offset]);

  return { games, total, loading };
}
