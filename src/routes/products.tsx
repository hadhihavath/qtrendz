import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SiteLayout } from "@/components/SiteLayout";
import { ProductCard, type ProductCardData } from "@/components/ProductCard";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/products")({
  head: () => ({ meta: [{ title: "All Products — QTRENDZ" }, { name: "description", content: "Browse every trending product available across Qatar with cash on delivery." }] }),
  component: AllProducts,
});

function AllProducts() {
  const { t } = useI18n();
  const { data, isLoading } = useQuery({
    queryKey: ["products", "all"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("id,name_en,name_ar,price,compare_at_price,image_url,trending,stock")
        .eq("active", true)
        .order("trending", { ascending: false })
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as ProductCardData[];
    },
  });
  return (
    <SiteLayout>
      <div className="mx-auto max-w-7xl px-4 md:px-8 py-10">
        <h1 className="font-display text-3xl md:text-4xl font-semibold">{t("all")}</h1>
        <p className="mt-2 text-muted-foreground text-sm">{t("codBadge")} · Qatar</p>
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {isLoading && Array.from({ length: 8 }).map((_, i) => <div key={i} className="aspect-[3/4] rounded-lg bg-secondary animate-pulse" />)}
          {data?.map((p) => <ProductCard key={p.id} p={p} />)}
        </div>
        {!isLoading && !data?.length && <div className="py-16 text-center text-muted-foreground">No products yet.</div>}
      </div>
    </SiteLayout>
  );
}