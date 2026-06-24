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

const browse = [
  { label: "Home", icon: Home, href: "/" },
  { label: "Favorites", icon: Heart, href: "/#favorites" },
  { label: "Featured", icon: Flame, href: "/#casino" },
];

const categories = [
  { label: "Slots", icon: Dices, href: "/#slots" },
  { label: "Live Casino", icon: Radio, href: "/#live" },
  { label: "Originals", icon: Sparkles, href: "/#originals" },
  { label: "Table Games", icon: Spade, href: "/#tables" },
];

const more = [
  { label: "Promotions", icon: Gift, href: "/#promotions" },
  { label: "VIP Club", icon: Trophy, href: "/#promotions" },
];

export function AppSidebar() {
  return (
    <Sidebar collapsible="offcanvas" className="border-r border-gold/20">
      <SidebarHeader className="border-b border-border/60 bg-sidebar">
        <Link to="/" className="flex items-center gap-2 px-2 py-2">
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

function SidebarSection({
  label,
  items,
}: {
  label: string;
  items: { label: string; icon: React.ElementType; href: string }[];
}) {
  const { setOpenMobile, isMobile } = useSidebar();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const hash = useRouterState({ select: (s) => s.location.hash });
  const current = `${pathname}${hash ? "#" + hash : ""}`;
  return (
    <SidebarGroup>
      <SidebarGroupLabel className="text-[10px] uppercase tracking-widest text-muted-foreground">
        {label}
      </SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map(({ label: l, icon: Icon, href }) => (
            <SidebarMenuItem key={l}>
              <SidebarMenuButton
                asChild
                isActive={current === href || (href === "/" && pathname === "/" && !hash)}
                className="transition-all duration-200 data-[active=true]:bg-gold-gradient data-[active=true]:text-primary-foreground data-[active=true]:shadow-[var(--shadow-gold)] hover:translate-x-1 hover:bg-secondary hover:text-gold"
              >
                <a
                  href={href}
                  onClick={() => isMobile && setOpenMobile(false)}
                  className="flex items-center gap-3"
                >
                  <Icon className="h-4 w-4" />
                  <span>{l}</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}