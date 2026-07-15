"use server";
import { prismadb } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import {
  requireRole,
  AuthenticationError,
  AuthorizationError,
} from "@/lib/authz";

export const activateUser = async (userId: string) => {
  try {
    await requireRole(["admin"]);
  } catch (e) {
    if (e instanceof AuthenticationError) return { error: "Unauthorized" };
    if (e instanceof AuthorizationError) return { error: "Forbidden" };
    throw e;
  }

  if (!userId) return { error: "userId is required" };

  try {
    const user = await prismadb.users.update({
      where: { id: userId },
      data: { userStatus: "ACTIVE" },
    });

    revalidatePath("/[locale]/(routes)/admin", "page");
    return { data: user };
  } catch (error) {
    console.log("[ACTIVATE_USER]", error);
    return { error: "Failed to activate user" };
  }
};
