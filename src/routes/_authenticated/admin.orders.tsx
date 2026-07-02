import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { toast } from "sonner";
import { formatQAR, useI18n } from "@/lib/i18n";
import { X } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/orders")({ component: AdminOrders });

const STATUSES = ["pending", "confirmed", "out_for_delivery", "delivered", "cancelled"] as const;

function AdminOrders() {
  const { t, lang } = useI18n();
  const qc = useQueryClient();
  const [openId, setOpenId] = useState<string | null>(null);

  const orders = useQuery({
    queryKey: ["admin", "orders"],
    queryFn: async () => {
      const { data, error } = await supabase.from("orders").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const items = useQuery({
    queryKey: ["admin", "orderItems", openId],
    enabled: !!openId,
    queryFn: async () => {
      const { data, error } = await supabase.from("order_items").select("*").eq("order_id", openId!);
      if (error) throw error;
      return data;
    },
  });

  async function updateStatus(id: string, status: typeof STATUSES[number]) {
    const { error } = await supabase.from("orders").update({ status }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Updated");
    qc.invalidateQueries({ queryKey: ["admin", "orders"] });
  }

  const opened = orders.data?.find((o) => o.id === openId);

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold">{t("orders")}</h1>
      <div className="mt-6 overflow-hidden rounded-lg border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-secondary">
            <tr>
              <th className="p-3 text-start">#</th>
              <th className="p-3 text-start">{t("customer")}</th>
              <th className="p-3 text-start">Zone</th>
              <th className="p-3 text-start">{t("total")}</th>
              <th className="p-3 text-start">{t("status")}</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {orders.data?.map((o) => (
              <tr key={o.id} className="border-t border-border hover:bg-secondary/40">
                <td className="p-3">#{o.order_number}</td>
                <td className="p-3">{o.customer_name}<div className="text-xs text-muted-foreground">{o.phone}</div></td>
                <td className="p-3">{o.zone_name}</td>
                <td className="p-3">{formatQAR(Number(o.total), lang)}</td>
                <td className="p-3">
                  <select value={o.status} onChange={(e) => updateStatus(o.id, e.target.value as typeof STATUSES[number])} className="rounded-md border border-input bg-background px-2 py-1 text-xs">
                    {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
                <td className="p-3 text-end">
                  <button onClick={() => setOpenId(o.id)} className="text-sm text-primary hover:underline">View</button>
                </td>
              </tr>
            ))}
            {!orders.data?.length && <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">No orders yet</td></tr>}
          </tbody>
        </table>
      </div>

      {opened && (
        <div className="fixed inset-0 z-50 bg-foreground/40 backdrop-blur-sm grid place-items-center p-4" onClick={() => setOpenId(null)}>
          <div className="w-full max-w-lg rounded-xl bg-card border border-border shadow-elegant p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-xl font-semibold">Order #{opened.order_number}</h2>
              <button onClick={() => setOpenId(null)} className="grid h-8 w-8 place-items-center rounded hover:bg-accent"><X className="h-4 w-4" /></button>
            </div>
            <div className="text-sm space-y-1">
              <div><span className="text-muted-foreground">Customer:</span> {opened.customer_name}</div>
              <div><span className="text-muted-foreground">Phone:</span> <a href={`tel:${opened.phone}`} className="text-primary">{opened.phone}</a></div>
              <div><span className="text-muted-foreground">Zone:</span> {opened.zone_name}</div>
              <div><span className="text-muted-foreground">Address:</span> {opened.address}</div>
              {opened.notes && <div><span className="text-muted-foreground">Notes:</span> {opened.notes}</div>}
            </div>
            <div className="mt-4 border-t border-border pt-4">
              <div className="font-medium mb-2">{t("items")}</div>
              <div className="space-y-1 text-sm">
                {items.data?.map((i) => (
                  <div key={i.id} className="flex justify-between">
                    <span>{i.name_en} × {i.quantity}</span>
                    <span>{formatQAR(Number(i.price) * i.quantity, lang)}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 border-t border-border pt-3 space-y-1 text-sm">
                <div className="flex justify-between"><span>{t("subtotal")}</span><span>{formatQAR(Number(opened.subtotal), lang)}</span></div>
                <div className="flex justify-between"><span>{t("delivery")}</span><span>{formatQAR(Number(opened.delivery_fee), lang)}</span></div>
                <div className="flex justify-between font-semibold"><span>{t("total")}</span><span className="text-primary">{formatQAR(Number(opened.total), lang)}</span></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}