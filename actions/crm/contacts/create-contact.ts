"use server";
import { getSession } from "@/lib/auth-server";
import { prismadb } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

import { writeAuditLog } from "@/lib/audit-log";

export const createContact = async (data: {
  assigned_to?: string;
  assigned_account?: string;
  birthday_day?: string;
  birthday_month?: string;
  birthday_year?: string;
  description?: string;
  email?: string;
  personal_email?: string;
  first_name?: string;
  last_name: string;
  office_phone?: string;
  mobile_phone?: string;
  website?: string;
  status?: boolean;
  social_twitter?: string;
  social_facebook?: string;
  social_linkedin?: string;
  social_skype?: string;
  social_instagram?: string;
  social_youtube?: string;
  social_tiktok?: string;
  contact_type_id?: string;
}) => {
  const session = await getSession();
  if (!session) return { error: "Unauthorized" };

  const userId = session.user.id;
  const {
    assigned_to,
    assigned_account,
    birthday_day,
    birthday_month,
    birthday_year,
    contact_type_id,
    ...rest
  } = data;

  try {
    const contact = await prismadb.crm_Contacts.create({
      data: {
        v: 0,
        createdBy: userId,
        updatedBy: userId,
        accountsIDs: assigned_account ?? undefined,
        assigned_to: assigned_to ?? undefined,
        contact_type_id: contact_type_id ?? undefined,
        birthday:
          birthday_day && birthday_month && birthday_year
            ? birthday_day + "/" + birthday_month + "/" + birthday_year
            : null,
        ...rest,
      } as any,
    });


    await writeAuditLog({
      entityType: "contact",
      entityId: contact.id,
      action: "created",
      changes: null,
      userId: session.user.id,
    });

    revalidatePath("/", "layout");
    return { data: contact };
  } catch (error) {
    console.log("[CREATE_CONTACT]", error);
    return { error: "Failed to create contact" };
  }
};
