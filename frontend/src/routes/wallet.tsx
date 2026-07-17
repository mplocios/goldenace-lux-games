import { useState } from "react";
import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import { ArrowLeft, ArrowDownCircle, ArrowUpCircle, Check, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/auth";
import { apiCashIn, apiCashOut } from "@/lib/api";
import acecoin from "@/assets/acecoin.png";

const coinPackages = [
  { coins: 100, price: 100, label: "Starter" },
  { coins: 220, price: 200, label: "Bronze" },
  { coins: 600, price: 500, label: "Silver" },
  { coins: 1500, price: 1000, label: "Gold", popular: true },
  { coins: 20000, price: 10000, label: "Diamond" },
];

const paymentMethods = [
  { code: "gcash", label: "GCash" },
  { code: "maya", label: "Maya" },
];

function calcTotal(coins: number, isFirstDeposit: boolean) {
  if (isFirstDeposit) return coins * 2;
  return coins;
}

export const Route = createFileRoute("/wallet")({
  component: WalletPage,
});

function WalletPage() {
  const { user } = useAuth();
  const [tab, setTab] = useState<"deposit" | "withdraw">("deposit");
  const [selectedPkg, setSelectedPkg] = useState(0);
  const [payMethod, setPayMethod] = useState("gcash");
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Withdraw form
  const [amt, setAmt] = useState("100");
  const [bankCode, setBankCode] = useState("gcash");
  const [accountNo, setAccountNo] = useState("");
  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");

  if (!user) return <Navigate to="/login" />;

  const amount = Math.max(0, Number(amt) || 0);

  const handleDeposit = async (coins: number, price: number) => {
    if (processing) return;
    setProcessing(true);
    setError("");
    setSuccess("");
    try {
      const res = await apiCashIn(user.token || "", { price, coins, paymentType: payMethod });
      if (res.paymentUrl) {
        window.location.href = res.paymentUrl;
        return;
      }
    } catch (e: any) {
      setError(e.message || "Deposit failed");
    }
    setProcessing(false);
  };

  const handleWithdraw = async () => {
    if (processing || amount <= 0) return;
    if (!accountNo.trim() || !firstName.trim() || !lastName.trim()) {
      setError("Please fill in all required fields");
      return;
    }
    setProcessing(true);
    setError("");
    setSuccess("");
    try {
      const res = await apiCashOut(user.token || "", {
        amount,
        bankCode,
        accountNo: accountNo.trim(),
        firstName: firstName.trim(),
        middleName: middleName.trim(),
        lastName: lastName.trim(),
      });
      setSuccess(res.message || "Withdrawal request submitted");
      setAmt("100");
      setAccountNo("");
    } catch (e: any) {
      setError(e.message || "Withdraw failed");
    }
    setProcessing(false);
  };

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
        <div className="mt-3 flex items-center justify-center gap-6 text-xs">
          <div>
            <span className="text-muted-foreground">Playable: </span>
            <span className="font-semibold text-foreground">
              {(user.balance - user.withdrawable).toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div>
            <span className="text-muted-foreground">Withdrawable: </span>
            <span className="font-semibold text-emerald-400">
              {user.withdrawable.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-1 rounded-lg border border-border/60 bg-card/40 p-1">
        <button
          onClick={() => { setTab("deposit"); setError(""); setSuccess(""); }}
          className={`flex items-center justify-center gap-2 rounded-md py-2.5 text-sm font-semibold transition-all ${tab === "deposit" ? "bg-gold-gradient text-primary-foreground shadow-[var(--shadow-gold)]" : "text-muted-foreground hover:text-foreground"}`}
        >
          <ArrowDownCircle className="h-4 w-4" /> Deposit
        </button>
        <button
          onClick={() => { setTab("withdraw"); setError(""); setSuccess(""); }}
          className={`flex items-center justify-center gap-2 rounded-md py-2.5 text-sm font-semibold transition-all ${tab === "withdraw" ? "bg-gold-gradient text-primary-foreground shadow-[var(--shadow-gold)]" : "text-muted-foreground hover:text-foreground"}`}
        >
          <ArrowUpCircle className="h-4 w-4" /> Withdraw
        </button>
      </div>

      {error && (
        <div className="mt-3 rounded-lg border border-rose-500/30 bg-rose-500/10 px-4 py-2 text-sm text-rose-400">
          {error}
        </div>
      )}
      {success && (
        <div className="mt-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-400">
          {success}
        </div>
      )}

      {tab === "deposit" ? (() => {
        const isFirst = !user.hasDeposited;
        const pkg = coinPackages[selectedPkg];
        const total = calcTotal(pkg.coins, isFirst);
        const extraPct = Math.round(((pkg.coins - pkg.price) / pkg.price) * 100);
        return (
        <div className="mt-4 space-y-3">
          {isFirst && (
            <div className="flex items-center gap-2 rounded-xl border border-gold/40 bg-gold/10 px-4 py-3">
              <Sparkles className="h-5 w-5 shrink-0 text-gold" />
              <p className="text-sm font-medium text-gold">
                First deposit bonus! Your coins are <span className="font-bold">doubled</span> + package bonus on top.
              </p>
            </div>
          )}
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Select a coin package</p>
          <div className="space-y-2">
            {coinPackages.map((p, i) => {
              const pkgTotal = calcTotal(p.coins, isFirst);
              const pkgExtra = Math.round(((p.coins - p.price) / p.price) * 100);
              return (
              <button
                key={p.coins}
                onClick={() => setSelectedPkg(i)}
                className={`relative w-full rounded-xl border p-4 text-left transition-all hover:-translate-y-0.5 ${
                  selectedPkg === i
                    ? "border-gold bg-gold/10 shadow-[var(--shadow-gold)]"
                    : "border-border/60 bg-card/60 hover:border-gold/40"
                }`}
              >
                {p.popular && (
                  <span className="absolute -top-2.5 right-3 rounded-full bg-gold-gradient px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary-foreground">
                    Most Popular
                  </span>
                )}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img src={acecoin} alt="" width={32} height={32} className="h-8 w-8" />
                    <div>
                      <p className="flex items-center gap-2 font-display text-sm font-semibold text-foreground">
                        {isFirst && (
                          <span className="text-muted-foreground/60 line-through decoration-destructive/70">
                            {p.coins.toLocaleString()}
                          </span>
                        )}
                        <span className={isFirst ? "text-gold" : ""}>{pkgTotal.toLocaleString()} AceCoin</span>
                        {pkgExtra > 0 && (
                          <span className="rounded-full border border-gold/30 bg-gold/10 px-2 py-0.5 text-[10px] font-medium text-gold">
                            +{pkgExtra}% more
                          </span>
                        )}
                        {isFirst && (
                          <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-400">
                            x2
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground">{p.label} Package</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="font-display text-lg font-bold text-gold">₱{p.price.toLocaleString()}</p>
                    {selectedPkg === i && (
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-gold-gradient">
                        <Check className="h-3 w-3 text-primary-foreground" />
                      </div>
                    )}
                  </div>
                </div>
              </button>
              );
            })}
          </div>

          <div>
            <p className="mb-2 text-xs uppercase tracking-wider text-muted-foreground">Payment method</p>
            <div className="grid grid-cols-2 gap-2">
              {paymentMethods.map((m) => (
                <button
                  key={m.code}
                  onClick={() => setPayMethod(m.code)}
                  className={`rounded-lg border px-4 py-2.5 text-sm font-semibold transition-all ${
                    payMethod === m.code
                      ? "border-gold bg-gold/10 text-gold"
                      : "border-border/60 bg-card/60 text-muted-foreground hover:border-gold/40"
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          <Button
            onClick={() => handleDeposit(total, pkg.price)}
            disabled={processing}
            className="h-12 w-full bg-gold-gradient font-semibold text-primary-foreground shadow-[var(--shadow-gold)] hover:opacity-90"
          >
            {processing ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <ArrowDownCircle className="mr-2 h-4 w-4" />
            )}
            Pay ₱{pkg.price.toLocaleString()} for {total.toLocaleString()} AceCoin
          </Button>
          {isFirst && (
            <p className="text-center text-xs text-muted-foreground">
              First deposit doubles your coins! You receive <span className="font-semibold text-gold">{total.toLocaleString()}</span> instead of {pkg.coins.toLocaleString()}.
            </p>
          )}
        </div>
        );
      })() : (
        <div className="mt-4 space-y-3 rounded-xl border border-border/60 bg-card/60 p-5">
          <div className="flex items-center justify-between">
            <label className="text-xs uppercase tracking-wider text-muted-foreground">Amount (AceCoin)</label>
            <p className="text-xs text-muted-foreground">
              Available: <span className="font-semibold text-emerald-400">{user.withdrawable.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </p>
          </div>
          <Input value={amt} onChange={(e) => setAmt(e.target.value)} type="number" min="100" placeholder="Min 100" className="border-border bg-input" />

          <div>
            <label className="mb-1.5 block text-xs uppercase tracking-wider text-muted-foreground">Withdraw to</label>
            <div className="grid grid-cols-2 gap-2">
              {paymentMethods.map((m) => (
                <button
                  key={m.code}
                  onClick={() => setBankCode(m.code)}
                  className={`rounded-lg border px-4 py-2.5 text-sm font-semibold transition-all ${
                    bankCode === m.code
                      ? "border-gold bg-gold/10 text-gold"
                      : "border-border/60 bg-card/60 text-muted-foreground hover:border-gold/40"
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs uppercase tracking-wider text-muted-foreground">Account number</label>
            <Input value={accountNo} onChange={(e) => setAccountNo(e.target.value)} placeholder="e.g. 09171234567" className="border-border bg-input" />
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="mb-1.5 block text-xs uppercase tracking-wider text-muted-foreground">First name</label>
              <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} className="border-border bg-input" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs uppercase tracking-wider text-muted-foreground">Middle</label>
              <Input value={middleName} onChange={(e) => setMiddleName(e.target.value)} className="border-border bg-input" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs uppercase tracking-wider text-muted-foreground">Last name</label>
              <Input value={lastName} onChange={(e) => setLastName(e.target.value)} className="border-border bg-input" />
            </div>
          </div>

          <Button
            onClick={handleWithdraw}
            disabled={processing || amount < 100 || amount > user.withdrawable || !accountNo.trim() || !firstName.trim() || !lastName.trim()}
            variant="outline"
            className="h-11 w-full border-gold/40 font-semibold hover:border-gold hover:text-gold"
          >
            {processing ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <ArrowUpCircle className="mr-2 h-4 w-4" />
            )}
            Withdraw {amount.toLocaleString()} AceCoin
          </Button>
          <p className="text-center text-xs text-muted-foreground">
            Minimum withdrawal: 100 AceCoin. Only game winnings can be withdrawn.
          </p>
        </div>
      )}
    </div>
  );
}
