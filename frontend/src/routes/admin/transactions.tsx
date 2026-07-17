import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";
import { adminApi } from "@/lib/admin-api";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { ArrowLeftRight } from "lucide-react";
import { Paginator } from "@/components/paginator";

export const Route = createFileRoute("/admin/transactions")({
  component: TransactionsPage,
});

function TransactionsPage() {
  const { user } = useAuth();
  const token = user?.token || "";

  const [eventFilter, setEventFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(0);
  const limit = 20;

  const q = useQuery({
    queryKey: ["admin", "transactions", page, eventFilter, statusFilter],
    queryFn: () => adminApi.transactions(token, {
      limit, offset: page * limit,
      event: eventFilter || undefined,
      status: statusFilter || undefined,
    }),
    placeholderData: (prev) => prev,
  });

  const total = q.data?.total || 0;
  const totalPages = Math.ceil(total / limit);

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
    if (s === "success") return <Badge variant="outline" className="border-emerald-500/40 text-emerald-400 text-[10px]">Success</Badge>;
    if (s === "processing") return <Badge variant="outline" className="border-amber-500/40 text-amber-400 text-[10px]">Processing</Badge>;
    if (s === "failed") return <Badge variant="destructive" className="text-[10px]">Failed</Badge>;
    return <Badge variant="outline" className="text-[10px]">{s}</Badge>;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Transactions</h1>
          <p className="text-sm text-muted-foreground">{total} total transactions</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Select value={eventFilter} onValueChange={(v) => { setEventFilter(v === "all" ? "" : v); setPage(0); }}>
            <SelectTrigger className="w-40 border-border bg-input">
              <SelectValue placeholder="All types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              <SelectItem value="deposit">Deposits</SelectItem>
              <SelectItem value="withdraw">Withdrawals</SelectItem>
              <SelectItem value="admin_grant">Admin Grants</SelectItem>
              <SelectItem value="admin_deduct">Admin Deducts</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v === "all" ? "" : v); setPage(0); }}>
            <SelectTrigger className="w-32 border-border bg-input">
              <SelectValue placeholder="All status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All status</SelectItem>
              <SelectItem value="success">Success</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-border/40 bg-card/40">
        <Table>
          <TableHeader>
            <TableRow className="border-border/40 hover:bg-transparent">
              <TableHead className="text-[11px] uppercase text-muted-foreground">ID</TableHead>
              <TableHead className="text-[11px] uppercase text-muted-foreground">Player</TableHead>
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
            {q.isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}><TableCell colSpan={9}><Skeleton className="h-8" /></TableCell></TableRow>
              ))
            ) : !q.data?.data?.length ? (
              <TableRow>
                <TableCell colSpan={9} className="py-16 text-center text-muted-foreground">
                  <ArrowLeftRight className="mx-auto mb-3 h-8 w-8 opacity-30" />
                  <p>No transactions found</p>
                </TableCell>
              </TableRow>
            ) : (
              q.data.data.map((tx) => (
                <TableRow key={tx.id} className="border-border/20">
                  <TableCell className="font-mono text-xs text-muted-foreground">#{tx.id}</TableCell>
                  <TableCell>
                    <div>
                      <p className="text-sm text-foreground">{tx.playerName || "—"}</p>
                      <p className="text-[11px] text-muted-foreground">{tx.playerId}</p>
                    </div>
                  </TableCell>
                  <TableCell>{eventBadge(tx.event)}</TableCell>
                  <TableCell className={`text-right font-mono text-sm ${
                    tx.event === "deposit" || tx.event === "admin_grant" ? "text-emerald-400" : "text-rose-400"
                  }`}>
                    {tx.event === "deposit" || tx.event === "admin_grant" ? "+" : "-"}
                    {Number(tx.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">{tx.channel}</TableCell>
                  <TableCell>{statusBadge(tx.status)}</TableCell>
                  <TableCell className="text-right font-mono text-xs text-muted-foreground">
                    {Number(tx.newBalance).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </TableCell>
                  <TableCell className="max-w-[150px] truncate text-xs text-muted-foreground">
                    {tx.remarks || "—"}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                    {new Date(tx.createdAt).toLocaleString()}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Paginator page={page + 1} totalPages={totalPages} total={total} onPageChange={(p) => setPage(p - 1)} />
    </div>
  );
}
