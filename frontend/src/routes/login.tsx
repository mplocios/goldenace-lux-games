import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Mail, Lock } from "lucide-react";
import logo from "@/assets/goldenace-logo.png";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          login(email || "demo@goldenace.io");
          navigate({ to: "/" });
        }}
        className="w-full max-w-md space-y-5 rounded-2xl border border-gold/30 bg-card p-8 shadow-[var(--shadow-gold)] animate-fade-in"
      >
        <div className="flex flex-col items-center">
          <img src={logo} alt="GoldenAce" width={64} height={64} className="h-16 w-16" />
          <h1 className="mt-3 font-display text-2xl tracking-wider text-gold-gradient">Welcome Back</h1>
          <p className="text-sm text-muted-foreground">Sign in to continue your winning streak</p>
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
          Sign In
        </Button>
        <p className="text-center text-sm text-muted-foreground">
          New to GoldenAce? <Link to="/register" className="font-medium text-gold hover:text-gold-bright">Create an account</Link>
        </p>
      </form>
    </div>
  );
}