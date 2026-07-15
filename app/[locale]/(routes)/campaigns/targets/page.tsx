import { Suspense } from "react";

import CrmTableSkeleton from "@/components/skeletons/crm-table-skeleton";
import Container from "../../components/ui/Container";
import TargetsView from "./components/TargetsView";
import { getTargets } from "@/actions/crm/get-targets";
import { getTranslations } from "next-intl/server";

const TargetsPage = async () => {
  const targets = await getTargets();
  const t = await getTranslations("CampaignsPage");
  return (
    <Container
      title={t("targets.title")}
      description={t("targets.description")}
    >
      <Suspense fallback={<CrmTableSkeleton />}>
        <TargetsView data={targets} />
      </Suspense>
    </Container>
  );
};

export default TargetsPage;
