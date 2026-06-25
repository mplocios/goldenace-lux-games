import { useState } from "react";
import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import { ArrowLeft, ArrowDownCircle, ArrowUpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/auth";
import acecoin from "@/assets/acecoin.png";

export const Route = createFileRoute("/wallet")({
  head: () => ({ meta: [{ title: "Wallet — GoldenAce" }] }),
  component: WalletPage,
});

function WalletPage() {
  const { user, adjustBalance } = useAuth();
  const [amt, setAmt] = useState("100");
  if (!user) return <Navigate to="/login" />;

  const amount = Math.max(0, Number(amt) || 0);

  return (
    <div className="mx-auto min-h-screen max-w-xl px-4 py-8 animate-fade-in">
      <Link to="/" className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-gold">
        <ArrowLeft className="h-4 w-4" /> Back
      </Link>

      <div className="rounded-2xl border border-gold/30 bg-card p-6 text-center shadow-[var(--shadow-gold)]">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">Available balance</p>
        <div className="mt-2 flex items-center justify-center gap-3">
          <img src={acecoin} alt="AceCoin" width={48} height={48} className="h-12 w-12 drop-shadow-[0_0_12px_rgba(212,175,55,0.45)]" />
          <p className="font-display text-4xl text-gold-gradient">
            {user.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </p>
        </div>
        <p className="mt-1 text-xs uppercase tracking-[0.2em] text-gold/80">AceCoin</p>
      </div>

      <div className="mt-6 space-y-3 rounded-xl border border-border/60 bg-card/60 p-5">
        <label htmlFor="wallet-amount" className="text-xs uppercase tracking-wider text-muted-foreground">Amount (AceCoin)</label>
        <Input id="wallet-amount" value={amt} onChange={(e) => setAmt(e.target.value)} type="number" min="0" className="border-border bg-input" />
        <div className="grid grid-cols-2 gap-3 pt-2">
          <Button onClick={() => adjustBalance(amount, "deposit")} className="bg-gold-gradient font-semibold text-primary-foreground hover:opacity-90">
            <ArrowDownCircle className="mr-2 h-4 w-4" /> Deposit
          </Button>
          <Button onClick={() => adjustBalance(-amount, "withdraw")} variant="outline" className="border-gold/40 hover:border-gold hover:text-gold">
            <ArrowUpCircle className="mr-2 h-4 w-4" /> Withdraw
          </Button>
        </div>
      </div>
    </div>
  );
}