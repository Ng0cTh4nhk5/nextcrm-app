import Container from "@/app/[locale]/(routes)/components/ui/Container";
import { BasicView } from "./components/BasicView";
import { getTargetList } from "@/actions/crm/get-target-list";
import { getTranslations } from "next-intl/server";

const TargetListViewPage = async (props: any) => {
  const params = await props.params;
  const { targetListId } = params;
  const targetList: any = await getTargetList(targetListId);
  const t = await getTranslations("CampaignsPage");

  if (!targetList) return <div>{t("targetLists.notFound")}</div>;

  return (
    <Container
      title={t("targetLists.detailTitle", { name: targetList?.name })}
      description={t("targetLists.detailDescription")}
    >
      <div className="space-y-5">
        <BasicView data={targetList} />
      </div>
    </Container>
  );
};

export default TargetListViewPage;
