import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;

  return (
    <div className="mx-auto min-h-screen max-w-xl px-4 py-8 animate-fade-in">
      <Link to="/" className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-gold">
        <ArrowLeft className="h-4 w-4" /> Back
      </Link>
      <h1 className="mb-4 font-display text-2xl text-gold-gradient">Settings</h1>
      <div className="space-y-3 rounded-xl border border-border/60 bg-card/60 p-5 text-sm text-muted-foreground">
        <Row label="Display name" value={user.name} />
        <Row label="Email" value={user.email} />
        <Row label="Player ID" value={user.id} />
        <p className="pt-3 text-xs">More preferences coming soon.</p>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-border/40 pb-2 last:border-0">
      <span className="text-xs uppercase tracking-wider">{label}</span>
      <span className="text-foreground">{value}</span>
    </div>
  );
}