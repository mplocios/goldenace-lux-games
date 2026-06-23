import { Link } from "@tanstack/react-router";
import { Home, Dices, Spade, Radio, Trophy } from "lucide-react";

const items = [
  { label: "Home", icon: Home, href: "/" },
  { label: "Casino", icon: Spade, href: "#casino" },
  { label: "Slots", icon: Dices, href: "#slots" },
  { label: "Live", icon: Radio, href: "#live" },
  { label: "Promos", icon: Trophy, href: "#promotions" },
];

export function BottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border/60 bg-background/95 backdrop-blur-xl lg:hidden">
      <ul className="mx-auto flex max-w-md items-stretch justify-around px-2 py-2">
        {items.map(({ label, icon: Icon, href }) => {
          const isAnchor = href.startsWith("#");
          const content = (
            <div className="flex flex-col items-center gap-1 px-3 py-1 text-muted-foreground transition-colors hover:text-gold">
              <Icon className="h-5 w-5" />
              <span className="text-[10px] font-medium uppercase tracking-wider">{label}</span>
            </div>
          );
          return (
            <li key={label}>
              {isAnchor ? (
                <a href={href}>{content}</a>
              ) : (
                <Link to={href}>{content}</Link>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}