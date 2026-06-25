import { Link, useRouterState } from "@tanstack/react-router";
import { Home, Dices, Spade, Radio, Heart, Gift } from "lucide-react";

const items = [
  { label: "Home", icon: Home, to: "/" as const },
  { label: "Casino", icon: Spade, category: "casino" },
  { label: "Slots", icon: Dices, category: "slots" },
  { label: "Live", icon: Radio, category: "live" },
  { label: "Favorites", icon: Heart, category: "favorites" },
  { label: "Promos", icon: Gift, category: "promotions" },
] as const;

export function BottomNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border/60 bg-background/95 backdrop-blur-xl lg:hidden"
      aria-label="Mobile navigation"
    >
      <ul className="mx-auto flex max-w-md items-stretch justify-around px-2 py-2">
        {items.map((item) => {
          const isHome = "to" in item;
          const active = isHome ? pathname === "/" : pathname === `/category/${item.category}`;
          const Icon = item.icon;
          const inner = (
            <span
              className={`flex flex-col items-center gap-1 px-3 py-1 transition-colors ${
                active ? "text-gold" : "text-muted-foreground hover:text-gold"
              }`}
            >
              <Icon className="h-5 w-5" aria-hidden="true" />
              <span className="text-[10px] font-medium uppercase tracking-wider">{item.label}</span>
            </span>
          );
          return (
            <li key={item.label}>
              {isHome ? (
                <Link to="/" aria-current={active ? "page" : undefined} aria-label={item.label}>
                  {inner}
                </Link>
              ) : (
                <Link
                  to="/category/$category"
                  params={{ category: item.category }}
                  aria-current={active ? "page" : undefined}
                  aria-label={item.label}
                >
                  {inner}
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}