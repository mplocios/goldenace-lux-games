import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

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
  name: string;
  email: string;
  balance: number;
  transactions: Transaction[];
  history: GamePlay[];
}

type AuthCtx = {
  user: User | null;
  login: (email: string, name?: string) => void;
  logout: () => void;
  adjustBalance: (delta: number, kind: TxKind) => void;
};

const Ctx = createContext<AuthCtx | null>(null);
const KEY = "goldenace:user";

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

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setUser(JSON.parse(raw));
    } catch {}
  }, []);

  useEffect(() => {
    try {
      if (user) localStorage.setItem(KEY, JSON.stringify(user));
      else localStorage.removeItem(KEY);
    } catch {}
  }, [user]);

  const value: AuthCtx = {
    user,
    login: (email, name) => setUser(seedDemoUser(email, name)),
    logout: () => setUser(null),
    adjustBalance: (delta, kind) =>
      setUser((u) =>
        u
          ? {
              ...u,
              balance: Math.max(0, u.balance + delta),
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