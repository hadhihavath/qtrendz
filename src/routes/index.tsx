import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SiteLayout } from "@/components/SiteLayout";
import { ProductCard, type ProductCardData } from "@/components/ProductCard";
import { useI18n, pickName } from "@/lib/i18n";
import { useState, useEffect } from "react";
import hero1 from "@/assets/hero1.png";
import hero2 from "@/assets/hero2.png";
import hero3 from "@/assets/hero3.png";
import { ArrowRight, Truck, ShieldCheck, Sparkles } from "lucide-react";
import { InteractiveHeroBackground } from "@/components/InteractiveHeroBackground";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const { t, lang } = useI18n();

  const trending = useQuery({
    queryKey: ["products", "trending"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("id,name_en,name_ar,price,compare_at_price,image_url,trending,stock")
        .eq("active", true)
        .eq("trending", true)
        .order("created_at", { ascending: false })
        .limit(8);
      if (error) throw error;
      return data as ProductCardData[];
    },
  });

  const dbHeroImages = trending.data && trending.data.length > 0
    ? trending.data.map((p) => p.image_url).filter(Boolean) as string[]
    : [];

  const heroImages = dbHeroImages.length > 0 ? dbHeroImages : [hero1, hero2, hero3];
  const [currentHeroIndex, setCurrentHeroIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentHeroIndex((prev) => (prev + 1) % heroImages.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [heroImages.length]);

  const latest = useQuery({
    queryKey: ["products", "latest"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("id,name_en,name_ar,price,compare_at_price,image_url,trending,stock")
        .eq("active", true)
        .order("created_at", { ascending: false })
        .limit(8);
      if (error) throw error;
      return data as ProductCardData[];
    },
  });

  const cats = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase.from("categories").select("*").order("sort_order");
      if (error) throw error;
      return data;
    },
  });

  return (
    <SiteLayout>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <InteractiveHeroBackground />
        <div className="mx-auto max-w-7xl px-4 md:px-8 pt-10 md:pt-20 pb-16 md:pb-28 grid gap-10 md:grid-cols-2 items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-accent px-3 py-1 text-xs font-medium text-primary">
              <Sparkles className="h-3.5 w-3.5" /> 🇶🇦 Made for Qatar
            </div>
            <h1 className="mt-5 font-display text-4xl md:text-6xl font-bold leading-[1.05] tracking-tight">
              {t("tagline")}
            </h1>
            <p className="mt-5 text-base md:text-lg text-muted-foreground max-w-lg">{t("heroSub")}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/products" className="inline-flex items-center gap-2 rounded-md bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:opacity-95 transition shadow-elegant">
                {t("shopNow")} <ArrowRight className="h-4 w-4 rtl:rotate-180" />
              </Link>
              <Link to="/category/$slug" params={{ slug: "gadgets" }} className="inline-flex items-center rounded-md border border-border px-6 py-3 text-sm font-semibold hover:bg-accent transition">
                {t("categories")}
              </Link>
            </div>
            <div className="mt-10 grid grid-cols-3 gap-4 max-w-md">
              <Feature icon={<Truck className="h-4 w-4" />} label={t("codBadge")} />
              <Feature icon={<ShieldCheck className="h-4 w-4" />} label="Quality checked" />
              <Feature icon={<Sparkles className="h-4 w-4" />} label="Trending picks" />
            </div>
          </div>
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl shadow-elegant">
            <div className="absolute -inset-4 bg-hero-gradient opacity-10 blur-3xl rounded-full" aria-hidden />
            {heroImages.map((img, idx) => (
              <img
                key={idx}
                src={img}
                alt="Qatar shopping"
                className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${
                  idx === currentHeroIndex ? "opacity-100" : "opacity-0 pointer-events-none"
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="mx-auto max-w-7xl px-4 md:px-8 py-10">
        <div className="flex items-baseline justify-between mb-6">
          <h2 className="font-display text-2xl md:text-3xl font-semibold">{t("categories")}</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {cats.data?.map((c) => (
            <Link key={c.id} to="/category/$slug" params={{ slug: c.slug }} className="group relative overflow-hidden rounded-lg border border-border bg-card p-6 hover:border-primary hover:shadow-card transition">
              <div className="text-xs uppercase tracking-widest text-muted-foreground">Shop</div>
              <div className="mt-2 font-display text-xl font-semibold group-hover:text-primary transition">{pickName(c, lang)}</div>
              <ArrowRight className="mt-4 h-4 w-4 text-primary rtl:rotate-180" />
            </Link>
          ))}
        </div>
      </section>

      {/* Trending */}
      {trending.data && trending.data.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 md:px-8 py-10">
          <div className="flex items-baseline justify-between mb-6">
            <h2 className="font-display text-2xl md:text-3xl font-semibold">{t("trending")}</h2>
            <Link to="/products" className="text-sm text-primary font-medium hover:underline">{t("browseAll")} →</Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {trending.data.map((p) => <ProductCard key={p.id} p={p} />)}
          </div>
        </section>
      )}

      {/* Latest */}
      {latest.data && latest.data.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 md:px-8 py-10">
          <div className="flex items-baseline justify-between mb-6">
            <h2 className="font-display text-2xl md:text-3xl font-semibold">{t("all")}</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {latest.data.map((p) => <ProductCard key={p.id} p={p} />)}
          </div>
        </section>
      )}

      {(!latest.isLoading && (!latest.data || latest.data.length === 0)) && (
        <section className="mx-auto max-w-2xl px-4 py-16 text-center">
          <div className="font-display text-2xl font-semibold">Products coming soon</div>
          <p className="mt-2 text-muted-foreground text-sm">Our team is curating the latest trending products from TikTok, Snapchat and Instagram. Check back shortly.</p>
        </section>
      )}
    </SiteLayout>
  );
}

function Feature({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="text-xs text-muted-foreground">
      <div className="mb-2 grid h-9 w-9 place-items-center rounded-full border border-border text-primary">{icon}</div>
      <div>{label}</div>
    </div>
  );
}
