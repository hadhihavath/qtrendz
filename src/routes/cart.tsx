import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/SiteLayout";
import { useCart } from "@/lib/cart";
import { formatQAR, pickName, useI18n } from "@/lib/i18n";
import { Minus, Plus, Trash2 } from "lucide-react";

export const Route = createFileRoute("/cart")({ component: CartPage });

function CartPage() {
  const { t, lang } = useI18n();
  const cart = useCart();

  if (cart.items.length === 0) {
    return (
      <SiteLayout>
        <div className="mx-auto max-w-2xl px-4 py-20 text-center">
          <div className="font-display text-2xl md:text-3xl font-semibold">{t("emptyCart")}</div>
          <Link to="/products" className="mt-6 inline-block rounded-md bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground">{t("continueShopping")}</Link>
        </div>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <div className="mx-auto max-w-5xl px-4 md:px-8 py-10 grid gap-8 md:grid-cols-[1fr_360px]">
        <div>
          <h1 className="font-display text-3xl font-semibold">{t("cart")}</h1>
          <div className="mt-6 divide-y divide-border border border-border rounded-lg bg-card">
            {cart.items.map((i) => (
              <div key={i.id} className="flex items-center gap-4 p-4">
                <div className="h-16 w-16 rounded-md bg-secondary overflow-hidden flex-shrink-0">
                  {i.image_url && <img src={i.image_url} alt="" className="h-full w-full object-cover" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium line-clamp-2">{pickName(i, lang)}</div>
                  <div className="text-sm text-primary font-semibold mt-1">{formatQAR(i.price, lang)}</div>
                </div>
                <div className="flex items-center gap-1 border border-border rounded-md">
                  <button className="grid h-8 w-8 place-items-center hover:bg-accent" onClick={() => cart.setQty(i.id, i.quantity - 1)}><Minus className="h-3 w-3" /></button>
                  <span className="w-8 text-center text-sm">{i.quantity}</span>
                  <button className="grid h-8 w-8 place-items-center hover:bg-accent" onClick={() => cart.setQty(i.id, i.quantity + 1)}><Plus className="h-3 w-3" /></button>
                </div>
                <button className="text-muted-foreground hover:text-destructive p-2" onClick={() => cart.remove(i.id)} aria-label={t("remove")}><Trash2 className="h-4 w-4" /></button>
              </div>
            ))}
          </div>
        </div>
        <aside className="h-fit rounded-lg border border-border bg-card p-6 shadow-card sticky top-24">
          <div className="flex justify-between text-sm"><span>{t("subtotal")}</span><span className="font-medium">{formatQAR(cart.subtotal, lang)}</span></div>
          <div className="mt-2 flex justify-between text-xs text-muted-foreground"><span>{t("delivery")}</span><span>Calculated at checkout</span></div>
          <Link to="/checkout" className="mt-6 block w-full text-center rounded-md bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-elegant hover:opacity-95 transition">
            {t("checkout")}
          </Link>
          <div className="mt-3 text-center text-xs text-muted-foreground">💵 {t("codBadge")}</div>
        </aside>
      </div>
    </SiteLayout>
  );
}