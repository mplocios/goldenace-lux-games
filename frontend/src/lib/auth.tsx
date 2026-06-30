import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { apiCheckLogin } from "@/lib/api";

export type TxKind = "deposit" | "withdraw";
export interface Transaction {
  id: string;
  kind: TxKind;
  amount: number;
  date: string;
}
export interface GamePlay {
  id: string;
  game: string;
  result: "win" | "loss";
  amount: number;
  date: string;
}
export interface User {
  id: string;
  playerId?: string;
  name: string;
  email: string;
  mobile?: string;
  token?: string;
  type?: string;
  balance: number;
  hasDeposited?: boolean;
  transactions: Transaction[];
  history: GamePlay[];
}

type AuthCtx = {
  user: User | null;
  loading: boolean;
  login: (mobile: string, token?: string, apiUser?: { id: number; playerId?: string; nickname?: string; mobile_number: string; type: string; user_type?: string; balance?: number }) => void;
  logout: () => void;
  updateName: (name: string) => void;
  adjustBalance: (delta: number, kind: TxKind) => void;
};

const Ctx = createContext<AuthCtx | null>(null);
const KEY = "goldenace:user";
const TOKEN_KEY = "goldenace:token";

function rand(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function seedDemoUser(email: string, name?: string): User {
  const games = ["Golden Pharaoh", "Lucky Dragon", "GoldenAce Crash", "Mines", "Lightning Roulette", "VIP Blackjack", "Plinko Royale"];
  const txs: Transaction[] = Array.from({ length: 6 }).map((_, i) => ({
    id: `tx-${Date.now()}-${i}`,
    kind: i % 2 === 0 ? "deposit" : "withdraw",
    amount: rand(50, 1500),
    date: new Date(Date.now() - i * 86400000 * rand(1, 4)).toISOString(),
  }));
  const history: GamePlay[] = Array.from({ length: 8 }).map((_, i) => {
    const win = Math.random() > 0.45;
    return {
      id: `gp-${Date.now()}-${i}`,
      game: games[rand(0, games.length - 1)],
      result: win ? "win" : "loss",
      amount: rand(10, 800),
      date: new Date(Date.now() - i * 3600000 * rand(2, 12)).toISOString(),
    };
  });
  return {
    id: "PLR-" + Math.random().toString(36).slice(2, 8).toUpperCase(),
    name: name || email.split("@")[0] || "Player",
    email,
    balance: 1250,
    transactions: txs,
    history,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(() => !!localStorage.getItem(TOKEN_KEY));

  const checked = useRef(false);

  useEffect(() => {
    if (checked.current) return;
    checked.current = true;

    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      localStorage.removeItem(KEY);
      setLoading(false);
      return;
    }

    apiCheckLogin(token)
      .then((data) => {
        setUser({
          id: String(data.user.id),
          playerId: data.user.playerId || undefined,
          name: data.user.nickname || data.user.playerId || data.user.mobile_number,
          email: "",
          mobile: data.user.mobile_number,
          token: data.token,
          type: data.user.type,
          balance: data.user.balance ?? 0,
          transactions: [],
          history: [],
        });
      })
      .catch(() => {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(KEY);
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    try {
      if (user) localStorage.setItem(KEY, JSON.stringify(user));
      else localStorage.removeItem(KEY);
    } catch {}
  }, [user]);

  const value: AuthCtx = {
    user,
    loading,
    login: (mobile, token, apiUser) => {
      if (token && apiUser) {
        localStorage.setItem(TOKEN_KEY, token);
        setUser({
          id: String(apiUser.id),
          playerId: apiUser.playerId || undefined,
          name: apiUser.nickname || apiUser.playerId || apiUser.mobile_number,
          email: "",
          mobile: apiUser.mobile_number,
          token,
          type: apiUser.type,
          balance: apiUser.balance ?? 0,
          transactions: [],
          history: [],
        });
      } else {
        setUser(seedDemoUser(mobile));
      }
    },
    logout: () => {
      localStorage.removeItem(TOKEN_KEY);
      setUser(null);
    },
    updateName: (name: string) => setUser((u) => u ? { ...u, name } : u),
    adjustBalance: (delta, kind) =>
      setUser((u) =>
        u
          ? {
              ...u,
              balance: Math.max(0, u.balance + delta),
              hasDeposited: u.hasDeposited || kind === "deposit",
              transactions: [
                {
                  id: `tx-${Date.now()}`,
                  kind,
                  amount: Math.abs(delta),
                  date: new Date().toISOString(),
                },
                ...u.transactions,
              ],
            }
          : u,
      ),
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}