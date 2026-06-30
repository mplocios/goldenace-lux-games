import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Flame, Dices, Radio, Sparkles, Spade, Heart, Gift, Trophy } from "lucide-react";
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
import { GameRowSkeleton } from "@/components/game-skeleton";
import { WinsTicker } from "@/components/wins-ticker";
import { SiteFooter } from "@/components/site-footer";
import { GoldParticles } from "@/components/gold-particles";
import { OrnamentDivider } from "@/components/ornament-divider";
import { ProviderMarquee } from "@/components/provider-marquee";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const { ids } = useFavorites();
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(t);
  }, []);

  const allGames = Object.values(categoryMap).flatMap((c) => c.games);
  const seen = new Set<string>();
  const favoriteGames = allGames.filter((g) => {
    if (!ids.includes(g.id) || seen.has(g.id)) return false;
    seen.add(g.id);
    return true;
  });

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="relative min-h-screen pb-24 lg:pb-0">
        <GoldParticles />
        <SiteHeader />
        <main id="main" className="relative z-10 mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-10">
          <div className="space-y-8">
            <Hero />

            <WinsTicker />
          </div>

          <OrnamentDivider />

          <div className="mt-8 space-y-4">
            <CategoryPills />
            <GameSearch />
          </div>

          {loading ? (
            <div className="mt-10">
              <GameRowSkeleton />
            </div>
          ) : favoriteGames.length > 0 ? (
            <div className="mt-10">
              <GameRow
                id="favorites"
                title="Your Favorites"
                subtitle={`${favoriteGames.length} saved game${favoriteGames.length === 1 ? "" : "s"} · view all to manage`}
                icon={<Heart className="h-5 w-5" />}
                games={favoriteGames.slice(0, 10)}
                categorySlug="favorites"
              />
            </div>
          ) : null}

          {loading ? (
            <div className="mt-10 space-y-10">
              <GameRowSkeleton />
              <GameRowSkeleton />
            </div>
          ) : (
            <>
              <div className="mt-10">
                <GameRow
                  id="casino"
                  title="Featured Casino"
                  subtitle="Hand-picked games trending right now"
                  icon={<Flame className="h-5 w-5" />}
                  games={categoryMap.casino.games.slice(0, 10)}
                  categorySlug="casino"
                />
              </div>
              <OrnamentDivider />
              <GameRow
                id="slots"
                title="Slot Games"
                subtitle="Spin the reels on the world's biggest slots"
                icon={<Dices className="h-5 w-5" />}
                games={categoryMap.slots.games.slice(0, 10)}
                categorySlug="slots"
              />
              <OrnamentDivider />
              <GameRow
                id="live"
                title="Live Casino"
                subtitle="Real dealers, real time, real winnings"
                icon={<Radio className="h-5 w-5" />}
                games={categoryMap.live.games.slice(0, 10)}
                categorySlug="live"
              />
              <OrnamentDivider />
              <GameRow
                id="originals"
                title="GoldenAce Originals"
                subtitle="Exclusive in-house games you won't find anywhere else"
                icon={<Sparkles className="h-5 w-5" />}
                games={categoryMap.originals.games.slice(0, 10)}
                categorySlug="originals"
              />
              <OrnamentDivider />
              <GameRow
                id="tables"
                title="Table Games"
                subtitle="The classics — blackjack, roulette, baccarat & more"
                icon={<Spade className="h-5 w-5" />}
                games={categoryMap.tables.games.slice(0, 10)}
                categorySlug="tables"
              />
              <OrnamentDivider />
              <GameRow
                id="promotions"
                title="Promotions"
                subtitle="Bonuses, free spins and limited-time events"
                icon={<Gift className="h-5 w-5" />}
                games={categoryMap.promotions.games.slice(0, 10)}
                categorySlug="promotions"
              />
              <OrnamentDivider />
              <GameRow
                id="vip"
                title="VIP Club"
                subtitle="Elite tables and exclusive winning suites"
                icon={<Trophy className="h-5 w-5" />}
                games={categoryMap.vip.games.slice(0, 10)}
                categorySlug="vip"
              />
            </>
          )}
          <div className="mt-12">
            <ProviderMarquee />
          </div>
        </main>
        <SiteFooter />
        <BottomNav />
      </SidebarInset>
    </SidebarProvider>
  );
}
