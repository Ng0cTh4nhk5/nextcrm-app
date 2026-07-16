import { getCampaigns } from "@/actions/campaigns/get-campaigns";
import CampaignsView from "./components/CampaignsView";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { getTranslations } from "next-intl/server";

export default async function CampaignsPage() {
  const campaigns = await getCampaigns();
  const t = await getTranslations("CampaignsPage");

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t("title")}</h1>
          <p className="text-muted-foreground">{t("description")}</p>
        </div>
        <Button asChild>
          <Link href="/campaigns/new">+ {t("newCampaign")}</Link>
        </Button>
      </div>
      <CampaignsView data={campaigns} />
    </div>
  );
}
