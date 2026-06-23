import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Wallet, Bell, Menu } from "lucide-react";
import logo from "@/assets/goldenace-logo.png";
import { Button } from "@/components/ui/button";
import { LoginDialog } from "@/components/login-dialog";
import { useSidebar } from "@/components/ui/sidebar";

export function SiteHeader() {
  const [authOpen, setAuthOpen] = useState<"login" | "register" | null>(null);
  const { toggleSidebar } = useSidebar();

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
            <span className="font-display text-lg font-bold tracking-wider text-gold-gradient sm:text-xl">
              GOLDENACE
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
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
          <button className="flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-gold" aria-label="Notifications">
            <Bell className="h-4 w-4" />
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