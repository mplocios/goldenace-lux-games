import { createFileRoute, Link } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";
import { adminApi, type PlayerRow } from "@/lib/admin-api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Search, Coins, Ban, ShieldCheck,
  ShieldOff, Loader2, Eye,
} from "lucide-react";
import { Paginator } from "@/components/paginator";

export const Route = createFileRoute("/admin/players")({
  component: PlayersPage,
});

function PlayersPage() {
  const { user } = useAuth();
  const token = user?.token || "";
  const qc = useQueryClient();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(0);
  const limit = 15;

  const q = useQuery({
    queryKey: ["admin", "players", page, search, statusFilter],
    queryFn: () => adminApi.players(token, { limit, offset: page * limit, search, status: statusFilter || undefined }),
    placeholderData: (prev) => prev,
  });

  // Credit dialog
  const [creditDialog, setCreditDialog] = useState<PlayerRow | null>(null);
  const [creditAction, setCreditAction] = useState<"grant" | "deduct">("grant");
  const [creditAmount, setCreditAmount] = useState("");
  const [creditRemarks, setCreditRemarks] = useState("");
  const [creditError, setCreditError] = useState("");

  const creditMut = useMutation({
    mutationFn: (p: { id: number; amount: number; action: "grant" | "deduct"; remarks?: string }) =>
      adminApi.grantCredits(token, p.id, { amount: p.amount, action: p.action, remarks: p.remarks }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin"] });
      setCreditDialog(null);
      setCreditAmount("");
      setCreditRemarks("");
      setCreditError("");
    },
    onError: (e: Error) => setCreditError(e.message),
  });

  // Ban dialog
  const [banDialog, setBanDialog] = useState<PlayerRow | null>(null);
  const [banAction, setBanAction] = useState<"ban" | "suspend" | "unban">("ban");
  const [banDuration, setBanDuration] = useState("7");
  const [banError, setBanError] = useState("");

  const banMut = useMutation({
    mutationFn: (p: { id: number; action: "ban" | "suspend" | "unban"; duration?: number }) =>
      adminApi.banPlayer(token, p.id, { action: p.action, duration: p.duration }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin"] });
      setBanDialog(null);
      setBanError("");
    },
    onError: (e: Error) => setBanError(e.message),
  });

  const total = q.data?.total || 0;
  const totalPages = Math.ceil(total / limit);

  function statusBadge(s: string) {
    if (s === "banned") return <Badge variant="destructive" className="text-[10px]">Banned</Badge>;
    if (s === "suspended") return <Badge variant="outline" className="border-amber-500/40 text-amber-400 text-[10px]">Suspended</Badge>;
    return <Badge variant="outline" className="border-emerald-500/40 text-emerald-400 text-[10px]">Active</Badge>;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Players</h1>
          <p className="text-sm text-muted-foreground">{total} total players</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search mobile, ID, name..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(0); }}
              className="w-56 border-border bg-input pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v === "all" ? "" : v); setPage(0); }}>
            <SelectTrigger className="w-32 border-border bg-input">
              <SelectValue placeholder="All status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="banned">Banned</SelectItem>
              <SelectItem value="suspended">Suspended</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-border/40 bg-card/40">
        <Table>
          <TableHeader>
            <TableRow className="border-border/40 hover:bg-transparent">
              <TableHead className="text-[11px] uppercase text-muted-foreground">Player</TableHead>
              <TableHead className="text-[11px] uppercase text-muted-foreground">Mobile</TableHead>
              <TableHead className="text-right text-[11px] uppercase text-muted-foreground">Balance</TableHead>
              <TableHead className="text-right text-[11px] uppercase text-muted-foreground">Withdrawable</TableHead>
              <TableHead className="text-[11px] uppercase text-muted-foreground">Status</TableHead>
              <TableHead className="text-[11px] uppercase text-muted-foreground">Joined</TableHead>
              <TableHead className="text-right text-[11px] uppercase text-muted-foreground">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {q.isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}><TableCell colSpan={7}><Skeleton className="h-8" /></TableCell></TableRow>
              ))
            ) : !q.data?.data?.length ? (
              <TableRow>
                <TableCell colSpan={7} className="py-12 text-center text-muted-foreground">No players found</TableCell>
              </TableRow>
            ) : (
              q.data.data.map((p) => (
                <TableRow key={p.id} className="border-border/20">
                  <TableCell>
                    <div>
                      <p className="text-sm font-medium text-foreground">{p.nickname || p.playerId}</p>
                      <p className="text-[11px] text-muted-foreground">{p.playerId}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{p.mobile}</TableCell>
                  <TableCell className="text-right font-mono text-sm text-gold">
                    {Number(p.balance).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </TableCell>
                  <TableCell className="text-right font-mono text-sm text-emerald-400">
                    {Number(p.withdrawable).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </TableCell>
                  <TableCell>{statusBadge(p.status || "active")}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {new Date(p.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Link to="/admin/player/$id" params={{ id: String(p.id) }}>
                        <Button size="sm" variant="ghost" className="h-7 px-2 text-xs text-sky-400 hover:text-sky-300">
                          <Eye className="mr-1 h-3 w-3" /> View
                        </Button>
                      </Link>
                      <Button
                        size="sm" variant="ghost"
                        className="h-7 px-2 text-xs text-gold hover:text-gold"
                        onClick={() => { setCreditDialog(p); setCreditAction("grant"); setCreditError(""); }}
                      >
                        <Coins className="mr-1 h-3 w-3" /> Credits
                      </Button>
                      <Button
                        size="sm" variant="ghost"
                        className="h-7 px-2 text-xs text-muted-foreground hover:text-destructive"
                        onClick={() => {
                          setBanDialog(p);
                          setBanAction(p.status === "active" || !p.status ? "ban" : "unban");
                          setBanError("");
                        }}
                      >
                        {p.status === "banned" || p.status === "suspended"
                          ? <><ShieldCheck className="mr-1 h-3 w-3" /> Unban</>
                          : <><Ban className="mr-1 h-3 w-3" /> Ban</>}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Paginator page={page + 1} totalPages={totalPages} total={total} onPageChange={(p) => setPage(p - 1)} />

      {/* Credit Dialog */}
      <Dialog open={!!creditDialog} onOpenChange={(open) => !open && setCreditDialog(null)}>
        <DialogContent className="bg-card sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display text-lg">Manage Credits</DialogTitle>
            <p className="text-sm text-muted-foreground">
              Player: <span className="text-foreground">{creditDialog?.nickname || creditDialog?.playerId}</span>
              {" — "}Balance: <span className="text-gold">{Number(creditDialog?.balance || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </p>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setCreditAction("grant")}
                className={`rounded-lg border px-4 py-2 text-sm font-semibold transition-all ${
                  creditAction === "grant" ? "border-emerald-500 bg-emerald-500/10 text-emerald-400" : "border-border bg-input text-muted-foreground"
                }`}
              >
                Grant
              </button>
              <button
                onClick={() => setCreditAction("deduct")}
                className={`rounded-lg border px-4 py-2 text-sm font-semibold transition-all ${
                  creditAction === "deduct" ? "border-rose-500 bg-rose-500/10 text-rose-400" : "border-border bg-input text-muted-foreground"
                }`}
              >
                Deduct
              </button>
            </div>
            <Input
              type="number" min="0" placeholder="Amount"
              value={creditAmount} onChange={(e) => setCreditAmount(e.target.value)}
              className="border-border bg-input"
            />
            <Input
              placeholder="Remarks (optional)"
              value={creditRemarks} onChange={(e) => setCreditRemarks(e.target.value)}
              className="border-border bg-input"
            />
            {creditError && <p className="text-sm text-rose-400">{creditError}</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreditDialog(null)}>Cancel</Button>
            <Button
              disabled={!creditAmount || +creditAmount <= 0 || creditMut.isPending}
              className={creditAction === "grant" ? "bg-emerald-600 hover:bg-emerald-700" : "bg-rose-600 hover:bg-rose-700"}
              onClick={() => {
                if (!creditDialog) return;
                creditMut.mutate({ id: creditDialog.id, amount: +creditAmount, action: creditAction, remarks: creditRemarks || undefined });
              }}
            >
              {creditMut.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {creditAction === "grant" ? "Grant" : "Deduct"} {creditAmount ? (+creditAmount).toLocaleString() : 0} Credits
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Ban Dialog */}
      <Dialog open={!!banDialog} onOpenChange={(open) => !open && setBanDialog(null)}>
        <DialogContent className="bg-card sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display text-lg">
              {banDialog?.status === "banned" || banDialog?.status === "suspended" ? "Unban Player" : "Ban / Suspend Player"}
            </DialogTitle>
            <p className="text-sm text-muted-foreground">
              Player: <span className="text-foreground">{banDialog?.nickname || banDialog?.playerId}</span>
            </p>
          </DialogHeader>
          <div className="space-y-3 py-2">
            {banDialog?.status === "banned" || banDialog?.status === "suspended" ? (
              <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4 text-center">
                <ShieldCheck className="mx-auto mb-2 h-8 w-8 text-emerald-400" />
                <p className="text-sm text-emerald-400">This will restore the player's account to active status.</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setBanAction("suspend")}
                    className={`rounded-lg border px-4 py-2.5 text-sm font-semibold transition-all ${
                      banAction === "suspend" ? "border-amber-500 bg-amber-500/10 text-amber-400" : "border-border bg-input text-muted-foreground"
                    }`}
                  >
                    <ShieldOff className="mx-auto mb-1 h-4 w-4" />
                    Suspend
                  </button>
                  <button
                    onClick={() => setBanAction("ban")}
                    className={`rounded-lg border px-4 py-2.5 text-sm font-semibold transition-all ${
                      banAction === "ban" ? "border-rose-500 bg-rose-500/10 text-rose-400" : "border-border bg-input text-muted-foreground"
                    }`}
                  >
                    <Ban className="mx-auto mb-1 h-4 w-4" />
                    Permanent Ban
                  </button>
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
            <Button variant="outline" onClick={() => setBanDialog(null)}>Cancel</Button>
            <Button
              disabled={banMut.isPending}
              className={banDialog?.status === "banned" || banDialog?.status === "suspended"
                ? "bg-emerald-600 hover:bg-emerald-700"
                : "bg-destructive hover:bg-destructive/90"}
              onClick={() => {
                if (!banDialog) return;
                const isBanned = banDialog.status === "banned" || banDialog.status === "suspended";
                banMut.mutate({
                  id: banDialog.id,
                  action: isBanned ? "unban" : banAction,
                  duration: !isBanned && banAction === "suspend" ? +banDuration : undefined,
                });
              }}
            >
              {banMut.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {banDialog?.status === "banned" || banDialog?.status === "suspended" ? "Unban Player" : banAction === "ban" ? "Ban Permanently" : `Suspend for ${banDuration} days`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
