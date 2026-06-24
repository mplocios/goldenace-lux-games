import { Link } from "@tanstack/react-router";
import { Flame, Dices, Radio, Sparkles, Spade } from "lucide-react";

const pills = [
  { id: "casino", label: "Casino", icon: Flame },
  { id: "slots", label: "Slots", icon: Dices },
  { id: "live", label: "Live", icon: Radio },
  { id: "originals", label: "Originals", icon: Sparkles },
  { id: "tables", label: "Tables", icon: Spade },
] as const;

export function CategoryPills() {
  return (
    <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 scrollbar-hide sm:mx-0 sm:px-0">
      {pills.map(({ id, label, icon: Icon }) => (
        <Link
          key={id}
          to="/category/$category"
          params={{ category: id }}
          className="inline-flex shrink-0 items-center gap-2 rounded-full border border-gold/30 bg-card/60 px-4 py-2 text-xs font-medium uppercase tracking-wider text-foreground/90 backdrop-blur transition-all hover:-translate-y-0.5 hover:border-gold hover:bg-gold-gradient hover:text-primary-foreground hover:shadow-[var(--shadow-gold)]"
        >
          <Icon className="h-3.5 w-3.5" />
          {label}
        </Link>
      ))}
    </div>
  );
}