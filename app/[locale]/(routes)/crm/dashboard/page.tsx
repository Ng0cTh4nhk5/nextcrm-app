import React from "react";
import Container from "../../components/ui/Container";
import { getSaleStages } from "@/actions/crm/get-sales-stage";
import CRMKanban from "./_components/CRMKanban";
import { getOpportunities } from "@/actions/crm/get-opportunities";
import { getAllCrmData } from "@/actions/crm/get-crm-data";
import { serializeDecimalsList } from "@/lib/serialize-decimals";
import { getTranslations } from "next-intl/server";

const CrmDashboardPage = async () => {
  const salesStages = await getSaleStages();
  const opportunities = serializeDecimalsList(await getOpportunities());
  const crmData = await getAllCrmData();
  const t = await getTranslations("CrmDashboardPage");

  return (
    <Container
      title={t("title")}
      description={t("description")}
    >
      <div className="w-full h-full  overflow-hidden">
        <CRMKanban
          salesStages={salesStages}
          opportunities={opportunities}
          crmData={crmData}
        />
      </div>

      {/*     <CRMKanbanServer
        salesStages={salesStages}
        opportunities={opportunities}
      /> */}
    </Container>
  );
};

export default CrmDashboardPage;
