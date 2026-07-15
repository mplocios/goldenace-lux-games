import { Home, Flame, Dices, Radio, Sparkles, Spade, Trophy, Heart, Gift, Zap, CircleDot } from "lucide-react";

export interface NavItem {
  label: string;
  icon: React.ElementType;
  section: string;
}

export const browseNav: NavItem[] = [
  { label: "Home", icon: Home, section: "main" },
  { label: "Favorites", icon: Heart, section: "favorites" },
  { label: "Featured", icon: Flame, section: "casino" },
];

export const categoryNav: NavItem[] = [
  { label: "Slots", icon: Dices, section: "slots" },
  { label: "Live Casino", icon: Radio, section: "live" },
  { label: "Originals", icon: Sparkles, section: "originals" },
  { label: "Table Games", icon: Spade, section: "tables" },
  { label: "Crash", icon: Zap, section: "crash" },
  { label: "Bingo", icon: CircleDot, section: "bingo" },
];

export const moreNav: NavItem[] = [
  { label: "Promotions", icon: Gift, section: "promotions" },
  { label: "VIP Club", icon: Trophy, section: "vip" },
];

export const categoryLabels: Record<string, string> = {
  casino: "Featured Casino",
  slots: "Slot Games",
  live: "Live Casino",
  originals: "GoldenAce Originals",
  tables: "Table Games",
  crash: "Crash & Instant",
  bingo: "Bingo",
  promotions: "Promotions",
  vip: "VIP Club",
};

export const validCategories = ["casino", "slots", "live", "originals", "tables", "crash", "bingo", "promotions", "vip"] as const;
export type CategoryId = (typeof validCategories)[number];

export function isValidCategory(s: string): s is CategoryId {
  return (validCategories as readonly string[]).includes(s);
}
