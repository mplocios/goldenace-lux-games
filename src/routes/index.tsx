import { createFileRoute } from "@tanstack/react-router";
import { Flame, Dices, Radio, Sparkles, Spade, Heart } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { BottomNav } from "@/components/bottom-nav";
import { Hero } from "@/components/hero";
import { GameRow } from "@/components/game-row";
import { categoryMap } from "@/lib/games";
import { GameSearch } from "@/components/game-search";
import { CategoryPills } from "@/components/category-pills";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { useFavorites } from "@/lib/favorites";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "GoldenAce — Luxury Online Casino" },
      { name: "description", content: "Play premium slots, live dealer tables and exclusive in-house games at GoldenAce, the luxury black & gold online casino." },
      { property: "og:title", content: "GoldenAce — Luxury Online Casino" },
      { property: "og:description", content: "Premium slots, live dealer tables and exclusive originals — all in one luxurious casino." },
    ],
  }),
  component: Index,
});

function Index() {
  const { ids } = useFavorites();
  const allGames = [
    ...categoryMap.slots.games,
    ...categoryMap.live.games,
    ...categoryMap.originals.games,
    ...categoryMap.tables.games,
  ];
  const favoriteGames = allGames.filter((g) => ids.includes(g.id));

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="min-h-screen pb-24 lg:pb-0">
        <SiteHeader />
        <main className="mx-auto w-full max-w-7xl space-y-12 px-4 py-6 sm:px-6 sm:py-10">
          <Hero />

          <CategoryPills />

          <GameSearch />

          {favoriteGames.length > 0 && (
            <GameRow
              id="favorites"
              title="Your Favorites"
              subtitle="Quick access to the games you love"
              icon={<Heart className="h-5 w-5" />}
              games={favoriteGames}
            />
          )}

          <GameRow
            id="casino"
            title="Featured Casino"
            subtitle="Hand-picked games trending right now"
            icon={<Flame className="h-5 w-5" />}
            games={categoryMap.casino.games.slice(0, 10)}
            categorySlug="casino"
          />

          <GameRow
            id="slots"
            title="Slot Games"
            subtitle="Spin the reels on the world's biggest slots"
            icon={<Dices className="h-5 w-5" />}
            games={categoryMap.slots.games.slice(0, 10)}
            categorySlug="slots"
          />

          <GameRow
            id="live"
            title="Live Casino"
            subtitle="Real dealers, real time, real winnings"
            icon={<Radio className="h-5 w-5" />}
            games={categoryMap.live.games.slice(0, 10)}
            categorySlug="live"
          />

          <GameRow
            id="originals"
            title="GoldenAce Originals"
            subtitle="Exclusive in-house games you won't find anywhere else"
            icon={<Sparkles className="h-5 w-5" />}
            games={categoryMap.originals.games.slice(0, 10)}
            categorySlug="originals"
          />

          <GameRow
            id="tables"
            title="Table Games"
            subtitle="The classics — blackjack, roulette, baccarat & more"
            icon={<Spade className="h-5 w-5" />}
            games={categoryMap.tables.games.slice(0, 10)}
            categorySlug="tables"
          />

          <footer id="promotions" className="border-t border-border/60 pt-10 text-center text-sm text-muted-foreground">
            <p className="font-display text-lg tracking-widest text-gold-gradient">GOLDENACE</p>
            <p className="mt-2">© {new Date().getFullYear()} GoldenAce. Play responsibly. 18+ only.</p>
          </footer>
        </main>
        <BottomNav />
      </SidebarInset>
    </SidebarProvider>
  );
}
