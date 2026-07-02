import { createFileRoute, Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { LayoutDashboard, Package, ShoppingCart, LogOut, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/admin")({ component: AdminLayout });

function AdminLayout() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [email, setEmail] = useState<string>("");

  useEffect(() => {
    (async () => {
      const { data: userRes } = await supabase.auth.getUser();
      const uid = userRes.user?.id;
      setEmail(userRes.user?.email ?? "");
      if (!uid) return setIsAdmin(false);
      const { data } = await supabase.from("user_roles").select("role").eq("user_id", uid).eq("role", "admin").maybeSingle();
      setIsAdmin(!!data);
    })();
  }, []);

  async function signOut() {
    await supabase.auth.signOut();
    navigate({ to: "/auth" });
  }

  const items = [
    { to: "/admin", label: t("dashboard"), icon: LayoutDashboard, exact: true },
    { to: "/admin/products", label: t("products"), icon: Package },
    { to: "/admin/orders", label: t("orders"), icon: ShoppingCart },
  ];

  if (isAdmin === null) return <div className="grid min-h-screen place-items-center text-muted-foreground">Loading…</div>;

  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <ShieldAlert className="mx-auto h-12 w-12 text-primary" />
        <h1 className="mt-4 font-display text-2xl font-semibold">Admin access required</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Your account ({email}) is signed in but not an admin. If you're setting up the store for the first time, claim admin below (only works when no admins exist yet). Otherwise ask an existing admin to grant your account.
        </p>
        <button
          onClick={async () => {
            const { data, error } = await supabase.rpc("claim_first_admin");
            if (error) return alert(error.message);
            if (data === true) { setIsAdmin(true); }
            else alert("Admins already exist. Ask an existing admin to grant you access.");
          }}
          className="mt-6 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-elegant"
        >
          Claim first admin
        </button>
        <button onClick={signOut} className="mt-6 rounded-md border border-border px-4 py-2 text-sm hover:bg-accent">{t("signOut")}</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen grid md:grid-cols-[240px_1fr]">
      <aside className="border-e border-border bg-card p-4 md:p-6">
        <Link to="/" className="flex items-center gap-2 mb-8">
          <img src="/qtrendz/logo.svg" className="h-8 w-auto" alt="QTRENDZ Logo" />
        </Link>
        <nav className="flex md:flex-col gap-1">
          {items.map((i) => {
            const active = i.exact ? pathname === i.to : pathname.startsWith(i.to);
            const Icon = i.icon;
            return (
              <Link key={i.to} to={i.to} className={cn("flex items-center gap-2 rounded-md px-3 py-2 text-sm transition", active ? "bg-primary text-primary-foreground" : "hover:bg-accent")}>
                <Icon className="h-4 w-4" /> {i.label}
              </Link>
            );
          })}
        </nav>
        <button onClick={signOut} className="mt-8 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <LogOut className="h-4 w-4" /> {t("signOut")}
        </button>
      </aside>
      <main className="p-6 md:p-10 bg-background">
        <Outlet />
      </main>
    </div>
  );
}