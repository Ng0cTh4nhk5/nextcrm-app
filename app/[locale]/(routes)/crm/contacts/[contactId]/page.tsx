import Container from "@/app/[locale]/(routes)/components/ui/Container";

import { BasicView } from "./components/BasicView";


import { getContact } from "@/actions/crm/get-contact";
import { getOpportunitiesFullByContactId } from "@/actions/crm/get-opportunities-with-includes-by-contactId";
import { getAllCrmData } from "@/actions/crm/get-crm-data";
import { getDocumentsByContactId } from "@/actions/documents/get-documents-by-contactId";
import { getAccountsByContactId } from "@/actions/crm/get-accounts-by-contactId";

import AccountsView from "../../components/AccountsView";
import OpportunitiesView from "../../components/OpportunitiesView";
import DocumentsView from "../../components/DocumentsView";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { HistoryTab } from "./components/HistoryTab";
import { ActivitiesSection } from "./components/ActivitiesSection";
import { getTranslations } from "next-intl/server";

const ContactViewPage = async (props: any) => {
  const params = await props.params;
  const { contactId } = params;
  const contact: any = await getContact(contactId);
  const opportunities: any = await getOpportunitiesFullByContactId(contactId);
  const documents = await getDocumentsByContactId(contactId);
  const accounts = await getAccountsByContactId(contactId);
  const crmData = await getAllCrmData();

  const t = await getTranslations("CrmPage");
  const tCommon = await getTranslations("Common");

  if (!contact) return <div>{t("contacts.notFound")}</div>;

  const contactName = `${contact?.first_name || ""} ${contact?.last_name || ""}`.trim();

  return (
    <Container
      title={t("contacts.detailTitle", { name: contactName })}
      description={tCommon("salesPotentialDescription")}
    >
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">{tCommon("overview")}</TabsTrigger>
          <TabsTrigger value="history">{tCommon("history")}</TabsTrigger>
        </TabsList>
        <TabsContent value="overview">
          <div className="space-y-5">
            <BasicView data={contact} />
            <ActivitiesSection contactId={contact.id} />
            <AccountsView data={accounts} crmData={crmData} />
            <OpportunitiesView data={opportunities} crmData={crmData} />
            <DocumentsView data={documents} />
          </div>
        </TabsContent>
        <TabsContent value="history">
          <HistoryTab contactId={contactId} />
        </TabsContent>
      </Tabs>
    </Container>
  );
};

export default ContactViewPage;
