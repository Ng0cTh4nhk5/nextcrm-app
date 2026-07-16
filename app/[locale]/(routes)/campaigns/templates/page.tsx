import { Suspense } from "react";
import { getTemplates } from "@/actions/campaigns/templates/get-templates";
import Container from "../../components/ui/Container";
import TemplatesView from "./components/TemplatesView";
import CrmTableSkeleton from "@/components/skeletons/crm-table-skeleton";
import { getTranslations } from "next-intl/server";

export default async function TemplatesPage() {
  const templates = await getTemplates();
  const t = await getTranslations("CampaignsPage");
  return (
    <Container title={t("templates.title")} description={t("templates.description")}>
      <Suspense fallback={<CrmTableSkeleton />}>
        <TemplatesView data={templates} />
      </Suspense>
    </Container>
  );
}
