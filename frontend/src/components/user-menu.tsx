import { Link, useNavigate } from "@tanstack/react-router";
import { User as UserIcon, Wallet, Settings, LogOut } from "lucide-react";
import { useAuth } from "@/lib/auth";
import acecoin from "@/assets/acecoin.png";
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
      <Link
        to="/wallet"
        aria-label={`AceCoin balance ${user.balance.toLocaleString()}. Open wallet.`}
        className="hidden items-center gap-1.5 rounded-full border border-gold/30 bg-card/60 py-1 pl-1 pr-3 text-xs font-semibold text-gold backdrop-blur transition-all hover:border-gold hover:shadow-[var(--shadow-gold)] sm:inline-flex"
      >
        <img src={acecoin} alt="" width={20} height={20} className="h-5 w-5" loading="lazy" />
        {user.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
      </Link>
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
            {user.playerId && <span className="text-xs font-normal text-muted-foreground">{user.playerId}</span>}
            <span className="mt-1 inline-flex items-center gap-1.5 text-xs font-semibold text-gold sm:hidden">
              <img src={acecoin} alt="" width={16} height={16} className="h-4 w-4" loading="lazy" />
              {user.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })} AceCoin
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