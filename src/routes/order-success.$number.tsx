import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { SiteLayout } from "@/components/SiteLayout";
import { useI18n } from "@/lib/i18n";
import { CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/order-success/$number")({ component: Success });

function Success() {
  const { number } = useParams({ from: "/order-success/$number" });
  const { t } = useI18n();
  return (
    <SiteLayout>
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <CheckCircle2 className="mx-auto h-16 w-16 text-primary" />
        <h1 className="mt-6 font-display text-3xl font-semibold">{t("orderPlaced")}</h1>
        <p className="mt-3 text-muted-foreground text-sm">{t("orderRef")} <span className="font-semibold text-foreground">#{number}</span></p>
        <p className="mt-2 text-muted-foreground text-sm">{t("contactSoon")}</p>
        <Link to="/" className="mt-8 inline-block rounded-md bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground">{t("continueShopping")}</Link>
      </div>
    </SiteLayout>
  );
}