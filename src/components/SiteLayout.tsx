import { Link, useRouterState } from "@tanstack/react-router";
import { ShoppingBag, Menu, X, Instagram, Music2, Ghost, User } from "lucide-react";
import { useState, type ReactNode } from "react";
import { useI18n } from "@/lib/i18n";
import { useCart } from "@/lib/cart";
import { cn } from "@/lib/utils";

function LangSwitch() {
  const { lang, setLang } = useI18n();
  return (
    <button
      onClick={() => setLang(lang === "en" ? "ar" : "en")}
      className="rounded-full border border-border px-3 py-1 text-xs font-medium tracking-wide uppercase hover:bg-accent transition"
      aria-label="Toggle language"
    >
      {lang === "en" ? "العربية" : "English"}
    </button>
  );
}

export function SiteHeader() {
  const { t } = useI18n();
  const { count } = useCart();
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const links: Array<{ to: string; label: string }> = [
    { to: "/", label: t("home") },
    { to: "/products", label: t("all") },
    { to: "/category/gadgets", label: t("categories") },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 md:px-8">
        <Link to="/" className="flex items-center gap-2 group">
          <span className="grid h-8 w-8 place-items-center rounded-sm bg-primary text-primary-foreground font-display text-lg font-bold">T</span>
          <span className="font-display text-lg font-semibold tracking-tight">{t("brand")}</span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                pathname === l.to ? "text-primary" : "text-foreground/70",
              )}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <LangSwitch />
          <Link
            to="/cart"
            className="relative grid h-9 w-9 place-items-center rounded-full hover:bg-accent transition"
            aria-label={t("cart")}
          >
            <ShoppingBag className="h-5 w-5" />
            {count > 0 && (
              <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
                {count}
              </span>
            )}
          </Link>
          <Link
            to="/auth"
            className="grid h-9 w-9 place-items-center rounded-full hover:bg-accent transition"
            aria-label="Account"
          >
            <User className="h-5 w-5" />
          </Link>
          <button
            className="md:hidden grid h-9 w-9 place-items-center rounded-full hover:bg-accent"
            onClick={() => setOpen((o) => !o)}
            aria-label="Menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>
      {open && (
        <div className="md:hidden border-t border-border bg-background">
          <div className="mx-auto max-w-7xl px-4 py-4 flex flex-col gap-3">
            {links.map((l) => (
              <Link key={l.to} to={l.to} onClick={() => setOpen(false)} className="text-sm font-medium py-1">
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}

export function SiteFooter() {
  const { t } = useI18n();
  return (
    <footer className="mt-24 border-t border-border bg-secondary/40">
      <div className="mx-auto max-w-7xl px-4 md:px-8 py-12 grid gap-8 md:grid-cols-3">
        <div>
          <div className="font-display text-xl font-semibold">{t("brand")}</div>
          <p className="mt-2 text-sm text-muted-foreground max-w-xs">{t("tagline")}</p>
        </div>
        <div>
          <div className="text-sm font-semibold mb-3">{t("footerFollow")}</div>
          <div className="flex gap-3">
            <a href="https://www.tiktok.com/" target="_blank" rel="noopener noreferrer" aria-label="TikTok" className="grid h-10 w-10 place-items-center rounded-full border border-border hover:bg-primary hover:text-primary-foreground hover:border-primary transition"><Music2 className="h-4 w-4" /></a>
            <a href="https://www.instagram.com/" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="grid h-10 w-10 place-items-center rounded-full border border-border hover:bg-primary hover:text-primary-foreground hover:border-primary transition"><Instagram className="h-4 w-4" /></a>
            <a href="https://www.snapchat.com/" target="_blank" rel="noopener noreferrer" aria-label="Snapchat" className="grid h-10 w-10 place-items-center rounded-full border border-border hover:bg-primary hover:text-primary-foreground hover:border-primary transition"><Ghost className="h-4 w-4" /></a>
          </div>
        </div>
        <div className="md:text-end text-sm text-muted-foreground">
          <div>🇶🇦 Doha, Qatar</div>
          <div className="mt-1">© {new Date().getFullYear()} {t("brand")}</div>
        </div>
      </div>
    </footer>
  );
}

export function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}