import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Mail, Lock, User } from "lucide-react";
import logo from "@/assets/goldenace-logo.png";

type Mode = "login" | "register";

interface LoginDialogProps {
  open: boolean;
  mode: Mode;
  onOpenChange: (open: boolean) => void;
  onSwitchMode: (mode: Mode) => void;
}

export function LoginDialog({ open, mode, onOpenChange, onSwitchMode }: LoginDialogProps) {
  const isLogin = mode === "login";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="overflow-hidden border-gold/30 bg-card p-0 sm:max-w-md">
        <div className="relative">
          <div className="absolute inset-x-0 top-0 h-1 bg-gold-gradient" />
          <div className="flex flex-col items-center px-8 pt-8">
            <img src={logo} alt="GoldenAce" className="h-16 w-16" width={64} height={64} />
            <DialogHeader className="mt-3 text-center sm:text-center">
              <DialogTitle className="text-center font-display text-2xl tracking-wider text-gold-gradient">
                {isLogin ? "Welcome Back" : "Join GoldenAce"}
              </DialogTitle>
              <DialogDescription className="text-center text-muted-foreground">
                {isLogin ? "Sign in to continue your winning streak" : "Create your account to claim your bonus"}
              </DialogDescription>
            </DialogHeader>
          </div>

          <form
            className="space-y-4 px-8 pb-8 pt-6"
            onSubmit={(e) => {
              e.preventDefault();
              onOpenChange(false);
            }}
          >
            {!isLogin && (
              <div className="space-y-1.5">
                <Label htmlFor="username" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Username</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input id="username" placeholder="highroller_88" className="border-border bg-input pl-10 text-foreground" />
                </div>
              </div>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input id="email" type="email" placeholder="you@example.com" className="border-border bg-input pl-10 text-foreground" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input id="password" type="password" placeholder="••••••••" className="border-border bg-input pl-10 text-foreground" />
              </div>
            </div>

            <Button type="submit" className="h-11 w-full bg-gold-gradient font-semibold tracking-wide text-primary-foreground shadow-[var(--shadow-gold)] hover:opacity-90">
              {isLogin ? "Sign In" : "Create Account"}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              {isLogin ? "New to GoldenAce?" : "Already a member?"}{" "}
              <button
                type="button"
                onClick={() => onSwitchMode(isLogin ? "register" : "login")}
                className="font-medium text-gold transition-colors hover:text-gold-bright"
              >
                {isLogin ? "Create an account" : "Sign in"}
              </button>
            </p>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}