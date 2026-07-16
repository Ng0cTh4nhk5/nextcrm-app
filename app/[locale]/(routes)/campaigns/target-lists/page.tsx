import { Suspense } from "react";

import CrmTableSkeleton from "@/components/skeletons/crm-table-skeleton";
import Container from "../../components/ui/Container";
import TargetListsView from "./components/TargetListsView";
import { getTargetLists } from "@/actions/crm/get-target-lists";
import { getTranslations } from "next-intl/server";

const TargetListsPage = async () => {
  const targetLists = await getTargetLists();
  const t = await getTranslations("CampaignsPage");
  return (
    <Container
      title={t("targetLists.title")}
      description={t("targetLists.description")}
    >
      <Suspense fallback={<CrmTableSkeleton />}>
        <TargetListsView data={targetLists} />
      </Suspense>
    </Container>
  );
};

export default TargetListsPage;
