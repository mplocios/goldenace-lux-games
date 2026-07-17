import { createFileRoute, Outlet, Link, Navigate, useRouter, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";
import { useState } from "react";
import {
  LayoutDashboard, Users, Gamepad2, ArrowLeftRight,
  LogOut, Menu, X, Crown,
} from "lucide-react";

export const Route = createFileRoute("/admin")({
  component: AdminLayout,
});

const navItems = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/admin/players", label: "Players", icon: Users },
  { to: "/admin/games", label: "Games", icon: Gamepad2 },
  { to: "/admin/transactions", label: "Transactions", icon: ArrowLeftRight },
];

function AdminLayout() {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();
  const navigate = useNavigate();

  if (!user) return <Navigate to="/login" />;
  if (user.type !== "admin") return <Navigate to="/" />;

  const currentPath = router.state.location.pathname;

  const nav = (
    <nav className="flex flex-col gap-1 px-3">
      {navItems.map((item) => {
        const active = item.exact
          ? currentPath === item.to
          : currentPath.startsWith(item.to);
        return (
          <Link
            key={item.to}
            to={item.to}
            onClick={() => setSidebarOpen(false)}
            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
              active
                ? "bg-gold/15 text-gold"
                : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
            }`}
          >
            <item.icon className="h-4 w-4 shrink-0" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );

  const sidebarContent = (
    <>
      <div className="flex items-center gap-3 border-b border-border/40 px-5 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gold-gradient">
          <Crown className="h-5 w-5 text-primary-foreground" />
        </div>
        <div>
          <p className="font-display text-sm font-semibold text-gold">GoldenAce</p>
          <p className="text-[11px] text-muted-foreground">Admin Panel</p>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto py-4">{nav}</div>
      <div className="border-t border-border/40 p-4">
        <div className="mb-3 rounded-lg bg-muted/30 px-3 py-2">
          <p className="text-xs font-medium text-foreground">{user.name}</p>
          <p className="text-[11px] text-muted-foreground">{user.mobile}</p>
        </div>
        <button
          onClick={() => { logout(); navigate({ to: "/login" }); }}
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-all hover:bg-destructive/10 hover:text-destructive"
        >
          <LogOut className="h-4 w-4" /> Logout
        </button>
      </div>
    </>
  );

  return (
    <div className="flex min-h-screen">
      {/* Desktop sidebar */}
      <aside className="hidden w-60 shrink-0 flex-col border-r border-border/40 bg-card/50 lg:flex">
        {sidebarContent}
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setSidebarOpen(false)} />
          <aside className="relative z-10 flex w-64 flex-col bg-card">
            <button onClick={() => setSidebarOpen(false)} className="absolute right-3 top-3 p-1 text-muted-foreground">
              <X className="h-5 w-5" />
            </button>
            {sidebarContent}
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex flex-1 flex-col">
        {/* Mobile topbar */}
        <header className="flex items-center gap-3 border-b border-border/40 bg-card/30 px-4 py-3 lg:hidden">
          <button onClick={() => setSidebarOpen(true)} className="p-1 text-muted-foreground">
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2">
            <Crown className="h-4 w-4 text-gold" />
            <span className="font-display text-sm font-semibold text-gold">Admin</span>
          </div>
        </header>
        <main className="flex-1 overflow-x-hidden p-4 md:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
