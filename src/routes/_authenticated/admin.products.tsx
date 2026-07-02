import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { toast } from "sonner";
import { formatQAR, useI18n } from "@/lib/i18n";
import { Pencil, Plus, Trash2, X } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/products")({ component: AdminProducts });

interface ProductRow {
  id: string;
  name_en: string;
  name_ar: string;
  description_en: string | null;
  description_ar: string | null;
  price: number;
  compare_at_price: number | null;
  image_url: string | null;
  stock: number;
  trending: boolean;
  active: boolean;
  category_id: string | null;
}

function AdminProducts() {
  const { t, lang } = useI18n();
  const qc = useQueryClient();
  const [editing, setEditing] = useState<Partial<ProductRow> | null>(null);

  const products = useQuery({
    queryKey: ["admin", "products"],
    queryFn: async () => {
      const { data, error } = await supabase.from("products").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data as ProductRow[];
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

  async function save(form: Partial<ProductRow>) {
    const payload: any = {
      name_en: form.name_en?.trim(),
      name_ar: form.name_ar?.trim(),
      description_en: form.description_en ?? null,
      description_ar: form.description_ar ?? null,
      price: Number(form.price),
      compare_at_price: form.compare_at_price ? Number(form.compare_at_price) : null,
      image_url: form.image_url || null,
      stock: Number(form.stock ?? 0),
      trending: !!form.trending,
      active: form.active ?? true,
      category_id: form.category_id || null,
    };
    if (!payload.name_en || !payload.name_ar || !payload.price) {
      toast.error("Name (EN/AR) and price are required");
      return;
    }
    let error;
    if (form.id) ({ error } = await supabase.from("products").update(payload).eq("id", form.id));
    else ({ error } = await supabase.from("products").insert(payload));
    if (error) return toast.error(error.message);
    toast.success("Saved");
    setEditing(null);
    qc.invalidateQueries({ queryKey: ["admin", "products"] });
    qc.invalidateQueries({ queryKey: ["products"] });
  }

  async function del(id: string) {
    if (!confirm("Delete this product?")) return;
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Deleted");
    qc.invalidateQueries({ queryKey: ["admin", "products"] });
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl font-semibold">{t("products")}</h1>
        <button onClick={() => setEditing({ active: true, stock: 10, trending: false })} className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-elegant">
          <Plus className="h-4 w-4" /> {t("newProduct")}
        </button>
      </div>

      <div className="mt-6 overflow-hidden rounded-lg border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-secondary">
            <tr>
              <th className="p-3 text-start">Product</th>
              <th className="p-3 text-start">{t("price")}</th>
              <th className="p-3 text-start">{t("stock")}</th>
              <th className="p-3 text-start">{t("active")}</th>
              <th className="p-3 text-start">{t("markTrending")}</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {products.data?.map((p) => (
              <tr key={p.id} className="border-t border-border">
                <td className="p-3">
                  <div className="flex items-center gap-3">
                    {p.image_url && <img src={p.image_url} className="h-10 w-10 rounded object-cover" alt="" />}
                    <div>
                      <div className="font-medium">{p.name_en}</div>
                      <div className="text-xs text-muted-foreground">{p.name_ar}</div>
                    </div>
                  </div>
                </td>
                <td className="p-3">{formatQAR(Number(p.price), lang)}</td>
                <td className="p-3">{p.stock}</td>
                <td className="p-3">{p.active ? "✓" : "—"}</td>
                <td className="p-3">{p.trending ? "★" : "—"}</td>
                <td className="p-3">
                  <div className="flex gap-1 justify-end">
                    <button onClick={() => setEditing(p)} className="grid h-8 w-8 place-items-center rounded hover:bg-accent"><Pencil className="h-4 w-4" /></button>
                    <button onClick={() => del(p.id)} className="grid h-8 w-8 place-items-center rounded hover:bg-accent text-destructive"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
            {!products.data?.length && <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">No products yet</td></tr>}
          </tbody>
        </table>
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 bg-foreground/40 backdrop-blur-sm grid place-items-center p-4" onClick={() => setEditing(null)}>
          <div className="w-full max-w-2xl rounded-xl bg-card border border-border shadow-elegant p-6 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-xl font-semibold">{editing.id ? t("edit") : t("newProduct")}</h2>
              <button onClick={() => setEditing(null)} className="grid h-8 w-8 place-items-center rounded hover:bg-accent"><X className="h-4 w-4" /></button>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <TextField label="Name (EN)" value={editing.name_en ?? ""} onChange={(v) => setEditing({ ...editing, name_en: v })} />
              <TextField label="Name (AR)" value={editing.name_ar ?? ""} onChange={(v) => setEditing({ ...editing, name_ar: v })} dir="rtl" />
              <TextArea label="Description (EN)" value={editing.description_en ?? ""} onChange={(v) => setEditing({ ...editing, description_en: v })} />
              <TextArea label="Description (AR)" value={editing.description_ar ?? ""} onChange={(v) => setEditing({ ...editing, description_ar: v })} dir="rtl" />
              <TextField label="Price (QAR)" type="number" value={String(editing.price ?? "")} onChange={(v) => setEditing({ ...editing, price: Number(v) })} />
              <TextField label="Compare at price (optional)" type="number" value={String(editing.compare_at_price ?? "")} onChange={(v) => setEditing({ ...editing, compare_at_price: v ? Number(v) : null })} />
              <TextField label="Stock" type="number" value={String(editing.stock ?? 0)} onChange={(v) => setEditing({ ...editing, stock: Number(v) })} />
              <div>
                <label className="mb-1.5 block text-sm font-medium">{t("category")}</label>
                <select value={editing.category_id ?? ""} onChange={(e) => setEditing({ ...editing, category_id: e.target.value || null })} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                  <option value="">—</option>
                  {cats.data?.map((c) => <option key={c.id} value={c.id}>{c.name_en}</option>)}
                </select>
              </div>
              <div className="sm:col-span-2">
                <TextField label="Image URL" value={editing.image_url ?? ""} onChange={(v) => setEditing({ ...editing, image_url: v })} placeholder="https://…" />
              </div>
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={editing.trending ?? false} onChange={(e) => setEditing({ ...editing, trending: e.target.checked })} /> {t("markTrending")}</label>
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={editing.active ?? true} onChange={(e) => setEditing({ ...editing, active: e.target.checked })} /> {t("active")}</label>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button onClick={() => setEditing(null)} className="rounded-md border border-border px-4 py-2 text-sm">{t("cancel")}</button>
              <button onClick={() => save(editing)} className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">{t("save")}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function TextField({ label, value, onChange, type = "text", placeholder, dir }: { label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string; dir?: "rtl" | "ltr" }) {
  return (
    <label className="block">
      <div className="mb-1.5 text-sm font-medium">{label}</div>
      <input dir={dir} type={type} placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring" />
    </label>
  );
}
function TextArea({ label, value, onChange, dir }: { label: string; value: string; onChange: (v: string) => void; dir?: "rtl" | "ltr" }) {
  return (
    <label className="block sm:col-span-2">
      <div className="mb-1.5 text-sm font-medium">{label}</div>
      <textarea dir={dir} rows={2} value={value} onChange={(e) => onChange(e.target.value)} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring" />
    </label>
  );
}