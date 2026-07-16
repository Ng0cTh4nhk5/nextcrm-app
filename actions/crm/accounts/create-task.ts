"use server";
import { getSession } from "@/lib/auth-server";
import { prismadb } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export const createTask = async (data: {
  title: string;
  user: string;
  priority: string;
  content: string;
  account: string;
  dueDateAt?: Date;
}) => {
  const session = await getSession();
  if (!session) return { error: "Unauthorized" };

  const { title, user, priority, content, account, dueDateAt } = data;

  if (!title || !user || !priority || !content || !account) {
    return { error: "Missing one of the task data" };
  }

  try {
    const task = await prismadb.crm_Accounts_Tasks.create({
      data: {
        v: 0,
        priority,
        title,
        content,
        account,
        dueDateAt,
        createdBy: user,
        updatedBy: user,
        user,
        taskStatus: "ACTIVE",
      },
    });

    revalidatePath("/", "layout");
    return { data: task };
  } catch (error) {
    console.log("[CREATE_TASK]", error);
    return { error: "Failed to create task" };
  }
};
