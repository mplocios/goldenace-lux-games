import { Link } from "@tanstack/react-router";
import { Wallet, Bell, Menu } from "lucide-react";
import logo from "@/assets/goldenace-logo.png";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";
import { useAuth } from "@/lib/auth";
import { UserMenu } from "@/components/user-menu";

function HeaderSkeleton() {
  return (
    <div className="flex items-center gap-2 sm:gap-3 animate-pulse">
      <div className="hidden sm:flex items-center gap-1.5 rounded-full border border-border/30 bg-secondary/40 py-1 pl-1 pr-3">
        <div className="h-5 w-5 rounded-full bg-border/40" />
        <div className="h-3 w-14 rounded bg-border/40" />
      </div>
      <div className="h-10 w-10 rounded-full bg-border/40" />
    </div>
  );
}

export function SiteHeader() {
  const { toggleSidebar } = useSidebar();
  const { user, loading } = useAuth();

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:h-20 sm:px-6">
        <div className="flex items-center gap-3">
          <button
            onClick={toggleSidebar}
            className="flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-gold"
            aria-label="Toggle menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <Link to="/" className="flex items-center gap-2">
            <img src={logo} alt="GoldenAce" className="h-9 w-9 sm:h-10 sm:w-10" width={40} height={40} />
            <span className="hidden font-display text-lg font-bold tracking-wider text-gold-gradient sm:inline sm:text-xl">
              GOLDENACE
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {loading ? (
            <HeaderSkeleton />
          ) : user ? (
            <>
              <button className="flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-gold" aria-label="Notifications">
                <Bell className="h-4 w-4" />
              </button>
              <UserMenu />
            </>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm" className="text-sm font-medium text-foreground hover:bg-secondary hover:text-gold sm:size-default">
                <Link to="/login">Sign in</Link>
              </Button>
              <Button asChild size="sm" className="bg-gold-gradient font-semibold text-primary-foreground shadow-[var(--shadow-gold)] hover:opacity-90 sm:size-default">
                <Link to="/register">
                  <Wallet className="mr-1 h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Register</span>
                  <span className="sm:hidden">Join</span>
                </Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}