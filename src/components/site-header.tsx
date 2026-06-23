import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Search, Wallet, Bell, Menu } from "lucide-react";
import logo from "@/assets/goldenace-logo.png";
import { Button } from "@/components/ui/button";
import { LoginDialog } from "@/components/login-dialog";

export function SiteHeader() {
  const [authOpen, setAuthOpen] = useState<"login" | "register" | null>(null);

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:h-20 sm:px-6">
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2">
            <img src={logo} alt="GoldenAce" className="h-10 w-10 sm:h-12 sm:w-12" width={48} height={48} />
            <span className="hidden font-display text-xl font-bold tracking-wider text-gold-gradient sm:inline">
              GOLDENACE
            </span>
          </Link>
          <nav className="hidden items-center gap-6 text-sm font-medium text-muted-foreground lg:flex">
            <Link to="/" className="transition-colors hover:text-gold">Casino</Link>
            <a href="#slots" className="transition-colors hover:text-gold">Slots</a>
            <a href="#live" className="transition-colors hover:text-gold">Live</a>
            <a href="#originals" className="transition-colors hover:text-gold">Originals</a>
            <a href="#promotions" className="transition-colors hover:text-gold">Promotions</a>
          </nav>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button className="hidden h-10 w-10 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-gold sm:flex" aria-label="Search">
            <Search className="h-4 w-4" />
          </button>
          <Button
            variant="ghost"
            className="text-sm font-medium text-foreground hover:bg-secondary hover:text-gold"
            onClick={() => setAuthOpen("login")}
          >
            Sign in
          </Button>
          <Button
            className="bg-gold-gradient font-semibold text-primary-foreground shadow-[var(--shadow-gold)] hover:opacity-90"
            onClick={() => setAuthOpen("register")}
          >
            <Wallet className="mr-2 h-4 w-4" />
            Register
          </Button>
          <button className="hidden h-10 w-10 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-gold sm:flex" aria-label="Notifications">
            <Bell className="h-4 w-4" />
          </button>
          <button className="flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-gold lg:hidden" aria-label="Menu">
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </div>

      <LoginDialog
        open={authOpen !== null}
        mode={authOpen ?? "login"}
        onOpenChange={(o) => !o && setAuthOpen(null)}
        onSwitchMode={(m) => setAuthOpen(m)}
      />
    </header>
  );
}