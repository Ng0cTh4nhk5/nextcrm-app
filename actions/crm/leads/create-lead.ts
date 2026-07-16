"use server";
import { getSession } from "@/lib/auth-server";
import { prismadb } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

import { writeAuditLog } from "@/lib/audit-log";

export const createLead = async (data: {
  first_name?: string;
  last_name: string;
  company?: string;
  jobTitle?: string;
  email?: string;
  phone?: string;
  description?: string;
  lead_source_id?: string;
  lead_status_id?: string;
  lead_type_id?: string;
  refered_by?: string;
  campaign?: string;
  assigned_to?: string;
  accountIDs?: string;
}) => {
  const session = await getSession();
  if (!session) return { error: "Unauthorized" };

  const userId = session.user.id;
  const {
    first_name,
    last_name,
    company,
    jobTitle,
    email,
    phone,
    description,
    lead_source_id,
    lead_status_id,
    lead_type_id,
    refered_by,
    campaign,
    assigned_to,
    accountIDs,
  } = data;

  try {
    const lead = await prismadb.crm_Leads.create({
      data: {
        v: 1,
        createdBy: userId,
        updatedBy: userId,
        firstName: first_name,
        lastName: last_name,
        company,
        jobTitle,
        email,
        phone,
        description,
        lead_source_id: lead_source_id || undefined,
        lead_status_id: lead_status_id || undefined,
        lead_type_id: lead_type_id || undefined,
        refered_by: refered_by || undefined,
        campaign: campaign || undefined,
        assigned_to: assigned_to || userId,
        accountsIDs: accountIDs || undefined,
      },
    });


    await writeAuditLog({
      entityType: "lead",
      entityId: lead.id,
      action: "created",
      changes: null,
      userId: session.user.id,
    });

    revalidatePath("/", "layout");
    return { data: lead };
  } catch (error) {
    console.log("[CREATE_LEAD]", error);
    return { error: "Failed to create lead" };
  }
};
