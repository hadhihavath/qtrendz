import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { SiteLayout } from "@/components/SiteLayout";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";
import { toast } from "sonner";

export const Route = createFileRoute("/auth")({ component: Auth });

function Auth() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      if (data.session) {
        setUser(data.session.user);
        const { data: roleData } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", data.session.user.id)
          .eq("role", "admin")
          .maybeSingle();
        if (roleData) {
          setIsAdmin(true);
          navigate({ to: "/admin" });
        } else {
          setIsAdmin(false);
        }
      }
      setChecking(false);
    });
  }, [navigate]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { data: authData, error } = mode === "signin"
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password, options: { emailRedirectTo: window.location.origin + "/auth" } });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }

    if (authData?.user) {
      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", authData.user.id)
        .eq("role", "admin")
        .maybeSingle();
      if (roleData) {
        navigate({ to: "/admin" });
      } else {
        toast.success("Signed in successfully!");
        setUser(authData.user);
        setIsAdmin(false);
        navigate({ to: "/" });
      }
    }
  }

  async function signOut() {
    await supabase.auth.signOut();
    setUser(null);
    setIsAdmin(false);
    toast.success("Signed out successfully!");
  }

  if (checking) {
    return <SiteLayout><div className="grid min-h-screen place-items-center text-muted-foreground font-display">Loading…</div></SiteLayout>;
  }

  return (
    <SiteLayout>
      <div className="mx-auto max-w-md px-4 py-16">
        <div className="rounded-xl border border-border bg-card p-8 shadow-card">
          {user ? (
            <div className="text-center">
              <h1 className="font-display text-2xl font-semibold">Welcome</h1>
              <p className="mt-2 text-sm text-muted-foreground">You are signed in as <span className="font-medium text-foreground">{user.email}</span></p>
              <div className="mt-6 flex flex-col gap-2">
                {isAdmin && (
                  <button onClick={() => navigate({ to: "/admin" })} className="w-full rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-elegant cursor-pointer">
                    Go to Admin Dashboard
                  </button>
                )}
                <button onClick={signOut} className="w-full rounded-md border border-border px-4 py-2.5 text-sm font-semibold hover:bg-accent transition cursor-pointer">
                  {t("signOut")}
                </button>
              </div>
            </div>
          ) : (
            <>
              <h1 className="font-display text-2xl font-semibold">{mode === "signin" ? t("signIn") : "Create account"}</h1>
              <p className="mt-1 text-sm text-muted-foreground">{mode === "signin" ? "Sign in to your account." : "Create a new account."}</p>
              <form onSubmit={onSubmit} className="mt-6 space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium">{t("email")}</label>
                  <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring" />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium">{t("password")}</label>
                  <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring" />
                </div>
                <button disabled={loading} className="w-full rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-elegant disabled:opacity-60 cursor-pointer">{loading ? "…" : (mode === "signin" ? t("signIn") : "Create account")}</button>
              </form>
              <button onClick={() => setMode(mode === "signin" ? "signup" : "signin")} className="mt-4 text-xs text-muted-foreground hover:text-foreground cursor-pointer">
                {mode === "signin" ? "Need an account? Create one" : "Have an account? Sign in"}
              </button>
            </>
          )}
        </div>
      </div>
    </SiteLayout>
  );
}