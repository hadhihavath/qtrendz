import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatQAR, useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/_authenticated/admin/")({ component: Dashboard });

function Dashboard() {
  const { t, lang } = useI18n();

  const stats = useQuery({
    queryKey: ["admin", "stats"],
    queryFn: async () => {
      const [products, orders, pending, revenue] = await Promise.all([
        supabase.from("products").select("id", { count: "exact", head: true }),
        supabase.from("orders").select("id", { count: "exact", head: true }),
        supabase.from("orders").select("id", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("orders").select("total").neq("status", "cancelled"),
      ]);
      const totalRevenue = (revenue.data ?? []).reduce((s, r: any) => s + Number(r.total), 0);
      return {
        products: products.count ?? 0,
        orders: orders.count ?? 0,
        pending: pending.count ?? 0,
        revenue: totalRevenue,
      };
    },
  });

  const recent = useQuery({
    queryKey: ["admin", "recent-orders"],
    queryFn: async () => {
      const { data, error } = await supabase.from("orders").select("*").order("created_at", { ascending: false }).limit(8);
      if (error) throw error;
      return data;
    },
  });

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold">{t("dashboard")}</h1>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label={t("products")} value={stats.data?.products ?? "—"} />
        <Stat label={t("orders")} value={stats.data?.orders ?? "—"} />
        <Stat label="Pending" value={stats.data?.pending ?? "—"} />
        <Stat label="Revenue" value={stats.data ? formatQAR(stats.data.revenue, lang) : "—"} />
      </div>

      <h2 className="mt-12 font-display text-xl font-semibold">Recent orders</h2>
      <div className="mt-4 overflow-hidden rounded-lg border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-secondary text-start">
            <tr>
              <th className="p-3 text-start">#</th>
              <th className="p-3 text-start">{t("customer")}</th>
              <th className="p-3 text-start">Zone</th>
              <th className="p-3 text-start">{t("total")}</th>
              <th className="p-3 text-start">{t("status")}</th>
            </tr>
          </thead>
          <tbody>
            {recent.data?.map((o) => (
              <tr key={o.id} className="border-t border-border">
                <td className="p-3">#{o.order_number}</td>
                <td className="p-3">{o.customer_name}<div className="text-xs text-muted-foreground">{o.phone}</div></td>
                <td className="p-3">{o.zone_name}</td>
                <td className="p-3">{formatQAR(Number(o.total), lang)}</td>
                <td className="p-3"><span className="rounded-full bg-accent text-accent-foreground px-2 py-0.5 text-xs">{o.status}</span></td>
              </tr>
            ))}
            {!recent.data?.length && <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">No orders yet</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-border bg-card p-5 shadow-card">
      <div className="text-xs uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className="mt-2 font-display text-2xl font-semibold">{value}</div>
    </div>
  );
}