import { useState } from "react";
import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import { ArrowLeft, ArrowDownCircle, ArrowUpCircle, TrendingUp, TrendingDown } from "lucide-react";
import { useAuth } from "@/lib/auth";
import acecoin from "@/assets/acecoin.png";

export const Route = createFileRoute("/profile")({
  component: ProfilePage,
});

function fmt(d: string) {
  return new Date(d).toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

function ProfilePage() {
  const { user } = useAuth();
  const [tab, setTab] = useState<"transactions" | "history">("transactions");
  if (!user) return <Navigate to="/login" />;

  return (
    <div className="mx-auto min-h-screen max-w-3xl px-4 py-8 animate-fade-in">
      <Link to="/" className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-gold">
        <ArrowLeft className="h-4 w-4" /> Back
      </Link>

      <div className="rounded-2xl border border-gold/30 bg-card p-6 sm:p-8 shadow-[var(--shadow-gold)]">
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center">
          <div className="flex h-20 w-20 sm:h-24 sm:w-24 items-center justify-center rounded-full bg-gold-gradient font-display text-3xl sm:text-4xl font-bold text-primary-foreground">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="text-center sm:text-left flex-1">
            <h1 className="font-display text-3xl sm:text-4xl text-gold-gradient">{user.name}</h1>
            <p className="text-sm uppercase tracking-wider text-muted-foreground mt-1">Player ID · {user.id}</p>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
          <div className="text-center sm:text-right">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Balance</p>
            <div className="mt-1 flex items-center justify-center sm:justify-end gap-2">
              <img src={acecoin} alt="AceCoin" width={32} height={32} className="h-8 w-8 drop-shadow-[0_0_8px_rgba(212,175,55,0.4)]" />
              <p className="font-display text-3xl sm:text-4xl text-gold">{user.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
            </div>
            <p className="text-xs uppercase tracking-[0.15em] text-gold/70 mt-0.5">AceCoin</p>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <div className="flex border-b border-border/60">
          <button
            onClick={() => setTab("transactions")}
            className={`flex-1 py-3 text-sm font-semibold tracking-wide transition-colors ${
              tab === "transactions"
                ? "border-b-2 border-gold text-gold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Transactions
          </button>
          <button
            onClick={() => setTab("history")}
            className={`flex-1 py-3 text-sm font-semibold tracking-wide transition-colors ${
              tab === "history"
                ? "border-b-2 border-gold text-gold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Game History
          </button>
        </div>

        {tab === "transactions" ? (
          <ul className="divide-y divide-border/60 overflow-hidden rounded-b-xl border-x border-b border-border/60 bg-card/60">
            {user.transactions.slice(0, 8).map((t) => (
              <li key={t.id} className="flex items-center gap-3 px-4 py-3">
                {t.kind === "deposit" ? (
                  <ArrowDownCircle className="h-5 w-5 text-emerald-400" />
                ) : (
                  <ArrowUpCircle className="h-5 w-5 text-rose-400" />
                )}
                <div className="flex-1">
                  <p className="text-sm capitalize text-foreground">{t.kind}</p>
                  <p className="text-xs text-muted-foreground">{fmt(t.date)}</p>
                </div>
                <div className={`flex items-center gap-1 font-semibold ${t.kind === "deposit" ? "text-emerald-400" : "text-rose-400"}`}>
                  {t.kind === "deposit" ? "+" : "-"}
                  <img src={acecoin} alt="" width={14} height={14} className="h-3.5 w-3.5" />
                  {t.amount.toLocaleString()}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <ul className="divide-y divide-border/60 overflow-hidden rounded-b-xl border-x border-b border-border/60 bg-card/60">
            {user.history.map((h) => (
              <li key={h.id} className="flex items-center gap-3 px-4 py-3">
                {h.result === "win" ? (
                  <TrendingUp className="h-5 w-5 text-emerald-400" />
                ) : (
                  <TrendingDown className="h-5 w-5 text-rose-400" />
                )}
                <div className="flex-1">
                  <p className="text-sm text-foreground">{h.game}</p>
                  <p className="text-xs text-muted-foreground">{fmt(h.date)}</p>
                </div>
                <div className={`flex items-center gap-1 font-semibold ${h.result === "win" ? "text-emerald-400" : "text-rose-400"}`}>
                  {h.result === "win" ? "+" : "-"}
                  <img src={acecoin} alt="" width={14} height={14} className="h-3.5 w-3.5" />
                  {h.amount.toLocaleString()}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
