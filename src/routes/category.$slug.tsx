import { createFileRoute, useParams } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SiteLayout } from "@/components/SiteLayout";
import { ProductCard, type ProductCardData } from "@/components/ProductCard";
import { pickName, useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/category/$slug")({
  component: CategoryPage,
  head: ({ params }) => ({ meta: [{ title: `${params.slug} — QTRENDZ` }] }),
});

function CategoryPage() {
  const { slug } = useParams({ from: "/category/$slug" });
  const { lang } = useI18n();

  const cat = useQuery({
    queryKey: ["category", slug],
    queryFn: async () => {
      const { data, error } = await supabase.from("categories").select("*").eq("slug", slug).maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const products = useQuery({
    queryKey: ["products", "cat", cat.data?.id],
    enabled: !!cat.data?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("id,name_en,name_ar,price,compare_at_price,image_url,trending,stock")
        .eq("active", true)
        .eq("category_id", cat.data!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as ProductCardData[];
    },
  });

  return (
    <SiteLayout>
      <div className="mx-auto max-w-7xl px-4 md:px-8 py-10">
        <h1 className="font-display text-3xl md:text-4xl font-semibold">{cat.data ? pickName(cat.data, lang) : "…"}</h1>
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {products.data?.map((p) => <ProductCard key={p.id} p={p} />)}
        </div>
        {!products.isLoading && !products.data?.length && (
          <div className="py-16 text-center text-muted-foreground">No products in this category yet.</div>
        )}
      </div>
    </SiteLayout>
  );
}