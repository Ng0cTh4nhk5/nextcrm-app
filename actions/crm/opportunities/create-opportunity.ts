"use server";
import { getSession } from "@/lib/auth-server";
import { prismadb } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { inngest } from "@/inngest/client";
import { writeAuditLog } from "@/lib/audit-log";
import { getSnapshotRate, getDefaultCurrency } from "@/lib/currency";

export const createOpportunity = async (data: {
  account?: string;
  assigned_to?: string;
  budget?: string;
  campaign?: string;
  close_date?: Date;
  contact?: string;
  currency?: string;
  description?: string;
  expected_revenue?: string;
  name: string;
  next_step?: string;
  sales_stage?: string;
  type?: string;
}) => {
  const session = await getSession();
  if (!session) return { error: "Unauthorized" };

  const userId = session.user.id;
  const {
    account,
    assigned_to,
    budget,
    campaign,
    close_date,
    contact,
    currency,
    description,
    expected_revenue,
    name,
    next_step,
    sales_stage,
    type,
  } = data;

  try {
    const defaultCurrency = await getDefaultCurrency();
    const snapshotRate = currency
      ? await getSnapshotRate(currency, defaultCurrency)
      : null;
    const opportunity = await prismadb.crm_Opportunities.create({
      data: {
        account: account || undefined,
        assigned_to: assigned_to || userId,
        budget: budget ? parseFloat(budget) : undefined,
        campaign: campaign || undefined,
        close_date,
        contact: contact || undefined,
        createdBy: userId,
        last_activity_by: userId,
        updatedBy: userId,
        currency: currency || undefined,
        description: description || undefined,
        expected_revenue: expected_revenue ? parseFloat(expected_revenue) : undefined,
        snapshot_rate: snapshotRate ? parseFloat(snapshotRate.toString()) : undefined,
        name,
        next_step: next_step || undefined,
        sales_stage: sales_stage || undefined,
        status: "ACTIVE",
        type: type || undefined,
      },
    });


    await writeAuditLog({
      entityType: "opportunity",
      entityId: opportunity.id,
      action: "created",
      changes: null,
      userId: session.user.id,
    });
    void inngest.send({ name: "crm/opportunity.saved", data: { record_id: opportunity.id } });
    revalidatePath("/", "layout");
    return { data: opportunity };
  } catch (error) {
    console.log("[CREATE_OPPORTUNITY]", error);
    return { error: "Failed to create opportunity" };
  }
};
