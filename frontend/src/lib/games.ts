import { Home, Flame, Dices, Radio, Sparkles, Spade, Trophy, Heart, Gift } from "lucide-react";
import type { Game } from "@/components/game-card";
import pharaoh from "@/assets/game-pharaoh.jpg";
import dragon from "@/assets/game-dragon.jpg";
import diamond from "@/assets/game-diamond.jpg";
import royal from "@/assets/game-royal.jpg";
import blackjack from "@/assets/game-blackjack.jpg";
import roulette from "@/assets/game-roulette.jpg";
import baccarat from "@/assets/game-baccarat.jpg";
import crash from "@/assets/game-crash.jpg";
import mines from "@/assets/game-mines.jpg";
import plinko from "@/assets/game-plinko.jpg";
import dice from "@/assets/game-dice.jpg";
import poker from "@/assets/game-poker.jpg";


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
];

export const moreNav: NavItem[] = [
  { label: "Promotions", icon: Gift, section: "promotions" },
  { label: "VIP Club", icon: Trophy, section: "vip" },
];


export const slotGames: Game[] = [
  { id: "pharaoh", title: "Golden Pharaoh", provider: "Pragmatic", image: pharaoh, tag: "Hot", players: 1842 },
  { id: "dragon", title: "Lucky Dragon", provider: "PG Soft", image: dragon, players: 1204 },
  { id: "diamond", title: "Diamond Riches", provider: "NetEnt", image: diamond, tag: "New", players: 982 },
  { id: "royal", title: "Royal Fortune", provider: "Play'n GO", image: royal, players: 1530 },
  { id: "pharaoh2", title: "Pharaoh's Gold II", provider: "Novomatic", image: pharaoh, players: 720 },
  { id: "dragon2", title: "Dragon Wilds", provider: "Red Tiger", image: dragon, players: 612 },
];

export const liveGames: Game[] = [
  { id: "blackjack", title: "VIP Blackjack", provider: "Evolution", image: blackjack, tag: "Live", players: 342 },
  { id: "roulette", title: "Lightning Roulette", provider: "Evolution", image: roulette, tag: "Live", players: 891 },
  { id: "baccarat", title: "Speed Baccarat", provider: "Pragmatic Live", image: baccarat, tag: "Live", players: 256 },
  { id: "poker", title: "Casino Hold'em", provider: "Evolution", image: poker, tag: "Live", players: 184 },
  { id: "blackjack2", title: "Salon Privé Blackjack", provider: "Evolution", image: blackjack, tag: "VIP", players: 64 },
  { id: "roulette2", title: "Auto Roulette", provider: "Pragmatic Live", image: roulette, players: 423 },
];

export const originals: Game[] = [
  { id: "crash", title: "GoldenAce Crash", provider: "GoldenAce", image: crash, tag: "Original", players: 2134 },
  { id: "mines", title: "Mines", provider: "GoldenAce", image: mines, tag: "Original", players: 1102 },
  { id: "plinko", title: "Plinko Royale", provider: "GoldenAce", image: plinko, tag: "Original", players: 1840 },
  { id: "dice", title: "Golden Dice", provider: "GoldenAce", image: dice, tag: "Original", players: 678 },
  { id: "crash2", title: "Limbo", provider: "GoldenAce", image: crash, players: 521 },
  { id: "mines2", title: "Keno Gold", provider: "GoldenAce", image: mines, players: 318 },
];

export const tableGames: Game[] = [
  { id: "t-blackjack", title: "Classic Blackjack", provider: "GoldenAce", image: blackjack, players: 142 },
  { id: "t-roulette", title: "European Roulette", provider: "GoldenAce", image: roulette, players: 198 },
  { id: "t-baccarat", title: "Punto Banco", provider: "GoldenAce", image: baccarat, players: 88 },
  { id: "t-poker", title: "Three Card Poker", provider: "GoldenAce", image: poker, players: 76 },
  { id: "t-dice", title: "Sic Bo", provider: "GoldenAce", image: dice, players: 54 },
  { id: "t-royal", title: "Pai Gow Poker", provider: "GoldenAce", image: royal, players: 32 },
];

export const promotionGames: Game[] = [
  { id: "p-bonus", title: "Welcome Bonus Spins", provider: "GoldenAce", image: diamond, tag: "Bonus", players: 920 },
  { id: "p-cashback", title: "Cashback Roulette", provider: "GoldenAce", image: roulette, tag: "Promo", players: 412 },
  { id: "p-jackpot", title: "Mega Jackpot Drop", provider: "Pragmatic", image: pharaoh, tag: "Jackpot", players: 1840 },
  { id: "p-freeplay", title: "Free Play Friday", provider: "GoldenAce", image: crash, tag: "Free", players: 612 },
  { id: "p-tourney", title: "Daily Tournament", provider: "GoldenAce", image: mines, tag: "Event", players: 380 },
  { id: "p-leader", title: "Leaderboard Race", provider: "Evolution", image: blackjack, tag: "Race", players: 244 },
];

export const vipGames: Game[] = [
  { id: "v-salon", title: "Salon Privé Blackjack", provider: "Evolution", image: blackjack, tag: "VIP", players: 64 },
  { id: "v-highroller", title: "High-Roller Roulette", provider: "Evolution", image: roulette, tag: "VIP", players: 88 },
  { id: "v-baccarat", title: "VIP Baccarat Suite", provider: "Pragmatic Live", image: baccarat, tag: "VIP", players: 52 },
  { id: "v-diamond", title: "Diamond Reels Exclusive", provider: "NetEnt", image: diamond, tag: "Exclusive", players: 132 },
  { id: "v-royal", title: "Royal Fortune VIP", provider: "Play'n GO", image: royal, tag: "VIP", players: 96 },
  { id: "v-poker", title: "Private Poker Lounge", provider: "Evolution", image: poker, tag: "VIP", players: 38 },
];

function expand(base: Game[], target: number): Game[] {
  const out: Game[] = [];
  for (let i = 0; i < target; i++) {
    const g = base[i % base.length];
    const lap = Math.floor(i / base.length);
    // Deterministic pseudo-random so SSR + client agree (no hydration mismatch)
    const seed = ((i * 9301 + 49297) % 233280) / 233280;
    out.push({
      ...g,
      id: `${g.id}-${i}`,
      title: lap === 0 ? g.title : `${g.title} ${["II", "III", "IV", "V", "VI", "VII", "VIII", "IX"][lap - 1] ?? lap + 1}`,
      players: g.players ? Math.max(20, Math.floor(g.players * (0.4 + seed))) : undefined,
    });
  }
  return out;
}

export const categoryMap = {
  slots: { label: "Slot Games", games: expand(slotGames, 50) },
  live: { label: "Live Casino", games: expand(liveGames, 50) },
  originals: { label: "GoldenAce Originals", games: expand(originals, 50) },
  tables: { label: "Table Games", games: expand(tableGames, 50) },
  casino: { label: "Featured Casino", games: expand([...slotGames.slice(0, 3), ...originals.slice(0, 3)], 50) },
  promotions: { label: "Promotions", games: expand(promotionGames, 50) },
  vip: { label: "VIP Club", games: expand(vipGames, 50) },
} as const;

export type CategoryId = keyof typeof categoryMap;