import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SiteLayout } from "@/components/SiteLayout";
import { formatQAR, pickDesc, pickName, useI18n } from "@/lib/i18n";
import { useCart } from "@/lib/cart";
import { toast } from "sonner";
import { ImageOff, ShoppingBag, Truck } from "lucide-react";

export const Route = createFileRoute("/product/$id")({
  component: ProductPage,
});

function ProductPage() {
  const { id } = useParams({ from: "/product/$id" });
  const { lang, t } = useI18n();
  const cart = useCart();

  const { data: p, isLoading } = useQuery({
    queryKey: ["product", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("products").select("*").eq("id", id).maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) return <SiteLayout><div className="mx-auto max-w-6xl px-4 py-16">Loading…</div></SiteLayout>;
  if (!p) return <SiteLayout><div className="mx-auto max-w-6xl px-4 py-16">Product not found. <Link to="/products" className="text-primary underline">Browse all</Link></div></SiteLayout>;

  const outOfStock = p.stock <= 0;

  return (
    <SiteLayout>
      <div className="mx-auto max-w-6xl px-4 md:px-8 py-10 grid gap-10 md:grid-cols-2">
        <div className="relative aspect-square overflow-hidden rounded-xl bg-secondary">
          {p.image_url ? (
            <img src={p.image_url} alt={pickName(p, lang)} className="h-full w-full object-cover" />
          ) : (
            <div className="grid h-full w-full place-items-center text-muted-foreground"><ImageOff className="h-10 w-10" /></div>
          )}
          {p.trending && (
            <span className="absolute top-4 start-4 rounded-full bg-primary px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary-foreground">{t("trending")}</span>
          )}
        </div>
        <div>
          <h1 className="font-display text-3xl md:text-4xl font-semibold leading-tight">{pickName(p, lang)}</h1>
          <div className="mt-4 flex items-baseline gap-3">
            <span className="font-display text-3xl font-bold text-primary">{formatQAR(Number(p.price), lang)}</span>
            {p.compare_at_price && Number(p.compare_at_price) > Number(p.price) && (
              <span className="text-muted-foreground line-through">{formatQAR(Number(p.compare_at_price), lang)}</span>
            )}
          </div>
          <p className="mt-6 text-foreground/80 leading-relaxed whitespace-pre-line">{pickDesc(p, lang)}</p>

          <div className="mt-8">
            <button
              disabled={outOfStock}
              onClick={() => {
                cart.add({ id: p.id, name_en: p.name_en, name_ar: p.name_ar, price: Number(p.price), image_url: p.image_url });
                toast.success(t("addToCart"));
              }}
              className="inline-flex items-center gap-2 rounded-md bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-elegant hover:opacity-95 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ShoppingBag className="h-4 w-4" /> {outOfStock ? t("outOfStock") : t("addToCart")}
            </button>
          </div>

          <div className="mt-8 flex items-center gap-2 rounded-lg border border-border p-4 text-sm">
            <Truck className="h-5 w-5 text-primary" />
            <div>{t("codBadge")} · Qatar-wide delivery</div>
          </div>
        </div>
      </div>
    </SiteLayout>
  );
}