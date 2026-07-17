import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";
import { adminApi, type GameRow } from "@/lib/admin-api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Search, Gamepad2 } from "lucide-react";
import { Paginator } from "@/components/paginator";

export const Route = createFileRoute("/admin/games")({
  component: GamesPage,
});

function GamesPage() {
  const { user } = useAuth();
  const token = user?.token || "";
  const qc = useQueryClient();

  const [search, setSearch] = useState("");
  const [providerFilter, setProviderFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [activeFilter, setActiveFilter] = useState("");
  const [page, setPage] = useState(0);
  const limit = 20;

  const q = useQuery({
    queryKey: ["admin", "games", page, search, providerFilter, typeFilter, activeFilter],
    queryFn: () => adminApi.games(token, {
      limit, offset: page * limit, search,
      provider: providerFilter || undefined,
      type: typeFilter || undefined,
      is_active: activeFilter || undefined,
    }),
    placeholderData: (prev) => prev,
  });

  const toggleMut = useMutation({
    mutationFn: ({ id, is_active }: { id: number; is_active: boolean }) =>
      adminApi.toggleGame(token, id, is_active),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "games"] }),
  });

  const total = q.data?.total || 0;
  const totalPages = Math.ceil(total / limit);

  const providers = [...new Set((q.data?.data || []).map((g) => g.provider))].sort();
  const types = [...new Set((q.data?.data || []).map((g) => g.type))].sort();

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Games</h1>
          <p className="text-sm text-muted-foreground">{total} games</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search game name..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            className="w-52 border-border bg-input pl-9"
          />
        </div>
        <Select value={providerFilter} onValueChange={(v) => { setProviderFilter(v === "all" ? "" : v); setPage(0); }}>
          <SelectTrigger className="w-36 border-border bg-input">
            <SelectValue placeholder="All providers" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All providers</SelectItem>
            {providers.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={typeFilter} onValueChange={(v) => { setTypeFilter(v === "all" ? "" : v); setPage(0); }}>
          <SelectTrigger className="w-32 border-border bg-input">
            <SelectValue placeholder="All types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            {types.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={activeFilter} onValueChange={(v) => { setActiveFilter(v === "all" ? "" : v); setPage(0); }}>
          <SelectTrigger className="w-32 border-border bg-input">
            <SelectValue placeholder="All status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All status</SelectItem>
            <SelectItem value="true">Active</SelectItem>
            <SelectItem value="false">Disabled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Game cards grid */}
      {q.isLoading ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
        </div>
      ) : !q.data?.data?.length ? (
        <div className="py-16 text-center text-muted-foreground">
          <Gamepad2 className="mx-auto mb-3 h-10 w-10 opacity-30" />
          <p>No games found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {q.data.data.map((g) => (
            <div
              key={g.id}
              className={`relative rounded-xl border p-4 transition-all ${
                g.is_active ? "border-border/40 bg-card/60" : "border-rose-500/20 bg-card/30 opacity-60"
              }`}
            >
              <div className="flex items-start gap-3">
                {g.thumbnail || g.image ? (
                  <img
                    src={g.thumbnail || g.image || ""}
                    alt={g.name}
                    className="h-14 w-14 shrink-0 rounded-lg border border-border/30 object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                  />
                ) : (
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg border border-border/30 bg-muted/40">
                    <Gamepad2 className="h-6 w-6 text-muted-foreground" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-foreground">{g.name}</p>
                  <div className="mt-1 flex flex-wrap gap-1">
                    <Badge variant="outline" className="text-[10px]">{g.provider}</Badge>
                    <Badge variant="outline" className="text-[10px]">{g.type}</Badge>
                    {g.rtp && <Badge variant="outline" className="text-[10px]">RTP {g.rtp}%</Badge>}
                  </div>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between border-t border-border/20 pt-3">
                <span className={`text-xs font-medium ${g.is_active ? "text-emerald-400" : "text-rose-400"}`}>
                  {g.is_active ? "Active" : "Disabled"}
                </span>
                <Switch
                  checked={g.is_active}
                  onCheckedChange={(checked) => toggleMut.mutate({ id: g.id, is_active: checked })}
                  disabled={toggleMut.isPending}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      <Paginator page={page + 1} totalPages={totalPages} total={total} onPageChange={(p) => setPage(p - 1)} />
    </div>
  );
}
