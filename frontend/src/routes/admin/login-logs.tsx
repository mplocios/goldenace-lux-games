import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";
import { adminApi } from "@/lib/admin-api";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Search, LogIn } from "lucide-react";
import { Paginator } from "@/components/paginator";

export const Route = createFileRoute("/admin/login-logs")({
  component: LoginLogsPage,
});

function LoginLogsPage() {
  const { user } = useAuth();
  const token = user?.token || "";

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const limit = 20;

  const q = useQuery({
    queryKey: ["admin", "login-logs", page, search],
    queryFn: () => adminApi.loginLogs(token, {
      limit, offset: page * limit,
      search: search || undefined,
    }),
    placeholderData: (prev) => prev,
  });

  const total = q.data?.total || 0;
  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Login Logs</h1>
          <p className="text-sm text-muted-foreground">{total} login records</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search mobile, name, IP..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(0); }}
              className="w-60 border-border bg-input pl-9"
            />
          </div>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border/40 bg-card/40">
        <Table>
          <TableHeader>
            <TableRow className="border-border/40 hover:bg-transparent">
              <TableHead className="text-[11px] uppercase text-muted-foreground">User</TableHead>
              <TableHead className="text-[11px] uppercase text-muted-foreground">Type</TableHead>
              <TableHead className="text-[11px] uppercase text-muted-foreground">IP Address</TableHead>
              <TableHead className="text-[11px] uppercase text-muted-foreground">Device</TableHead>
              <TableHead className="text-[11px] uppercase text-muted-foreground">Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {q.isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}><TableCell colSpan={5}><Skeleton className="h-8" /></TableCell></TableRow>
              ))
            ) : !q.data?.data?.length ? (
              <TableRow>
                <TableCell colSpan={5} className="py-16 text-center text-muted-foreground">
                  <LogIn className="mx-auto mb-3 h-8 w-8 opacity-30" />
                  <p>No login records found</p>
                </TableCell>
              </TableRow>
            ) : (
              q.data.data.map((log) => (
                <TableRow key={log.id} className="border-border/20">
                  <TableCell>
                    <div>
                      <p className="text-sm text-foreground">{log.nickname || log.mobile}</p>
                      <p className="text-[11px] text-muted-foreground">{log.mobile}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    {log.userType === "admin" ? (
                      <Badge className="bg-amber-600/20 text-amber-400 text-[10px]">Admin</Badge>
                    ) : (
                      <Badge variant="outline" className="text-[10px]">Player</Badge>
                    )}
                  </TableCell>
                  <TableCell className="font-mono text-sm text-foreground">{log.ip}</TableCell>
                  <TableCell className="max-w-[200px] text-xs text-muted-foreground">
                    {parseUA(log.userAgent)}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                    {new Date(log.createdAt).toLocaleString()}
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

function parseUA(ua: string | null): string {
  if (!ua) return "Unknown";
  if (ua.includes("iPhone")) return "iPhone";
  if (ua.includes("Android")) return "Android";
  if (ua.includes("iPad")) return "iPad";
  if (ua.includes("Windows")) return "Windows";
  if (ua.includes("Mac")) return "Mac";
  if (ua.includes("Linux")) return "Linux";
  return "Other";
}
