import { useEffect, useRef, useState } from "react";
import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  ArrowDownCircle,
  ArrowUpCircle,
  TrendingUp,
  TrendingDown,
  Clock,
  XCircle,
  Pencil,
  Check,
  X,
  Loader2,
} from "lucide-react";
import { Paginator } from "@/components/paginator";
import { useAuth } from "@/lib/auth";
import { apiUpdateNickname, apiGetTransactionHistory, type TransactionRecord } from "@/lib/api";
import acecoin from "@/assets/acecoin.png";

export const Route = createFileRoute("/profile")({
  component: ProfilePage,
});

const CHANNEL_LABELS: Record<string, string> = {
  KADA_GCASH: "GCash",
  KADA_MAYA: "Maya",
  KADA_QRPH: "QRPH",
  "KADA_GXCHPHM2XXX": "GCash",
  "KADA_PAPHPHM1XXX": "Maya",
  GCASH: "GCash",
  MAYA: "Maya",
};

function channelLabel(raw: string | null) {
  if (!raw) return "";
  return CHANNEL_LABELS[raw] || raw.replace(/^KADA_/, "");
}

function fmt(d: string) {
  return new Date(d).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getPaymentIconAndColor(r: TransactionRecord) {
  const status = (r.status || "").toLowerCase();

  if (status === "failed") {
    return {
      icon: <XCircle className="h-5 w-5 shrink-0 text-rose-400" />,
      amountColor: "text-rose-400",
    };
  }

  if (status === "processing" || status === "pending" || status === "paying") {
    return {
      icon: <Clock className="h-5 w-5 shrink-0 text-muted-foreground" />,
      amountColor: "text-muted-foreground",
    };
  }

  if (r.event === "deposit") {
    return {
      icon: <ArrowDownCircle className="h-5 w-5 shrink-0 text-emerald-400" />,
      amountColor: "text-emerald-400",
    };
  }

  return {
    icon: <ArrowUpCircle className="h-5 w-5 shrink-0 text-rose-400" />,
    amountColor: "text-rose-400",
  };
}

function StatusLabel({ status }: { status: string | null }) {
  const s = (status || "").toLowerCase();
  if (s === "success") return <span className="text-[10px] font-medium text-emerald-400">Success</span>;
  if (s === "failed") return <span className="text-[10px] font-medium text-rose-400">Failed</span>;
  return <span className="text-[10px] font-medium text-amber-400">Pending</span>;
}

const PAGE_SIZE = 10;

function ProfilePage() {
  const { user, updateName } = useAuth();
  const [tab, setTab] = useState<"transactions" | "games">("transactions");
  const [editing, setEditing] = useState(false);
  const [nickValue, setNickValue] = useState("");
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const [records, setRecords] = useState<TransactionRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);

  const source = tab === "games" ? "game" as const : "payment" as const;

  useEffect(() => {
    if (!user?.token) return;
    setLoading(true);
    apiGetTransactionHistory(user.token, { limit: PAGE_SIZE, offset: page * PAGE_SIZE, source })
      .then((res) => {
        setRecords(res.data);
        setTotal(res.total);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user?.token, page, source]);

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

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="mx-auto min-h-screen max-w-3xl px-4 py-8 animate-fade-in">
      <Link
        to="/"
        className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-gold"
      >
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
                <button
                  onClick={saveNickname}
                  disabled={saving}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gold-gradient text-primary-foreground hover:opacity-90"
                >
                  <Check className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setEditing(false)}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border/60 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <h1 className="font-sans text-3xl sm:text-4xl font-bold text-gold-gradient">
                  {user.name}
                </h1>
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
              <p className="text-sm uppercase tracking-wider text-muted-foreground mt-1">
                Player ID · {user.playerId}
              </p>
            )}
            {user.mobile && <p className="text-sm text-muted-foreground">{user.mobile}</p>}
          </div>
          <div className="text-center sm:text-right">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Balance</p>
            <div className="mt-1 flex items-center justify-center sm:justify-end gap-2">
              <img
                src={acecoin}
                alt="AceCoin"
                width={32}
                height={32}
                className="h-8 w-8 drop-shadow-[0_0_8px_rgba(212,175,55,0.4)]"
              />
              <p className="font-display text-3xl sm:text-4xl text-gold">
                {user.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </p>
            </div>
            <p className="text-xs uppercase tracking-[0.15em] text-gold/70 mt-0.5">AceCoin</p>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <div className="flex border-b border-border/60">
          {(["transactions", "games"] as const).map((t) => (
            <button
              key={t}
              onClick={() => { setTab(t); setPage(0); }}
              className={`flex-1 py-3 text-sm font-semibold tracking-wide transition-colors ${
                tab === t
                  ? "border-b-2 border-gold text-gold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t === "transactions" ? "Transactions" : "Game History"}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="rounded-b-xl border-x border-b border-border/60 bg-card/60 px-4 py-10 flex justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-gold" />
          </div>
        ) : records.length === 0 ? (
          <div className="rounded-b-xl border-x border-b border-border/60 bg-card/60 px-4 py-10 text-center text-sm text-muted-foreground">
            No records yet
          </div>
        ) : (
          <>
            <ul className="divide-y divide-border/60 overflow-hidden rounded-b-xl border-x border-b border-border/60 bg-card/60">
              {records.map((r) => {
                const amt = parseFloat(String(r.amount));
                const isGame = r.source === "game";

                if (isGame) {
                  const isPositive = r.event === "Win" || r.event === "Draw";
                  return (
                    <li key={`${r.source}-${r.id}`} className="flex items-center gap-3 px-4 py-3">
                      {isPositive ? (
                        <TrendingUp className="h-5 w-5 shrink-0 text-emerald-400" />
                      ) : (
                        <TrendingDown className="h-5 w-5 shrink-0 text-rose-400" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-foreground truncate">
                          <span className="font-medium">{r.gameName || "Game"}</span>
                          <span className="text-muted-foreground"> · {r.event}</span>
                        </p>
                        <p className="text-xs text-muted-foreground">{fmt(r.date)}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <div className={`flex items-center gap-1 font-semibold ${isPositive ? "text-emerald-400" : "text-rose-400"}`}>
                          {isPositive ? "+" : ""}
                          <img src={acecoin} alt="" width={14} height={14} className="h-3.5 w-3.5" />
                          {Math.abs(amt).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </div>
                        <p className="text-[10px] text-muted-foreground">
                          bal: {parseFloat(String(r.newBalance)).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                    </li>
                  );
                }

                const { icon, amountColor } = getPaymentIconAndColor(r);
                const isDeposit = r.event === "deposit";

                return (
                  <li key={`${r.source}-${r.id}`} className="flex items-center gap-3 px-4 py-3">
                    {icon}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground truncate">
                        <span className="capitalize font-medium">{r.event}</span>
                        {r.gameName && <span className="text-muted-foreground"> · {channelLabel(r.gameName)}</span>}
                      </p>
                      <div className="flex items-center gap-2">
                        <p className="text-xs text-muted-foreground">{fmt(r.date)}</p>
                        <StatusLabel status={r.status} />
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className={`flex items-center gap-1 font-semibold ${amountColor}`}>
                        {isDeposit ? "+" : "-"}
                        <img src={acecoin} alt="" width={14} height={14} className="h-3.5 w-3.5" />
                        {Math.abs(amt).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </div>
                      <p className="text-[10px] text-muted-foreground">
                        bal: {parseFloat(String(r.newBalance)).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>

            <div className="mt-4">
              <Paginator page={page + 1} totalPages={totalPages} total={total} onPageChange={(p) => setPage(p - 1)} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
