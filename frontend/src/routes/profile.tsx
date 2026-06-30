import { useRef, useState } from "react";
import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import { ArrowLeft, ArrowDownCircle, ArrowUpCircle, TrendingUp, TrendingDown, Pencil, Check, X } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { apiUpdateNickname } from "@/lib/api";
import acecoin from "@/assets/acecoin.png";

export const Route = createFileRoute("/profile")({
  component: ProfilePage,
});

function fmt(d: string) {
  return new Date(d).toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

function ProfilePage() {
  const { user, updateName } = useAuth();
  const [tab, setTab] = useState<"transactions" | "history">("transactions");
  const [editing, setEditing] = useState(false);
  const [nickValue, setNickValue] = useState("");
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  if (!user) return <Navigate to="/login" />;

  const startEditing = () => {
    setNickValue(user.name);
    setEditing(true);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const saveNickname = async () => {
    const trimmed = nickValue.trim();
    if (!trimmed || trimmed === user.name) {
      setEditing(false);
      return;
    }
    setSaving(true);
    try {
      await apiUpdateNickname(user.token || "", trimmed);
      updateName(trimmed);
    } catch {}
    setSaving(false);
    setEditing(false);
  };

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
            {editing ? (
              <div className="flex items-center gap-2">
                <input
                  ref={inputRef}
                  value={nickValue}
                  onChange={(e) => setNickValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") saveNickname();
                    if (e.key === "Escape") setEditing(false);
                  }}
                  className="w-full rounded-lg border border-gold/40 bg-input px-3 py-2 font-sans text-2xl font-bold text-foreground outline-none focus:border-gold sm:text-3xl"
                  disabled={saving}
                />
                <button onClick={saveNickname} disabled={saving} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gold-gradient text-primary-foreground hover:opacity-90">
                  <Check className="h-4 w-4" />
                </button>
                <button onClick={() => setEditing(false)} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border/60 text-muted-foreground hover:text-foreground">
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <h1 className="font-sans text-3xl sm:text-4xl font-bold text-gold-gradient">{user.name}</h1>
                <button
                  onClick={startEditing}
                  className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-all hover:bg-secondary hover:text-gold"
                  aria-label="Edit nickname"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
            {user.playerId && (
              <p className="text-sm uppercase tracking-wider text-muted-foreground mt-1">Player ID · {user.playerId}</p>
            )}
            {user.mobile && <p className="text-sm text-muted-foreground">{user.mobile}</p>}
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
          user.transactions.length === 0 ? (
            <div className="rounded-b-xl border-x border-b border-border/60 bg-card/60 px-4 py-10 text-center text-sm text-muted-foreground">No records yet</div>
          ) : (
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
          )
        ) : (
          user.history.length === 0 ? (
            <div className="rounded-b-xl border-x border-b border-border/60 bg-card/60 px-4 py-10 text-center text-sm text-muted-foreground">No records yet</div>
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
          )
        )}
      </div>
    </div>
  );
}
