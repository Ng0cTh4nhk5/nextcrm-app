import Container from "@/app/[locale]/(routes)/components/ui/Container";
import { BasicView } from "./components/BasicView";
import { getTarget } from "@/actions/crm/get-target";
import { getTranslations } from "next-intl/server";

const TargetViewPage = async (props: any) => {
  const params = await props.params;
  const { targetId } = params;
  const target: any = await getTarget(targetId);
  const t = await getTranslations("CampaignsPage");

  if (!target) return <div>{t("targets.notFound")}</div>;

  const targetName = `${target?.first_name || ""} ${target?.last_name || ""}`.trim();

  return (
    <Container
      title={t("targets.detailTitle", { name: targetName })}
      description={t("targets.detailDescription")}
    >
      <div className="space-y-5">
        <BasicView data={target} />
      </div>
    </Container>
  );
};

export default TargetViewPage;
