-- =============================================================================
-- Migration: Enable Row Level Security on all public tables
-- Date: 2026-07-15
-- 
-- Context: This app uses Prisma with the Supabase service_role key for ALL
-- server-side DB access. RLS is enabled here to satisfy Supabase security
-- requirements, and a `service_role` bypass policy is added to each table so
-- that Prisma (running on the server) is never blocked.
--
-- The `anon` and `authenticated` roles will have NO direct table access —
-- all data access MUST go through the Next.js server (API routes / Server Actions).
-- =============================================================================

-- Helper: enable RLS + add service_role bypass in one go
-- We repeat this pattern for every table.

-- ── Auth / Session tables (Better Auth) ──────────────────────────────────────

ALTER TABLE public."Users"              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."session"            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."account"            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."verification"       ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_role bypass" ON public."Users"        TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role bypass" ON public."session"      TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role bypass" ON public."account"      TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role bypass" ON public."verification" TO service_role USING (true) WITH CHECK (true);

-- ── Prisma internal ──────────────────────────────────────────────────────────

ALTER TABLE public."_prisma_migrations" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role bypass" ON public."_prisma_migrations" TO service_role USING (true) WITH CHECK (true);

-- ── Org / Account settings ───────────────────────────────────────────────────

ALTER TABLE public."MyAccount"          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Employees"          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."ApiToken"           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."ApiKeys"            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."systemServices"     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."ImageUpload"        ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_role bypass" ON public."MyAccount"      TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role bypass" ON public."Employees"      TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role bypass" ON public."ApiToken"       TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role bypass" ON public."ApiKeys"        TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role bypass" ON public."systemServices" TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role bypass" ON public."ImageUpload"    TO service_role USING (true) WITH CHECK (true);

-- ── Boards / Tasks ───────────────────────────────────────────────────────────

ALTER TABLE public."Boards"             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."BoardWatchers"      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Sections"           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Tasks"              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."tasksComments"      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."TodoList"           ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_role bypass" ON public."Boards"          TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role bypass" ON public."BoardWatchers"   TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role bypass" ON public."Sections"        TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role bypass" ON public."Tasks"           TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role bypass" ON public."tasksComments"   TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role bypass" ON public."TodoList"        TO service_role USING (true) WITH CHECK (true);

-- ── Documents ────────────────────────────────────────────────────────────────

ALTER TABLE public."Documents"                      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Documents_Types"                ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."DocumentsToOpportunities"       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."DocumentsToContacts"            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."DocumentsToLeads"               ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."DocumentsToTasks"               ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."DocumentsToAccounts"            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."DocumentsToCrmAccountsTasks"    ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_role bypass" ON public."Documents"                    TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role bypass" ON public."Documents_Types"              TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role bypass" ON public."DocumentsToOpportunities"     TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role bypass" ON public."DocumentsToContacts"          TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role bypass" ON public."DocumentsToLeads"             TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role bypass" ON public."DocumentsToTasks"             TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role bypass" ON public."DocumentsToAccounts"          TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role bypass" ON public."DocumentsToCrmAccountsTasks"  TO service_role USING (true) WITH CHECK (true);

-- ── CRM – Accounts ───────────────────────────────────────────────────────────

ALTER TABLE public."crm_Accounts"           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."AccountWatchers"        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."crm_Accounts_Tasks"     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."crm_AccountProducts"    ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_role bypass" ON public."crm_Accounts"        TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role bypass" ON public."AccountWatchers"     TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role bypass" ON public."crm_Accounts_Tasks"  TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role bypass" ON public."crm_AccountProducts" TO service_role USING (true) WITH CHECK (true);

-- ── CRM – Contacts ───────────────────────────────────────────────────────────

ALTER TABLE public."crm_Contacts"               ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."crm_Contact_Types"          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."crm_Contact_Enrichment"     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."ContactsToOpportunities"    ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_role bypass" ON public."crm_Contacts"            TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role bypass" ON public."crm_Contact_Types"       TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role bypass" ON public."crm_Contact_Enrichment"  TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role bypass" ON public."ContactsToOpportunities" TO service_role USING (true) WITH CHECK (true);

-- ── CRM – Leads ──────────────────────────────────────────────────────────────

ALTER TABLE public."crm_Leads"          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."crm_Lead_Sources"   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."crm_Lead_Statuses"  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."crm_Lead_Types"     ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_role bypass" ON public."crm_Leads"         TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role bypass" ON public."crm_Lead_Sources"  TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role bypass" ON public."crm_Lead_Statuses" TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role bypass" ON public."crm_Lead_Types"    TO service_role USING (true) WITH CHECK (true);

-- ── CRM – Opportunities ──────────────────────────────────────────────────────

ALTER TABLE public."crm_Opportunities"              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."crm_Opportunities_Sales_Stages" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."crm_Opportunities_Type"         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."crm_OpportunityLineItems"        ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_role bypass" ON public."crm_Opportunities"              TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role bypass" ON public."crm_Opportunities_Sales_Stages" TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role bypass" ON public."crm_Opportunities_Type"         TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role bypass" ON public."crm_OpportunityLineItems"       TO service_role USING (true) WITH CHECK (true);

-- ── CRM – Contracts ──────────────────────────────────────────────────────────

ALTER TABLE public."crm_Contracts"          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."crm_ContractLineItems"  ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_role bypass" ON public."crm_Contracts"         TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role bypass" ON public."crm_ContractLineItems" TO service_role USING (true) WITH CHECK (true);

-- ── CRM – Products ───────────────────────────────────────────────────────────

ALTER TABLE public."crm_Products"           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."crm_ProductCategories"  ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_role bypass" ON public."crm_Products"          TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role bypass" ON public."crm_ProductCategories" TO service_role USING (true) WITH CHECK (true);

-- ── CRM – Activities & Audit ─────────────────────────────────────────────────

ALTER TABLE public."crm_Activities"         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."crm_ActivityLinks"      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."crm_AuditLog"           ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_role bypass" ON public."crm_Activities"    TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role bypass" ON public."crm_ActivityLinks" TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role bypass" ON public."crm_AuditLog"      TO service_role USING (true) WITH CHECK (true);

-- ── CRM – Industry ───────────────────────────────────────────────────────────

ALTER TABLE public."crm_Industry_Type"  ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role bypass" ON public."crm_Industry_Type" TO service_role USING (true) WITH CHECK (true);

-- ── CRM – Targets & Campaigns ────────────────────────────────────────────────

ALTER TABLE public."crm_Targets"                ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."crm_Target_Enrichment"      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."crm_Target_Contact"         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."crm_TargetLists"            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."TargetsToTargetLists"       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."crm_campaigns"              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."crm_campaign_steps"         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."crm_campaign_sends"         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."crm_campaign_templates"     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."CampaignToTargetLists"      ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_role bypass" ON public."crm_Targets"            TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role bypass" ON public."crm_Target_Enrichment"  TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role bypass" ON public."crm_Target_Contact"     TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role bypass" ON public."crm_TargetLists"        TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role bypass" ON public."TargetsToTargetLists"   TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role bypass" ON public."crm_campaigns"          TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role bypass" ON public."crm_campaign_steps"     TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role bypass" ON public."crm_campaign_sends"     TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role bypass" ON public."crm_campaign_templates" TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role bypass" ON public."CampaignToTargetLists"  TO service_role USING (true) WITH CHECK (true);

-- ── Email ────────────────────────────────────────────────────────────────────

ALTER TABLE public."EmailAccount"       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Email"              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."EmailEmbedding"     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."EmailsToContacts"   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."EmailsToAccounts"   ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_role bypass" ON public."EmailAccount"     TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role bypass" ON public."Email"            TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role bypass" ON public."EmailEmbedding"   TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role bypass" ON public."EmailsToContacts" TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role bypass" ON public."EmailsToAccounts" TO service_role USING (true) WITH CHECK (true);

-- ── Invoices ─────────────────────────────────────────────────────────────────

ALTER TABLE public."Invoices"               ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Invoice_LineItems"      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Invoice_Payments"       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Invoice_Attachments"    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Invoice_Activity"       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Invoice_Series"         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Invoice_TaxRates"       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Invoice_Settings"       ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_role bypass" ON public."Invoices"            TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role bypass" ON public."Invoice_LineItems"   TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role bypass" ON public."Invoice_Payments"    TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role bypass" ON public."Invoice_Attachments" TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role bypass" ON public."Invoice_Activity"    TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role bypass" ON public."Invoice_Series"      TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role bypass" ON public."Invoice_TaxRates"    TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role bypass" ON public."Invoice_Settings"    TO service_role USING (true) WITH CHECK (true);

-- ── Currency ─────────────────────────────────────────────────────────────────

ALTER TABLE public."Currency"       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."ExchangeRate"   ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_role bypass" ON public."Currency"     TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role bypass" ON public."ExchangeRate" TO service_role USING (true) WITH CHECK (true);

-- ── Embeddings (vector search) ───────────────────────────────────────────────

ALTER TABLE public."crm_Embeddings_Accounts"        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."crm_Embeddings_Contacts"        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."crm_Embeddings_Leads"           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."crm_Embeddings_Opportunities"   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."crm_Embeddings_Documents"       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."crm_Document_Chunks"            ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_role bypass" ON public."crm_Embeddings_Accounts"      TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role bypass" ON public."crm_Embeddings_Contacts"      TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role bypass" ON public."crm_Embeddings_Leads"         TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role bypass" ON public."crm_Embeddings_Opportunities" TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role bypass" ON public."crm_Embeddings_Documents"     TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role bypass" ON public."crm_Document_Chunks"          TO service_role USING (true) WITH CHECK (true);

-- ── Second Brain ─────────────────────────────────────────────────────────────

ALTER TABLE public."secondBrain_notions"    ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role bypass" ON public."secondBrain_notions" TO service_role USING (true) WITH CHECK (true);

-- ── System settings & Reports ────────────────────────────────────────────────

ALTER TABLE public."crm_SystemSettings"     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."crm_Report_Config"      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."crm_Report_Schedule"    ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_role bypass" ON public."crm_SystemSettings"  TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role bypass" ON public."crm_Report_Config"   TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role bypass" ON public."crm_Report_Schedule" TO service_role USING (true) WITH CHECK (true);

-- =============================================================================
-- End of migration
-- All tables now have RLS enabled.
-- The `service_role` (used by Prisma via SUPABASE_SERVICE_KEY) retains full
-- access. Direct PostgREST access by `anon`/`authenticated` roles is blocked.
-- =============================================================================
