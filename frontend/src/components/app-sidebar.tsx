import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import logo from "@/assets/goldenace-logo.png";
import { browseNav, categoryNav, moreNav, type NavItem } from "@/lib/games";
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
        <SidebarSection label="Browse" items={browseNav} />
        <SidebarSection label="Categories" items={categoryNav} />
        <SidebarSection label="More" items={moreNav} />
      </SidebarContent>
    </Sidebar>
  );
}

function SidebarSection({ label, items }: { label: string; items: NavItem[] }) {
  const { setOpenMobile, isMobile } = useSidebar();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const scrollTo = (section: string) => {
    if (isMobile) setOpenMobile(false);

    const doScroll = () => {
      const el = document.getElementById(section);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      } else {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    };

    if (pathname !== "/") {
      navigate({ to: "/" }).then(() => {
        setTimeout(doScroll, 500);
      });
    } else {
      doScroll();
    }
  };

  return (
    <SidebarGroup>
      <SidebarGroupLabel className="text-[10px] uppercase tracking-widest text-muted-foreground">
        {label}
      </SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <SidebarMenuItem key={item.label}>
                <SidebarMenuButton
                  className="cursor-pointer transition-all duration-200 hover:translate-x-1 hover:bg-secondary hover:text-gold"
                  onClick={() => scrollTo(item.section)}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
