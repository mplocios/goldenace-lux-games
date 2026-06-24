import { Link, useNavigate } from "@tanstack/react-router";
import { User as UserIcon, Wallet, Settings, LogOut } from "lucide-react";
import { useAuth } from "@/lib/auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function UserMenu() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  if (!user) return null;
  const initial = user.name.charAt(0).toUpperCase();

  return (
    <div className="flex items-center gap-2">
      <div className="hidden rounded-full border border-gold/30 bg-card/60 px-3 py-1.5 text-xs font-semibold text-gold backdrop-blur sm:block">
        ${user.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            aria-label="Account menu"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-gold-gradient font-display text-sm font-bold text-primary-foreground shadow-[var(--shadow-gold)] transition-transform hover:scale-105"
          >
            {initial}
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56 border-gold/30 bg-card">
          <DropdownMenuLabel className="flex flex-col">
            <span className="font-semibold text-foreground">{user.name}</span>
            <span className="text-xs font-normal text-muted-foreground">{user.id}</span>
            <span className="mt-1 text-xs font-semibold text-gold sm:hidden">
              ${user.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link to="/profile" className="cursor-pointer">
              <UserIcon className="mr-2 h-4 w-4" /> Profile
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link to="/wallet" className="cursor-pointer">
              <Wallet className="mr-2 h-4 w-4" /> Wallet
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link to="/settings" className="cursor-pointer">
              <Settings className="mr-2 h-4 w-4" /> Settings
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => {
              logout();
              navigate({ to: "/" });
            }}
            className="cursor-pointer text-destructive focus:text-destructive"
          >
            <LogOut className="mr-2 h-4 w-4" /> Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}