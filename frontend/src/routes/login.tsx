import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Phone, Lock, Loader2 } from "lucide-react";
import logo from "@/assets/goldenace-logo.png";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth";
import { apiLogin } from "@/lib/api";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [mobile, setMobile] = useState("");
  const [pw, setPw] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await apiLogin(mobile, pw);
      login(data.user.mobile_number, data.token, data.user);
      navigate({ to: "/" });
    } catch (err: any) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md space-y-5 rounded-2xl border border-gold/30 bg-card p-8 shadow-[var(--shadow-gold)] animate-fade-in"
      >
        <div className="flex flex-col items-center">
          <img src={logo} alt="GoldenAce" width={64} height={64} className="h-16 w-16" />
          <h1 className="mt-3 font-display text-2xl tracking-wider text-gold-gradient">Welcome Back</h1>
          <p className="text-sm text-muted-foreground">Sign in to continue your winning streak</p>
        </div>

        {error && (
          <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-2.5 text-sm text-destructive">
            {error}
          </div>
        )}

        <div className="space-y-1.5">
          <Label htmlFor="mobile" className="text-xs uppercase tracking-wider text-muted-foreground">Mobile Number</Label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="mobile"
              type="tel"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              placeholder="09XXXXXXXXX"
              className="border-border bg-input pl-10"
              required
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="password" className="text-xs uppercase tracking-wider text-muted-foreground">Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="password"
              type="password"
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              placeholder="••••••••"
              className="border-border bg-input pl-10"
              required
            />
          </div>
        </div>
        <Button
          type="submit"
          disabled={loading}
          className="h-11 w-full bg-gold-gradient font-semibold text-primary-foreground shadow-[var(--shadow-gold)] hover:opacity-90"
        >
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          {loading ? "Signing in..." : "Sign In"}
        </Button>
        <p className="text-center text-sm text-muted-foreground">
          New to GoldenAce? <Link to="/register" className="font-medium text-gold hover:text-gold-bright">Create an account</Link>
        </p>
      </form>
    </div>
  );
}
