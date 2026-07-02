import { Link } from "@tanstack/react-router";
import { formatQAR, pickName, useI18n } from "@/lib/i18n";
import { ImageOff } from "lucide-react";

export interface ProductCardData {
  id: string;
  name_en: string;
  name_ar: string;
  price: number;
  compare_at_price: number | null;
  image_url: string | null;
  trending: boolean;
  stock: number;
}

export function ProductCard({ p }: { p: ProductCardData }) {
  const { lang, t } = useI18n();
  return (
    <Link
      to="/product/$id"
      params={{ id: p.id }}
      className="group relative flex flex-col overflow-hidden rounded-lg border border-border bg-card shadow-card transition hover:shadow-elegant hover:-translate-y-0.5"
    >
      <div className="relative aspect-square overflow-hidden bg-secondary">
        {p.image_url ? (
          <img
            src={p.image_url}
            alt={pickName(p, lang)}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="grid h-full w-full place-items-center text-muted-foreground"><ImageOff className="h-8 w-8" /></div>
        )}
        {p.trending && (
          <span className="absolute top-3 start-3 rounded-full bg-primary px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary-foreground">
            {t("trending")}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1 p-4">
        <div className="line-clamp-2 text-sm font-medium">{pickName(p, lang)}</div>
        <div className="mt-auto flex items-baseline gap-2 pt-2">
          <span className="font-display text-lg font-semibold text-primary">{formatQAR(Number(p.price), lang)}</span>
          {p.compare_at_price != null && Number(p.compare_at_price) > Number(p.price) && (
            <span className="text-xs text-muted-foreground line-through">{formatQAR(Number(p.compare_at_price), lang)}</span>
          )}
        </div>
        {p.stock <= 0 && <div className="text-xs text-destructive">{t("outOfStock")}</div>}
      </div>
    </Link>
  );
}