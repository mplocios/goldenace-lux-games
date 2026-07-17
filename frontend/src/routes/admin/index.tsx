import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";
import { adminApi, type DashboardStats, type ChartPoint, type PlayerChartPoint } from "@/lib/admin-api";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Users, Coins, TrendingUp, TrendingDown, ArrowDownCircle, ArrowUpCircle,
  UserPlus, Activity, DollarSign, Wallet,
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from "recharts";

export const Route = createFileRoute("/admin/")({
  component: AdminDashboard,
});

function StatCard({ label, value, icon: Icon, sub, color = "text-gold" }: {
  label: string; value: string | number; icon: any; sub?: string; color?: string;
}) {
  return (
    <div className="rounded-xl border border-border/40 bg-card/60 p-4">
      <div className="flex items-start justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</p>
          <p className={`mt-1 font-display text-2xl font-bold ${color}`}>{value}</p>
          {sub && <p className="mt-0.5 text-[11px] text-muted-foreground">{sub}</p>}
        </div>
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted/40">
          <Icon className={`h-4 w-4 ${color}`} />
        </div>
      </div>
    </div>
  );
}

function fmt(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return n.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

function ChartTooltipContent({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border/40 bg-card p-3 shadow-lg">
      <p className="mb-1.5 text-xs font-medium text-muted-foreground">{label}</p>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex items-center gap-2 text-xs">
          <span className="h-2 w-2 rounded-full" style={{ background: p.color }} />
          <span className="text-muted-foreground">{p.name}:</span>
          <span className="font-semibold text-foreground">{fmt(p.value)}</span>
        </div>
      ))}
    </div>
  );
}

function AdminDashboard() {
  const { user } = useAuth();
  const token = user?.token || "";

  const stats = useQuery({ queryKey: ["admin", "dashboard"], queryFn: () => adminApi.dashboard(token), refetchInterval: 30000 });
  const revenue = useQuery({ queryKey: ["admin", "chart", "revenue"], queryFn: () => adminApi.revenueChart(token) });
  const players = useQuery({ queryKey: ["admin", "chart", "players"], queryFn: () => adminApi.playerChart(token) });

  const s: DashboardStats | undefined = stats.data;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Overview of your platform</p>
      </div>

      {/* KPI Cards */}
      {!s ? (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {Array.from({ length: 10 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            <StatCard label="Total Players" value={fmt(s.totalPlayers)} icon={Users} />
            <StatCard label="New Today" value={s.newPlayersToday} icon={UserPlus} color="text-emerald-400" />
            <StatCard label="Active Today" value={s.activePlayersToday} icon={Activity} color="text-sky-400" />
            <StatCard label="System Credits" value={fmt(s.totalCredits)} icon={Coins} />
            <StatCard label="Withdrawable" value={fmt(s.totalWithdrawable)} icon={Wallet} color="text-emerald-400" />
            <StatCard label="Turnover Today" value={fmt(s.turnoverToday)} icon={DollarSign} sub={`${s.betsToday} bets`} />
            <StatCard
              label="Net Win Today"
              value={fmt(s.netWinToday)}
              icon={s.netWinToday >= 0 ? TrendingUp : TrendingDown}
              color={s.netWinToday >= 0 ? "text-emerald-400" : "text-rose-400"}
            />
            <StatCard label="Payout Today" value={fmt(s.payoutToday)} icon={TrendingDown} color="text-amber-400" />
            <StatCard label="Deposits" value={fmt(s.totalDepositAmount)} icon={ArrowDownCircle} sub={`${s.totalDeposits} total`} color="text-emerald-400" />
            <StatCard label="Withdrawals" value={fmt(s.totalWithdrawalAmount)} icon={ArrowUpCircle} sub={`${s.totalWithdrawals} total`} color="text-rose-400" />
          </div>
        </>
      )}

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Revenue Chart */}
        <div className="rounded-xl border border-border/40 bg-card/60 p-4 md:p-5">
          <h2 className="mb-4 font-display text-base font-semibold text-foreground">Revenue (14 Days)</h2>
          {revenue.isLoading ? (
            <Skeleton className="h-64" />
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={revenue.data || []}>
                <defs>
                  <linearGradient id="gTurnover" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#d4af37" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#d4af37" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gPayout" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="date" tick={{ fill: "#888", fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fill: "#888", fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={fmt} width={50} />
                <Tooltip content={<ChartTooltipContent />} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Area type="monotone" dataKey="totalTurnover" name="Turnover" stroke="#d4af37" fill="url(#gTurnover)" strokeWidth={2} />
                <Area type="monotone" dataKey="totalPayout" name="Payout" stroke="#f97316" fill="url(#gPayout)" strokeWidth={2} />
                <Area type="monotone" dataKey="netWin" name="Net Win" stroke="#34d399" fill="none" strokeWidth={2} strokeDasharray="4 4" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Players Chart */}
        <div className="rounded-xl border border-border/40 bg-card/60 p-4 md:p-5">
          <h2 className="mb-4 font-display text-base font-semibold text-foreground">Players (14 Days)</h2>
          {players.isLoading ? (
            <Skeleton className="h-64" />
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={players.data || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="date" tick={{ fill: "#888", fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fill: "#888", fontSize: 11 }} tickLine={false} axisLine={false} width={35} />
                <Tooltip content={<ChartTooltipContent />} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="newPlayers" name="New Signups" fill="#d4af37" radius={[4, 4, 0, 0]} />
                <Bar dataKey="activePlayers" name="Active" fill="#38bdf8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
