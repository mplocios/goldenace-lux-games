import { Link } from "@tanstack/react-router";
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
} from "@/components/ui/sidebar";

const browse = [
  { label: "Home", icon: Home, href: "/" },
  { label: "Favorites", icon: Heart, href: "#favorites" },
  { label: "Featured", icon: Flame, href: "#casino" },
];

const categories = [
  { label: "Slots", icon: Dices, href: "#slots" },
  { label: "Live Casino", icon: Radio, href: "#live" },
  { label: "Originals", icon: Sparkles, href: "#originals" },
  { label: "Table Games", icon: Spade, href: "#tables" },
];

const more = [
  { label: "Promotions", icon: Gift, href: "#promotions" },
  { label: "VIP Club", icon: Trophy, href: "#promotions" },
];

export function AppSidebar() {
  return (
    <Sidebar collapsible="offcanvas" className="border-r border-border/60">
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
  return (
    <SidebarGroup>
      <SidebarGroupLabel className="text-[10px] uppercase tracking-widest text-muted-foreground">
        {label}
      </SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map(({ label: l, icon: Icon, href }) => (
            <SidebarMenuItem key={l}>
              <SidebarMenuButton asChild className="hover:bg-secondary hover:text-gold">
                {href.startsWith("#") ? (
                  <a href={href} className="flex items-center gap-3">
                    <Icon className="h-4 w-4" />
                    <span>{l}</span>
                  </a>
                ) : (
                  <Link to={href} className="flex items-center gap-3">
                    <Icon className="h-4 w-4" />
                    <span>{l}</span>
                  </Link>
                )}
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}