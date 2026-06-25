import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Mail, Lock, User } from "lucide-react";
import logo from "@/assets/goldenace-logo.png";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/register")({
  component: RegisterPage,
});

function RegisterPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          login(email || "demo@goldenace.io", name || undefined);
          navigate({ to: "/" });
        }}
        className="w-full max-w-md space-y-5 rounded-2xl border border-gold/30 bg-card p-8 shadow-[var(--shadow-gold)] animate-fade-in"
      >
        <div className="flex flex-col items-center">
          <img src={logo} alt="GoldenAce" width={64} height={64} className="h-16 w-16" />
          <h1 className="mt-3 font-display text-2xl tracking-wider text-gold-gradient">Join GoldenAce</h1>
          <p className="text-sm text-muted-foreground">Create your account to claim your bonus</p>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="username" className="text-xs uppercase tracking-wider text-muted-foreground">Username</Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input id="username" value={name} onChange={(e) => setName(e.target.value)} placeholder="highroller_88" className="border-border bg-input pl-10" />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-xs uppercase tracking-wider text-muted-foreground">Email</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="border-border bg-input pl-10" />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="password" className="text-xs uppercase tracking-wider text-muted-foreground">Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input id="password" type="password" value={pw} onChange={(e) => setPw(e.target.value)} placeholder="••••••••" className="border-border bg-input pl-10" />
          </div>
        </div>
        <Button type="submit" className="h-11 w-full bg-gold-gradient font-semibold text-primary-foreground shadow-[var(--shadow-gold)] hover:opacity-90">
          Create Account
        </Button>
        <p className="text-center text-sm text-muted-foreground">
          Already a member? <Link to="/login" className="font-medium text-gold hover:text-gold-bright">Sign in</Link>
        </p>
      </form>
    </div>
  );
}