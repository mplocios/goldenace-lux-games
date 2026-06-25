import { Sparkles, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroBanner from "@/assets/hero-banner.jpg";
import acecoin from "@/assets/acecoin.png";

export function Hero() {
  return (
    <section className="relative overflow-hidden rounded-2xl border border-gold/30 bg-card">
      <img
        src={heroBanner}
        alt="GoldenAce — premium casino tables and golden chips"
        width={1920}
        height={1024}
        className="absolute inset-0 h-full w-full object-cover opacity-70"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-background/10" />
      <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent" />

      <div className="relative grid gap-6 px-6 py-12 sm:px-10 sm:py-16 md:py-24 lg:px-14">
        <div className="inline-flex w-fit items-center gap-2 rounded-full border border-gold/40 bg-background/60 px-3 py-1 text-xs font-medium uppercase tracking-wider text-gold backdrop-blur">
          <Sparkles className="h-3.5 w-3.5" />
          Welcome Offer
        </div>
        <h1 className="max-w-2xl font-display text-4xl font-bold leading-tight tracking-tight text-foreground sm:text-5xl md:text-6xl">
          Where Fortune <br />
          <span className="text-gold-gradient">Meets Winning</span>
        </h1>
        <p className="max-w-xl text-base text-muted-foreground sm:text-lg">
          Step into the winner's circle. Unlock a 200% match bonus up to{" "}
          <span className="inline-flex items-center gap-1 font-semibold text-gold"><img src={acecoin} alt="" width={18} height={18} className="inline h-[18px] w-[18px]" />10,000 AceCoin</span> on your first deposit.
        </p>
        <div className="flex flex-wrap gap-3">
          <Button size="lg" className="h-12 bg-gold-gradient px-6 font-semibold text-primary-foreground shadow-[var(--shadow-gold)] hover:opacity-90">
            <Gift className="mr-2 h-5 w-5" />
            Claim Bonus
          </Button>
          <Button size="lg" variant="outline" className="h-12 border-gold/40 bg-background/40 px-6 font-semibold text-foreground backdrop-blur hover:border-gold hover:bg-secondary hover:text-gold">
            Browse Games
          </Button>
        </div>

        <dl className="mt-4 grid max-w-xl grid-cols-3 gap-4 border-t border-border/60 pt-6">
          <Stat value="2.4M" label="Jackpot" icon={acecoin} />
          <Stat value="12,840" label="Live players" />
          <Stat value="3,500+" label="Games" />
        </dl>
      </div>
    </section>
  );
}

function Stat({ value, label, icon }: { value: string; label: string; icon?: string }) {
  return (
    <div>
      <dt className="flex items-center gap-1 font-display text-xl font-semibold text-gold-gradient sm:text-2xl">
        {icon && <img src={icon} alt="" width={20} height={20} className="h-5 w-5" />}
        {value}
      </dt>
      <dd className="text-xs uppercase tracking-wider text-muted-foreground">{label}</dd>
    </div>
  );
}