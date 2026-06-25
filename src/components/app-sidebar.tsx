import { Link, useRouterState } from "@tanstack/react-router";
import { Home, Flame, Dices, Radio, Sparkles, Spade, Trophy, Heart, Gift } from "lucide-react";
import logo from "@/assets/goldenace-logo.png";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

type Item =
  | { label: string; icon: React.ElementType; to: "/"; hash?: string }
  | { label: string; icon: React.ElementType; to: "/category/$category"; params: { category: string } };

const browse: Item[] = [
  { label: "Home", icon: Home, to: "/" },
  { label: "Favorites", icon: Heart, to: "/category/$category", params: { category: "favorites" } },
  { label: "Featured", icon: Flame, to: "/category/$category", params: { category: "casino" } },
];

const categories: Item[] = [
  { label: "Slots", icon: Dices, to: "/category/$category", params: { category: "slots" } },
  { label: "Live Casino", icon: Radio, to: "/category/$category", params: { category: "live" } },
  { label: "Originals", icon: Sparkles, to: "/category/$category", params: { category: "originals" } },
  { label: "Table Games", icon: Spade, to: "/category/$category", params: { category: "tables" } },
];

const more: Item[] = [
  { label: "Promotions", icon: Gift, to: "/category/$category", params: { category: "promotions" } },
  { label: "VIP Club", icon: Trophy, to: "/category/$category", params: { category: "vip" } },
];

export function AppSidebar() {
  return (
    <Sidebar collapsible="offcanvas" className="border-r border-gold/20" aria-label="Main navigation">
      <SidebarHeader className="border-b border-border/60 bg-sidebar">
        <Link to="/" className="flex items-center gap-2 px-2 py-2" aria-label="GoldenAce home">
          <img src={logo} alt="GoldenAce" width={36} height={36} className="h-9 w-9" />
          <span className="font-display text-lg font-bold tracking-wider text-gold-gradient">
            GOLDENACE
          </span>
        </Link>
      </SidebarHeader>
      <SidebarContent className="bg-sidebar">
        <SidebarSection label="Browse" items={browse} />
        <SidebarSection label="Categories" items={categories} />
        <SidebarSection label="More" items={more} />
      </SidebarContent>
    </Sidebar>
  );
}

function SidebarSection({ label, items }: { label: string; items: Item[] }) {
  const { setOpenMobile, isMobile } = useSidebar();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <SidebarGroup>
      <SidebarGroupLabel className="text-[10px] uppercase tracking-widest text-muted-foreground">
        {label}
      </SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => {
            const Icon = item.icon;
            const active =
              item.to === "/"
                ? pathname === "/"
                : pathname === `/category/${item.params.category}`;
            const close = () => {
              if (isMobile) setOpenMobile(false);
            };
            return (
              <SidebarMenuItem key={item.label}>
                <SidebarMenuButton
                  asChild
                  isActive={active}
                  className="transition-all duration-200 data-[active=true]:bg-gold-gradient data-[active=true]:text-primary-foreground data-[active=true]:shadow-[var(--shadow-gold)] hover:translate-x-1 hover:bg-secondary hover:text-gold"
                >
                  {item.to === "/" ? (
                    <Link to="/" onClick={close} className="flex items-center gap-3">
                      <Icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </Link>
                  ) : (
                    <Link
                      to="/category/$category"
                      params={item.params}
                      onClick={close}
                      className="flex items-center gap-3"
                    >
                      <Icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </Link>
                  )}
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}