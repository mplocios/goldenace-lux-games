import { createFileRoute, Link } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";
import { adminApi, type BetRow } from "@/lib/admin-api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  ArrowLeft, Coins, Ban,
  ShieldCheck, ShieldOff, Loader2, Wallet, TrendingUp,
  ArrowDownCircle, ArrowUpCircle, Gamepad2, Activity,
} from "lucide-react";
import { Paginator } from "@/components/paginator";

export const Route = createFileRoute("/admin/player/$id")({
  component: PlayerDetailPage,
});

function PlayerDetailPage() {
  const { id } = Route.useParams();
  const { user } = useAuth();
  const token = user?.token || "";
  const qc = useQueryClient();

  const [txPage, setTxPage] = useState(0);
  const [betPage, setBetPage] = useState(0);
  const txLimit = 10;
  const betLimit = 10;

  const q = useQuery({
    queryKey: ["admin", "player", id, txPage, betPage],
    queryFn: () =>
      adminApi.playerDetail(token, +id, {
        txLimit,
        txOffset: txPage * txLimit,
        betLimit,
        betOffset: betPage * betLimit,
      }),
  });

  const p = q.data?.player;
  const stats = q.data?.stats;
  const txTotal = q.data?.transactions?.total || 0;
  const txPages = Math.ceil(txTotal / txLimit);
  const betTotal = q.data?.bets?.total || 0;
  const betPages = Math.ceil(betTotal / betLimit);

  // Credit dialog
  const [creditOpen, setCreditOpen] = useState(false);
  const [creditAction, setCreditAction] = useState<"grant" | "deduct">("grant");
  const [creditAmount, setCreditAmount] = useState("");
  const [creditRemarks, setCreditRemarks] = useState("");
  const [creditError, setCreditError] = useState("");

  const creditMut = useMutation({
    mutationFn: (body: { amount: number; action: "grant" | "deduct"; remarks?: string }) =>
      adminApi.grantCredits(token, +id, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "player", id] });
      setCreditOpen(false);
      setCreditAmount("");
      setCreditRemarks("");
      setCreditError("");
    },
    onError: (e: Error) => setCreditError(e.message),
  });

  // Ban dialog
  const [banOpen, setBanOpen] = useState(false);
  const [banAction, setBanAction] = useState<"ban" | "suspend" | "unban">("ban");
  const [banDuration, setBanDuration] = useState("7");
  const [banError, setBanError] = useState("");

  const banMut = useMutation({
    mutationFn: (body: { action: "ban" | "suspend" | "unban"; duration?: number }) =>
      adminApi.banPlayer(token, +id, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "player", id] });
      setBanOpen(false);
      setBanError("");
    },
    onError: (e: Error) => setBanError(e.message),
  });

  function eventBadge(event: string) {
    switch (event) {
      case "deposit": return <Badge className="bg-emerald-600/20 text-emerald-400 text-[10px]">Deposit</Badge>;
      case "withdraw": return <Badge className="bg-rose-600/20 text-rose-400 text-[10px]">Withdraw</Badge>;
      case "admin_grant": return <Badge className="bg-sky-600/20 text-sky-400 text-[10px]">Admin Grant</Badge>;
      case "admin_deduct": return <Badge className="bg-amber-600/20 text-amber-400 text-[10px]">Admin Deduct</Badge>;
      default: return <Badge variant="outline" className="text-[10px]">{event}</Badge>;
    }
  }

  function statusBadge(s: string) {
    if (s === "banned") return <Badge variant="destructive" className="text-[10px]">Banned</Badge>;
    if (s === "suspended") return <Badge variant="outline" className="border-amber-500/40 text-amber-400 text-[10px]">Suspended</Badge>;
    return <Badge variant="outline" className="border-emerald-500/40 text-emerald-400 text-[10px]">Active</Badge>;
  }

  if (q.isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}
        </div>
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  if (!p) {
    return (
      <div className="py-20 text-center">
        <p className="text-lg text-muted-foreground">Player not found</p>
        <Link to="/admin/players" className="mt-4 inline-block text-sm text-gold hover:underline">
          Back to Players
        </Link>
      </div>
    );
  }

  const isBannedOrSuspended = p.status === "banned" || p.status === "suspended";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Link to="/admin/players" className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted/50 hover:text-foreground">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display text-2xl font-bold text-foreground">{p.nickname || p.playerId}</h1>
              {statusBadge(p.status)}
            </div>
            <p className="text-sm text-muted-foreground">
              {p.playerId} &middot; {p.mobile} &middot; Joined {new Date(p.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            className="bg-gold-gradient text-primary-foreground hover:opacity-90"
            onClick={() => { setCreditOpen(true); setCreditAction("grant"); setCreditError(""); }}
          >
            <Coins className="mr-1 h-3.5 w-3.5" /> Manage Credits
          </Button>
          <Button
            size="sm"
            variant={isBannedOrSuspended ? "outline" : "destructive"}
            onClick={() => {
              setBanOpen(true);
              setBanAction(isBannedOrSuspended ? "unban" : "ban");
              setBanError("");
            }}
          >
            {isBannedOrSuspended
              ? <><ShieldCheck className="mr-1 h-3.5 w-3.5" /> Unban</>
              : <><Ban className="mr-1 h-3.5 w-3.5" /> Ban</>}
          </Button>
        </div>
      </div>

      {/* Wallet + Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard icon={Wallet} label="Balance" value={fmt(p.balance)} className="text-gold" />
        <StatCard icon={Wallet} label="Withdrawable" value={fmt(p.withdrawable)} className="text-emerald-400" />
        <StatCard icon={ArrowDownCircle} label="Total Deposited" value={fmt(stats?.totalDepositAmount || 0)} sub={`${stats?.totalDeposits || 0} deposits`} className="text-emerald-400" />
        <StatCard icon={ArrowUpCircle} label="Total Withdrawn" value={fmt(stats?.totalWithdrawalAmount || 0)} sub={`${stats?.totalWithdrawals || 0} withdrawals`} className="text-rose-400" />
        <StatCard icon={Gamepad2} label="Total Bets" value={(stats?.totalBets || 0).toLocaleString()} className="text-sky-400" />
        <StatCard icon={TrendingUp} label="Total Turnover" value={fmt(stats?.totalTurnover || 0)} className="text-blue-400" />
        <StatCard icon={Coins} label="Total Payout" value={fmt(stats?.totalPayout || 0)} className="text-amber-400" />
        <StatCard icon={Activity} label="Net Win" value={fmt(stats?.totalNetWin || 0)} className={(stats?.totalNetWin || 0) >= 0 ? "text-emerald-400" : "text-rose-400"} />
      </div>

      {stats?.lastActivity && (
        <p className="text-xs text-muted-foreground">Last activity: {new Date(stats.lastActivity).toLocaleString()}</p>
      )}

      {/* Transaction History */}
      <section className="space-y-3">
        <h2 className="font-display text-lg font-semibold text-foreground">Transaction History</h2>
        <div className="overflow-x-auto rounded-xl border border-border/40 bg-card/40">
          <Table>
            <TableHeader>
              <TableRow className="border-border/40 hover:bg-transparent">
                <TableHead className="text-[11px] uppercase text-muted-foreground">ID</TableHead>
                <TableHead className="text-[11px] uppercase text-muted-foreground">Type</TableHead>
                <TableHead className="text-right text-[11px] uppercase text-muted-foreground">Amount</TableHead>
                <TableHead className="text-[11px] uppercase text-muted-foreground">Channel</TableHead>
                <TableHead className="text-[11px] uppercase text-muted-foreground">Status</TableHead>
                <TableHead className="text-right text-[11px] uppercase text-muted-foreground">Balance After</TableHead>
                <TableHead className="text-[11px] uppercase text-muted-foreground">Remarks</TableHead>
                <TableHead className="text-[11px] uppercase text-muted-foreground">Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!q.data?.transactions?.data?.length ? (
                <TableRow>
                  <TableCell colSpan={8} className="py-10 text-center text-muted-foreground">No transactions</TableCell>
                </TableRow>
              ) : (
                q.data.transactions.data.map((tx: any) => (
                  <TableRow key={tx.id} className="border-border/20">
                    <TableCell className="font-mono text-xs text-muted-foreground">#{tx.id}</TableCell>
                    <TableCell>{eventBadge(tx.event)}</TableCell>
                    <TableCell className={`text-right font-mono text-sm ${
                      tx.event === "deposit" || tx.event === "admin_grant" ? "text-emerald-400" : "text-rose-400"
                    }`}>
                      {tx.event === "deposit" || tx.event === "admin_grant" ? "+" : "-"}
                      {Number(tx.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{tx.channel}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`text-[10px] ${
                        tx.status === "success" ? "border-emerald-500/40 text-emerald-400" :
                        tx.status === "processing" ? "border-amber-500/40 text-amber-400" :
                        "border-rose-500/40 text-rose-400"
                      }`}>{tx.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right font-mono text-xs text-muted-foreground">
                      {Number(tx.newBalance).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell className="max-w-[120px] truncate text-xs text-muted-foreground">{tx.remarks || "—"}</TableCell>
                    <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                      {new Date(tx.createdAt).toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        <Paginator page={txPage + 1} totalPages={txPages} total={txTotal} onPageChange={(p) => setTxPage(p - 1)} size="sm" />
      </section>

      {/* Game / Bet History */}
      <section className="space-y-3">
        <h2 className="font-display text-lg font-semibold text-foreground">Game Activity</h2>
        <div className="overflow-x-auto rounded-xl border border-border/40 bg-card/40">
          <Table>
            <TableHeader>
              <TableRow className="border-border/40 hover:bg-transparent">
                <TableHead className="text-[11px] uppercase text-muted-foreground">Game</TableHead>
                <TableHead className="text-[11px] uppercase text-muted-foreground">Provider</TableHead>
                <TableHead className="text-[11px] uppercase text-muted-foreground">Status</TableHead>
                <TableHead className="text-right text-[11px] uppercase text-muted-foreground">Turnover</TableHead>
                <TableHead className="text-right text-[11px] uppercase text-muted-foreground">Payout</TableHead>
                <TableHead className="text-right text-[11px] uppercase text-muted-foreground">Net Win</TableHead>
                <TableHead className="text-right text-[11px] uppercase text-muted-foreground">Balance After</TableHead>
                <TableHead className="text-[11px] uppercase text-muted-foreground">Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!q.data?.bets?.data?.length ? (
                <TableRow>
                  <TableCell colSpan={8} className="py-10 text-center text-muted-foreground">No game activity</TableCell>
                </TableRow>
              ) : (
                q.data.bets.data.map((bet: BetRow) => (
                  <TableRow key={bet.id} className="border-border/20">
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {bet.game?.thumbnail ? (
                          <img src={bet.game.thumbnail} alt="" className="h-8 w-8 rounded object-cover" />
                        ) : (
                          <div className="flex h-8 w-8 items-center justify-center rounded bg-muted/40">
                            <Gamepad2 className="h-4 w-4 text-muted-foreground" />
                          </div>
                        )}
                        <div>
                          <p className="text-sm text-foreground">{bet.game?.name || `Game #${bet.gameId}`}</p>
                          <p className="text-[10px] text-muted-foreground">{bet.game?.type || ""}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{bet.game?.provider || "—"}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`text-[10px] ${
                        bet.status === "COMPLETE" ? "border-emerald-500/40 text-emerald-400" :
                        bet.status === "CANCELLED" || bet.status === "VOID" ? "border-rose-500/40 text-rose-400" :
                        "border-amber-500/40 text-amber-400"
                      }`}>{bet.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm text-foreground">
                      {Number(bet.turnover).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm text-emerald-400">
                      {Number(bet.payout).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell className={`text-right font-mono text-sm ${Number(bet.netWin) >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                      {Number(bet.netWin) >= 0 ? "+" : ""}{Number(bet.netWin).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell className="text-right font-mono text-xs text-muted-foreground">
                      {Number(bet.newBalance).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                      {new Date(bet.createdAt).toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        <Paginator page={betPage + 1} totalPages={betPages} total={betTotal} onPageChange={(p) => setBetPage(p - 1)} size="sm" />
      </section>

      {/* Credit Dialog */}
      <Dialog open={creditOpen} onOpenChange={setCreditOpen}>
        <DialogContent className="bg-card sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display text-lg">Manage Credits</DialogTitle>
            <p className="text-sm text-muted-foreground">
              Player: <span className="text-foreground">{p.nickname || p.playerId}</span>
              {" — "}Balance: <span className="text-gold">{fmt(p.balance)}</span>
            </p>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setCreditAction("grant")}
                className={`rounded-lg border px-4 py-2 text-sm font-semibold transition-all ${
                  creditAction === "grant" ? "border-emerald-500 bg-emerald-500/10 text-emerald-400" : "border-border bg-input text-muted-foreground"
                }`}
              >Grant</button>
              <button
                onClick={() => setCreditAction("deduct")}
                className={`rounded-lg border px-4 py-2 text-sm font-semibold transition-all ${
                  creditAction === "deduct" ? "border-rose-500 bg-rose-500/10 text-rose-400" : "border-border bg-input text-muted-foreground"
                }`}
              >Deduct</button>
            </div>
            <Input type="number" min="0" placeholder="Amount" value={creditAmount} onChange={(e) => setCreditAmount(e.target.value)} className="border-border bg-input" />
            <Input placeholder="Remarks (optional)" value={creditRemarks} onChange={(e) => setCreditRemarks(e.target.value)} className="border-border bg-input" />
            {creditError && <p className="text-sm text-rose-400">{creditError}</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreditOpen(false)}>Cancel</Button>
            <Button
              disabled={!creditAmount || +creditAmount <= 0 || creditMut.isPending}
              className={creditAction === "grant" ? "bg-emerald-600 hover:bg-emerald-700" : "bg-rose-600 hover:bg-rose-700"}
              onClick={() => creditMut.mutate({ amount: +creditAmount, action: creditAction, remarks: creditRemarks || undefined })}
            >
              {creditMut.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {creditAction === "grant" ? "Grant" : "Deduct"} {creditAmount ? (+creditAmount).toLocaleString() : 0} Credits
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Ban Dialog */}
      <Dialog open={banOpen} onOpenChange={setBanOpen}>
        <DialogContent className="bg-card sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display text-lg">{isBannedOrSuspended ? "Unban Player" : "Ban / Suspend Player"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            {isBannedOrSuspended ? (
              <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4 text-center">
                <ShieldCheck className="mx-auto mb-2 h-8 w-8 text-emerald-400" />
                <p className="text-sm text-emerald-400">Restore this player's account to active.</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setBanAction("suspend")}
                    className={`rounded-lg border px-4 py-2.5 text-sm font-semibold transition-all ${
                      banAction === "suspend" ? "border-amber-500 bg-amber-500/10 text-amber-400" : "border-border bg-input text-muted-foreground"
                    }`}
                  ><ShieldOff className="mx-auto mb-1 h-4 w-4" />Suspend</button>
                  <button
                    onClick={() => setBanAction("ban")}
                    className={`rounded-lg border px-4 py-2.5 text-sm font-semibold transition-all ${
                      banAction === "ban" ? "border-rose-500 bg-rose-500/10 text-rose-400" : "border-border bg-input text-muted-foreground"
                    }`}
                  ><Ban className="mx-auto mb-1 h-4 w-4" />Permanent Ban</button>
                </div>
                {banAction === "suspend" && (
                  <div>
                    <label className="mb-1.5 block text-xs uppercase tracking-wider text-muted-foreground">Duration (days)</label>
                    <Input type="number" min="1" value={banDuration} onChange={(e) => setBanDuration(e.target.value)} className="border-border bg-input" />
                  </div>
                )}
              </>
            )}
            {banError && <p className="text-sm text-rose-400">{banError}</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBanOpen(false)}>Cancel</Button>
            <Button
              disabled={banMut.isPending}
              className={isBannedOrSuspended ? "bg-emerald-600 hover:bg-emerald-700" : "bg-destructive hover:bg-destructive/90"}
              onClick={() => {
                banMut.mutate({
                  action: isBannedOrSuspended ? "unban" : banAction,
                  duration: !isBannedOrSuspended && banAction === "suspend" ? +banDuration : undefined,
                });
              }}
            >
              {banMut.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isBannedOrSuspended ? "Unban Player" : banAction === "ban" ? "Ban Permanently" : `Suspend for ${banDuration} days`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, sub, className = "" }: {
  icon: any; label: string; value: string; sub?: string; className?: string;
}) {
  return (
    <div className="rounded-xl border border-border/40 bg-card/60 p-4">
      <div className="flex items-center gap-2">
        <Icon className={`h-4 w-4 ${className}`} />
        <span className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</span>
      </div>
      <p className={`mt-1 font-mono text-lg font-bold ${className}`}>{value}</p>
      {sub && <p className="text-[11px] text-muted-foreground">{sub}</p>}
    </div>
  );
}

function fmt(n: number) {
  return n.toLocaleString(undefined, { minimumFractionDigits: 2 });
}
