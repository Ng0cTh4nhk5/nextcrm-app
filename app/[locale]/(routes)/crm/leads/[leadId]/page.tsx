import { getLead } from "@/actions/crm/get-lead";
import Container from "@/app/[locale]/(routes)/components/ui/Container";
import React from "react";
import { BasicView } from "./components/BasicView";
import DocumentsView from "../../components/DocumentsView";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { HistoryTab } from "./components/HistoryTab";
import { ActivitiesSection } from "./components/ActivitiesSection";
import { getTranslations } from "next-intl/server";

interface LeadDetailPageProps {
  params: Promise<{
    leadId: string;
  }>;
}

const LeadDetailPage = async (props: LeadDetailPageProps) => {
  const params = await props.params;
  const { leadId } = params;
  const lead: any = await getLead(leadId);
  const t = await getTranslations("CrmPage");
  const tCommon = await getTranslations("Common");

  if (!lead) return <div>{t("leads.notFound")}</div>;

  const leadName = `${lead?.firstName || ""} ${lead?.lastName || ""}`.trim();

  return (
    <Container
      title={t("leads.detailTitle", { name: leadName })}
      description={tCommon("salesPotentialDescription")}
    >
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">{tCommon("overview")}</TabsTrigger>
          <TabsTrigger value="history">{tCommon("history")}</TabsTrigger>
        </TabsList>
        <TabsContent value="overview">
          <div className="space-y-5">
            <BasicView data={lead} />
            <ActivitiesSection leadId={lead.id} />
            {/*         <DocumentsView data={lead?.documents} /> */}
          </div>
        </TabsContent>
        <TabsContent value="history">
          <HistoryTab leadId={leadId} />
        </TabsContent>
      </Tabs>
    </Container>
  );
};

export default LeadDetailPage;
