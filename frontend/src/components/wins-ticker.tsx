import { Trophy } from "lucide-react";
import acecoin from "@/assets/acecoin.png";

const wins = [
  { player: "A****r", amount: "12,500", game: "Dragon's Fortune" },
  { player: "J****n", amount: "8,340", game: "Mega Jackpot" },
  { player: "S****a", amount: "45,000", game: "Royal Blackjack" },
  { player: "M****k", amount: "3,200", game: "Diamond Riches" },
  { player: "L****e", amount: "67,800", game: "Cashback Roulette" },
  { player: "R****o", amount: "15,900", game: "Pharaoh's Gold" },
  { player: "K****y", amount: "22,100", game: "Plinko Blast" },
  { player: "D****s", amount: "9,750", game: "Crash Rocket" },
  { player: "T****a", amount: "31,400", game: "VIP Baccarat" },
  { player: "N****l", amount: "5,600", game: "Mines Pro" },
];

function WinItem({ player, amount, game }: (typeof wins)[number]) {
  return (
    <span className="inline-flex shrink-0 items-center gap-2 rounded-full border border-gold/20 bg-card/60 px-3 py-1 text-xs backdrop-blur">
      <Trophy className="h-3 w-3 text-gold" />
      <span className="font-medium text-foreground">{player}</span>
      <span className="text-muted-foreground">won</span>
      <span className="inline-flex items-center gap-0.5 font-semibold text-gold">
        <img src={acecoin} alt="" width={12} height={12} className="h-3 w-3" />
        {amount}
      </span>
      <span className="text-muted-foreground">on</span>
      <span className="font-medium text-foreground">{game}</span>
    </span>
  );
}

export function WinsTicker() {
  return (
    <div className="relative overflow-hidden rounded-xl border border-gold/20 bg-card/40 py-2.5">
      <div className="absolute left-0 top-0 z-10 h-full w-12 bg-gradient-to-r from-card/90 to-transparent" />
      <div className="absolute right-0 top-0 z-10 h-full w-12 bg-gradient-to-l from-card/90 to-transparent" />
      <div className="flex gap-4" style={{ animation: "marquee 80s linear infinite", width: "max-content" }}>
        {[...wins, ...wins].map((w, i) => (
          <WinItem key={i} {...w} />
        ))}
      </div>
    </div>
  );
}
