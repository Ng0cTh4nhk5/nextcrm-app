-- AlterEnum
BEGIN;
CREATE TYPE "ApiKeyProvider_new" AS ENUM ('FIRECRAWL', 'ANTHROPIC', 'GROQ');
ALTER TABLE "ApiKeys" ALTER COLUMN "provider" TYPE "ApiKeyProvider_new" USING ("provider"::text::"ApiKeyProvider_new");
ALTER TYPE "ApiKeyProvider" RENAME TO "ApiKeyProvider_old";
ALTER TYPE "ApiKeyProvider_new" RENAME TO "ApiKeyProvider";
DROP TYPE "public"."ApiKeyProvider_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "DocumentSystemType_new" AS ENUM ('RECEIPT', 'CONTRACT', 'OFFER', 'OTHER');
ALTER TABLE "public"."Documents" ALTER COLUMN "document_system_type" DROP DEFAULT;
ALTER TABLE "Documents" ALTER COLUMN "document_system_type" TYPE "DocumentSystemType_new" USING ("document_system_type"::text::"DocumentSystemType_new");
ALTER TYPE "DocumentSystemType" RENAME TO "DocumentSystemType_old";
ALTER TYPE "DocumentSystemType_new" RENAME TO "DocumentSystemType";
DROP TYPE "public"."DocumentSystemType_old";
ALTER TABLE "Documents" ALTER COLUMN "document_system_type" SET DEFAULT 'OTHER';
COMMIT;

-- AlterEnum
ALTER TYPE "Language" ADD VALUE 'vi';

-- DropForeignKey
ALTER TABLE "CampaignToTargetLists" DROP CONSTRAINT "CampaignToTargetLists_campaign_id_fkey";

-- DropForeignKey
ALTER TABLE "CampaignToTargetLists" DROP CONSTRAINT "CampaignToTargetLists_target_list_id_fkey";

-- DropForeignKey
ALTER TABLE "EmailEmbedding" DROP CONSTRAINT "EmailEmbedding_emailId_fkey";

-- DropForeignKey
ALTER TABLE "crm_Contact_Enrichment" DROP CONSTRAINT "crm_Contact_Enrichment_contactId_fkey";

-- DropForeignKey
ALTER TABLE "crm_Contact_Enrichment" DROP CONSTRAINT "crm_Contact_Enrichment_triggeredBy_fkey";

-- DropForeignKey
ALTER TABLE "crm_Contacts" DROP CONSTRAINT "fk_contact_type";

-- DropForeignKey
ALTER TABLE "crm_Document_Chunks" DROP CONSTRAINT "crm_Document_Chunks_document_id_fkey";

-- DropForeignKey
ALTER TABLE "crm_Embeddings_Accounts" DROP CONSTRAINT "crm_Embeddings_Accounts_account_id_fkey";

-- DropForeignKey
ALTER TABLE "crm_Embeddings_Contacts" DROP CONSTRAINT "crm_Embeddings_Contacts_contact_id_fkey";

-- DropForeignKey
ALTER TABLE "crm_Embeddings_Documents" DROP CONSTRAINT "crm_Embeddings_Documents_document_id_fkey";

-- DropForeignKey
ALTER TABLE "crm_Embeddings_Leads" DROP CONSTRAINT "crm_Embeddings_Leads_lead_id_fkey";

-- DropForeignKey
ALTER TABLE "crm_Embeddings_Opportunities" DROP CONSTRAINT "crm_Embeddings_Opportunities_opportunity_id_fkey";

-- DropForeignKey
ALTER TABLE "crm_Leads" DROP CONSTRAINT "fk_lead_source";

-- DropForeignKey
ALTER TABLE "crm_Leads" DROP CONSTRAINT "fk_lead_status";

-- DropForeignKey
ALTER TABLE "crm_Leads" DROP CONSTRAINT "fk_lead_type";

-- DropForeignKey
ALTER TABLE "crm_Opportunities" DROP CONSTRAINT "crm_Opportunities_campaign_fkey";

-- DropForeignKey
ALTER TABLE "crm_Target_Enrichment" DROP CONSTRAINT "crm_Target_Enrichment_targetId_fkey";

-- DropForeignKey
ALTER TABLE "crm_Target_Enrichment" DROP CONSTRAINT "crm_Target_Enrichment_triggeredBy_fkey";

-- DropForeignKey
ALTER TABLE "crm_campaign_sends" DROP CONSTRAINT "crm_campaign_sends_campaign_id_fkey";

-- DropForeignKey
ALTER TABLE "crm_campaign_sends" DROP CONSTRAINT "crm_campaign_sends_step_id_fkey";

-- DropForeignKey
ALTER TABLE "crm_campaign_sends" DROP CONSTRAINT "crm_campaign_sends_target_id_fkey";

-- DropForeignKey
ALTER TABLE "crm_campaign_steps" DROP CONSTRAINT "crm_campaign_steps_campaign_id_fkey";

-- DropForeignKey
ALTER TABLE "crm_campaign_steps" DROP CONSTRAINT "crm_campaign_steps_template_id_fkey";

-- DropForeignKey
ALTER TABLE "crm_campaign_templates" DROP CONSTRAINT "crm_campaign_templates_created_by_fkey";

-- DropForeignKey
ALTER TABLE "crm_campaigns" DROP CONSTRAINT "crm_campaigns_created_by_fkey";

-- DropForeignKey
ALTER TABLE "crm_campaigns" DROP CONSTRAINT "crm_campaigns_template_id_fkey";

-- DropForeignKey
ALTER TABLE "secondBrain_notions" DROP CONSTRAINT "secondBrain_notions_user_fkey";

-- DropIndex
DROP INDEX "invoices_search_vector_idx";

-- DropIndex
DROP INDEX "crm_Opportunities_campaign_idx";

-- AlterTable
ALTER TABLE "Boards" ALTER COLUMN "favouritePosition" SET DATA TYPE BIGINT,
ALTER COLUMN "position" SET DATA TYPE BIGINT;

-- AlterTable
ALTER TABLE "Email" ALTER COLUMN "id" DROP DEFAULT;

-- AlterTable
ALTER TABLE "EmailAccount" ALTER COLUMN "id" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Employees" ALTER COLUMN "salary" SET DATA TYPE BIGINT;

-- AlterTable
ALTER TABLE "ExchangeRate" ALTER COLUMN "id" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Sections" ALTER COLUMN "position" SET DATA TYPE BIGINT;

-- AlterTable
ALTER TABLE "Tasks" ALTER COLUMN "position" SET DATA TYPE BIGINT,
ALTER COLUMN "likes" SET DATA TYPE BIGINT;

-- AlterTable
ALTER TABLE "account" ALTER COLUMN "id" DROP DEFAULT;

-- AlterTable
ALTER TABLE "crm_Accounts_Tasks" ALTER COLUMN "likes" SET DATA TYPE BIGINT;

-- AlterTable
ALTER TABLE "crm_Activities" ALTER COLUMN "id" DROP DEFAULT;

-- AlterTable
ALTER TABLE "crm_ActivityLinks" ALTER COLUMN "id" DROP DEFAULT;

-- AlterTable
ALTER TABLE "crm_AuditLog" ALTER COLUMN "id" DROP DEFAULT;

-- AlterTable
ALTER TABLE "crm_Contact_Types" ALTER COLUMN "id" DROP DEFAULT;

-- AlterTable
ALTER TABLE "crm_Industry_Type" ALTER COLUMN "__v" SET DEFAULT 0;

-- AlterTable
ALTER TABLE "crm_Lead_Sources" ALTER COLUMN "id" DROP DEFAULT;

-- AlterTable
ALTER TABLE "crm_Lead_Statuses" ALTER COLUMN "id" DROP DEFAULT;

-- AlterTable
ALTER TABLE "crm_Lead_Types" ALTER COLUMN "id" DROP DEFAULT;

-- AlterTable
ALTER TABLE "crm_Opportunities" DROP COLUMN "campaign";

-- AlterTable
ALTER TABLE "crm_Opportunities_Sales_Stages" ALTER COLUMN "__v" SET DEFAULT 0;

-- AlterTable
ALTER TABLE "crm_Opportunities_Type" ALTER COLUMN "__v" SET DEFAULT 0;

-- AlterTable
ALTER TABLE "crm_TargetLists" ALTER COLUMN "id" DROP DEFAULT;

-- AlterTable
ALTER TABLE "crm_Target_Contact" ALTER COLUMN "id" DROP DEFAULT,
DROP COLUMN "enrichStatus",
ADD COLUMN     "enrichStatus" TEXT NOT NULL DEFAULT 'PENDING',
ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "crm_Targets" ALTER COLUMN "id" DROP DEFAULT;

-- AlterTable
ALTER TABLE "session" ALTER COLUMN "id" DROP DEFAULT;

-- AlterTable
ALTER TABLE "verification" ALTER COLUMN "id" DROP DEFAULT;

-- DropTable
DROP TABLE "CampaignToTargetLists";

-- DropTable
DROP TABLE "EmailEmbedding";

-- DropTable
DROP TABLE "MyAccount";

-- DropTable
DROP TABLE "crm_Contact_Enrichment";

-- DropTable
DROP TABLE "crm_Document_Chunks";

-- DropTable
DROP TABLE "crm_Embeddings_Accounts";

-- DropTable
DROP TABLE "crm_Embeddings_Contacts";

-- DropTable
DROP TABLE "crm_Embeddings_Documents";

-- DropTable
DROP TABLE "crm_Embeddings_Leads";

-- DropTable
DROP TABLE "crm_Embeddings_Opportunities";

-- DropTable
DROP TABLE "crm_Target_Enrichment";

-- DropTable
DROP TABLE "crm_campaign_sends";

-- DropTable
DROP TABLE "crm_campaign_steps";

-- DropTable
DROP TABLE "crm_campaign_templates";

-- DropTable
DROP TABLE "crm_campaigns";

-- DropTable
DROP TABLE "secondBrain_notions";

-- DropEnum
DROP TYPE "crm_Enrichment_Status";

-- CreateIndex
CREATE INDEX "crm_Contact_Types_name_idx" ON "crm_Contact_Types"("name");

-- CreateIndex
CREATE INDEX "crm_Lead_Sources_name_idx" ON "crm_Lead_Sources"("name");

-- CreateIndex
CREATE INDEX "crm_Lead_Statuses_name_idx" ON "crm_Lead_Statuses"("name");

-- CreateIndex
CREATE INDEX "crm_Lead_Types_name_idx" ON "crm_Lead_Types"("name");

-- CreateIndex
CREATE INDEX "crm_Target_Contact_enrichStatus_idx" ON "crm_Target_Contact"("enrichStatus");

-- AddForeignKey
ALTER TABLE "crm_Leads" ADD CONSTRAINT "crm_Leads_lead_source_id_fkey" FOREIGN KEY ("lead_source_id") REFERENCES "crm_Lead_Sources"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crm_Leads" ADD CONSTRAINT "crm_Leads_lead_status_id_fkey" FOREIGN KEY ("lead_status_id") REFERENCES "crm_Lead_Statuses"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crm_Leads" ADD CONSTRAINT "crm_Leads_lead_type_id_fkey" FOREIGN KEY ("lead_type_id") REFERENCES "crm_Lead_Types"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crm_Contacts" ADD CONSTRAINT "crm_Contacts_contact_type_id_fkey" FOREIGN KEY ("contact_type_id") REFERENCES "crm_Contact_Types"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crm_Targets" ADD CONSTRAINT "crm_Targets_converted_account_id_fkey" FOREIGN KEY ("converted_account_id") REFERENCES "crm_Accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crm_Targets" ADD CONSTRAINT "crm_Targets_converted_contact_id_fkey" FOREIGN KEY ("converted_contact_id") REFERENCES "crm_Contacts"("id") ON DELETE SET NULL ON UPDATE CASCADE;
