import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SiteLayout } from "@/components/SiteLayout";
import { useCart } from "@/lib/cart";
import { formatQAR, pickName, useI18n } from "@/lib/i18n";
import { useMemo, useState } from "react";
import { z } from "zod";
import { toast } from "sonner";

export const Route = createFileRoute("/checkout")({ component: Checkout });

const schema = z.object({
  customer_name: z.string().trim().min(2).max(80),
  phone: z.string().trim().min(7).max(20).regex(/^[+\d\s-]+$/),
  address: z.string().trim().min(6).max(300),
  zone_id: z.string().uuid(),
  notes: z.string().trim().max(500).optional(),
});

function Checkout() {
  const { t, lang } = useI18n();
  const cart = useCart();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ customer_name: "", phone: "", address: "", zone_id: "", notes: "" });

  const zones = useQuery({
    queryKey: ["zones"],
    queryFn: async () => {
      const { data, error } = await supabase.from("delivery_zones").select("*").eq("active", true).order("fee");
      if (error) throw error;
      return data;
    },
  });

  const zone = useMemo(() => zones.data?.find((z) => z.id === form.zone_id), [zones.data, form.zone_id]);
  const deliveryFee = zone ? Number(zone.fee) : 0;
  const total = cart.subtotal + deliveryFee;

  if (cart.items.length === 0) {
    return <SiteLayout><div className="mx-auto max-w-2xl px-4 py-16 text-center text-muted-foreground">{t("emptyCart")}</div></SiteLayout>;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Please fill all fields");
      return;
    }
    setSubmitting(true);
    try {
      const zoneRow = zones.data?.find((z) => z.id === parsed.data.zone_id);
      const zoneName = zoneRow ? (lang === "ar" ? zoneRow.name_ar : zoneRow.name_en) : "";
      const { data: order, error: orderErr } = await supabase
        .from("orders")
        .insert({
          customer_name: parsed.data.customer_name,
          phone: parsed.data.phone,
          address: parsed.data.address,
          zone_id: parsed.data.zone_id,
          zone_name: zoneName,
          notes: parsed.data.notes ?? null,
          subtotal: cart.subtotal,
          delivery_fee: deliveryFee,
          total,
        })
        .select("id, order_number")
        .single();
      if (orderErr || !order) throw orderErr ?? new Error("Order failed");

      const items = cart.items.map((i) => ({
        order_id: order.id,
        product_id: i.id,
        name_en: i.name_en,
        name_ar: i.name_ar,
        price: i.price,
        quantity: i.quantity,
      }));
      const { error: itemsErr } = await supabase.from("order_items").insert(items);
      if (itemsErr) throw itemsErr;

      cart.clear();
      navigate({ to: "/order-success/$number", params: { number: String(order.order_number) } });
    } catch (err: any) {
      toast.error(err?.message ?? "Could not place order");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <SiteLayout>
      <div className="mx-auto max-w-5xl px-4 md:px-8 py-10 grid gap-8 md:grid-cols-[1fr_360px]">
        <form onSubmit={onSubmit} className="space-y-5">
          <h1 className="font-display text-3xl font-semibold">{t("checkout")}</h1>
          <Field label={t("fullName")}><input required value={form.customer_name} onChange={(e) => setForm({ ...form, customer_name: e.target.value })} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring" /></Field>
          <Field label={t("phone")}><input required type="tel" placeholder="+974 …" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring" /></Field>
          <Field label={t("address")}><textarea required rows={3} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring" /></Field>
          <Field label={t("zone")}>
            <select required value={form.zone_id} onChange={(e) => setForm({ ...form, zone_id: e.target.value })} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring">
              <option value="">{t("selectZone")}</option>
              {zones.data?.map((z) => (
                <option key={z.id} value={z.id}>{lang === "ar" ? z.name_ar : z.name_en} — {formatQAR(Number(z.fee), lang)}</option>
              ))}
            </select>
          </Field>
          <Field label={t("notes")}><textarea rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring" /></Field>

          <button type="submit" disabled={submitting} className="w-full rounded-md bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-elegant hover:opacity-95 transition disabled:opacity-60">
            {submitting ? "…" : t("placeOrder")}
          </button>
        </form>

        <aside className="h-fit rounded-lg border border-border bg-card p-6 shadow-card sticky top-24">
          <div className="font-medium mb-4">{t("orderDetails")}</div>
          <div className="space-y-2 text-sm">
            {cart.items.map((i) => (
              <div key={i.id} className="flex justify-between gap-2">
                <span className="truncate">{pickName(i, lang)} × {i.quantity}</span>
                <span>{formatQAR(i.price * i.quantity, lang)}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 border-t border-border pt-4 space-y-1 text-sm">
            <div className="flex justify-between"><span>{t("subtotal")}</span><span>{formatQAR(cart.subtotal, lang)}</span></div>
            <div className="flex justify-between"><span>{t("delivery")}</span><span>{formatQAR(deliveryFee, lang)}</span></div>
            <div className="flex justify-between font-semibold text-base pt-2"><span>{t("total")}</span><span className="text-primary">{formatQAR(total, lang)}</span></div>
          </div>
          <div className="mt-4 rounded-md bg-accent text-accent-foreground text-xs px-3 py-2 text-center font-medium">💵 {t("codBadge")}</div>
        </aside>
      </div>
    </SiteLayout>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="mb-1.5 text-sm font-medium">{label}</div>
      {children}
    </label>
  );
}