import { Link } from "@tanstack/react-router";
import { Shield, CreditCard, Bitcoin, Banknote, Landmark, MessageCircle } from "lucide-react";
import logo from "@/assets/goldenace-logo.png";

const footerLinks = {
  games: [
    { label: "Casino", category: "casino" },
    { label: "Slots", category: "slots" },
    { label: "Live Casino", category: "live" },
    { label: "Table Games", category: "tables" },
    { label: "Originals", category: "originals" },
  ],
  company: [
    { label: "About Us", href: "#" },
    { label: "Careers", href: "#" },
    { label: "Affiliates", href: "#" },
    { label: "Blog", href: "#" },
    { label: "Press", href: "#" },
  ],
  support: [
    { label: "Help Center", href: "#" },
    { label: "Live Chat", href: "#" },
    { label: "Email Support", href: "#" },
    { label: "FAQ", href: "#" },
  ],
  legal: [
    { label: "Terms of Service", href: "#" },
    { label: "Privacy Policy", href: "#" },
    { label: "Responsible Gaming", href: "#" },
    { label: "AML Policy", href: "#" },
  ],
};

const paymentMethods = [
  { name: "Visa", icon: CreditCard },
  { name: "Mastercard", icon: CreditCard },
  { name: "Bitcoin", icon: Bitcoin },
  { name: "Ethereum", icon: Bitcoin },
  { name: "Bank Transfer", icon: Landmark },
  { name: "Cash", icon: Banknote },
];

const socials = [
  { name: "Twitter", letter: "X" },
  { name: "Telegram", letter: "T" },
  { name: "Discord", letter: "D" },
  { name: "Instagram", letter: "I" },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-gold/20 bg-card/30">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-5">
          <div className="sm:col-span-2 lg:col-span-1">
            <Link to="/" className="inline-flex items-center gap-2">
              <img src={logo} alt="GoldenAce" width={36} height={36} className="h-9 w-9" />
              <span className="font-display text-lg font-bold tracking-wider text-gold-gradient shimmer-gold">
                GOLDENACE
              </span>
            </Link>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted-foreground">
              The premier luxury gaming destination. Licensed, secure, and built for winners.
            </p>
            <div className="mt-4 flex gap-2">
              {socials.map((s) => (
                <a
                  key={s.name}
                  href="#"
                  aria-label={s.name}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-gold/30 bg-card/60 text-xs font-bold text-muted-foreground transition-all hover:-translate-y-0.5 hover:border-gold hover:text-gold"
                >
                  {s.letter}
                </a>
              ))}
            </div>
          </div>

          <FooterColumn title="Games">
            {footerLinks.games.map((link) => (
              <li key={link.label}>
                <Link
                  to="/category/$category"
                  params={{ category: link.category }}
                  className="text-sm text-muted-foreground transition-colors hover:text-gold"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </FooterColumn>

          <FooterColumn title="Company">
            {footerLinks.company.map((link) => (
              <li key={link.label}>
                <a href={link.href} className="text-sm text-muted-foreground transition-colors hover:text-gold">
                  {link.label}
                </a>
              </li>
            ))}
          </FooterColumn>

          <FooterColumn title="Support">
            {footerLinks.support.map((link) => (
              <li key={link.label}>
                <a href={link.href} className="text-sm text-muted-foreground transition-colors hover:text-gold">
                  {link.label}
                </a>
              </li>
            ))}
          </FooterColumn>

          <FooterColumn title="Legal">
            {footerLinks.legal.map((link) => (
              <li key={link.label}>
                <a href={link.href} className="text-sm text-muted-foreground transition-colors hover:text-gold">
                  {link.label}
                </a>
              </li>
            ))}
          </FooterColumn>
        </div>

        <div className="mt-10 border-t border-border/60 pt-8">
          <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-between">
            <div>
              <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Accepted Payment Methods
              </p>
              <div className="flex flex-wrap gap-2">
                {paymentMethods.map((pm) => {
                  const Icon = pm.icon;
                  return (
                    <span
                      key={pm.name}
                      className="inline-flex items-center gap-1.5 rounded-md border border-border/60 bg-card/60 px-2.5 py-1.5 text-[11px] font-medium text-muted-foreground"
                    >
                      <Icon className="h-3.5 w-3.5" />
                      {pm.name}
                    </span>
                  );
                })}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5 rounded-md border border-gold/30 bg-card/60 px-3 py-1.5 text-[11px] font-medium text-gold">
                <Shield className="h-3.5 w-3.5" />
                SSL Encrypted
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-md border border-gold/30 bg-card/60 px-3 py-1.5 text-[11px] font-medium text-gold">
                <MessageCircle className="h-3.5 w-3.5" />
                24/7 Support
              </span>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-border/60 pt-6 text-center">
          <p className="text-xs leading-relaxed text-muted-foreground">
            &copy; {new Date().getFullYear()} GoldenAce. All rights reserved. Play responsibly. 18+ only.
            Gambling can be addictive. Please play within your means.
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="mb-3 font-display text-sm font-semibold uppercase tracking-wider text-gold">
        {title}
      </h3>
      <ul className="space-y-2">{children}</ul>
    </div>
  );
}
