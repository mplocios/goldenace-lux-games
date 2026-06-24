import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import { ArrowLeft, ArrowDownCircle, ArrowUpCircle, TrendingUp, TrendingDown } from "lucide-react";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/profile")({
  head: () => ({ meta: [{ title: "Profile — GoldenAce" }] }),
  component: ProfilePage,
});

function fmt(d: string) {
  return new Date(d).toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

function ProfilePage() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;

  return (
    <div className="mx-auto min-h-screen max-w-3xl px-4 py-8 animate-fade-in">
      <Link to="/" className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-gold">
        <ArrowLeft className="h-4 w-4" /> Back
      </Link>

      <div className="rounded-2xl border border-gold/30 bg-card p-6 shadow-[var(--shadow-gold)]">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gold-gradient font-display text-2xl font-bold text-primary-foreground">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="font-display text-2xl text-gold-gradient">{user.name}</h1>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Player ID · {user.id}</p>
            <p className="text-xs text-muted-foreground">{user.email}</p>
          </div>
          <div className="ml-auto text-right">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Balance</p>
            <p className="font-display text-2xl text-gold">${user.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
          </div>
        </div>
      </div>

      <section className="mt-8">
        <h2 className="mb-3 font-display text-lg tracking-wide">Recent Transactions</h2>
        <ul className="divide-y divide-border/60 overflow-hidden rounded-xl border border-border/60 bg-card/60">
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
              <p className={`font-semibold ${t.kind === "deposit" ? "text-emerald-400" : "text-rose-400"}`}>
                {t.kind === "deposit" ? "+" : "-"}${t.amount.toLocaleString()}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-8">
        <h2 className="mb-3 font-display text-lg tracking-wide">Game History</h2>
        <ul className="divide-y divide-border/60 overflow-hidden rounded-xl border border-border/60 bg-card/60">
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
              <p className={`font-semibold ${h.result === "win" ? "text-emerald-400" : "text-rose-400"}`}>
                {h.result === "win" ? "+" : "-"}${h.amount.toLocaleString()}
              </p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}