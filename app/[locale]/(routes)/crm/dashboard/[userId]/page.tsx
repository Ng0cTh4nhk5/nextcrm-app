import { getSession } from "@/lib/auth-server";
import { redirect } from "next/navigation";
import React from "react";
import Container from "../../../components/ui/Container";
import { getAccountsTasks } from "@/actions/crm/account/get-tasks";
import { getUserCRMTasks } from "@/actions/crm/tasks/get-user-tasks";
import { getTranslations } from "next-intl/server";

const UserCRMDashboard = async () => {
  const session = await getSession();

  if (!session) {
    redirect("/auth/signin");
  }

  const task = await getUserCRMTasks(session.user.id);
  const t = await getTranslations("CrmDashboardPage");

  return (
    <div>
      <Container
        title={t("titleUserId", { name: session.user.name })}
        description={t("descriptionUserId")}
      >
        <div className="grid grid-cols-2 w-full ">
          <div className="">{t("callsOverview")}</div>
          <div className="">
            <h1>{t("tasksInAccounts")}</h1>
            <pre>{JSON.stringify(task, null, 2)}</pre>
          </div>
          <div className="">{t("meetingsOverview")}</div>
          <div className="">
            <h1></h1>
          </div>
          <div className="">{t("leadsOverview")}</div>
          <div className="">
            <h1></h1>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default UserCRMDashboard;
