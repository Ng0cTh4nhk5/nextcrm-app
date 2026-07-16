"use server";
import { getSession } from "@/lib/auth-server";
import { prismadb } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import {
  requireAuthenticated,
  assertCanWriteBoard,
  AuthenticationError,
  AuthorizationError,
} from "@/lib/authz";

export const createTask = async (data: {
  title: string;
  user: string;
  board: string;
  priority: string;
  content: string;
  dueDateAt?: Date;
  account?: string;
}) => {
  let authzUser;
  try {
    authzUser = await requireAuthenticated();
  } catch (e) {
    if (e instanceof AuthenticationError) return { error: "Unauthorized" };
    throw e;
  }

  const session = await getSession();
  if (!session) return { error: "Unauthorized" };

  const { title, user, board, priority, content, dueDateAt } = data;

  if (!title || !user || !board || !priority || !content) {
    return { error: "Missing one of the task data" };
  }

  try {
    await assertCanWriteBoard(authzUser, board);
  } catch (e) {
    if (e instanceof AuthorizationError) return { error: "Forbidden" };
    throw e;
  }

  try {
    const sectionId = await prismadb.sections.findFirst({
      where: { board },
      orderBy: { position: "asc" },
    });

    if (!sectionId) return { error: "No section found" };

    const tasksCount = await prismadb.tasks.count({
      where: { section: sectionId.id },
    });

    await prismadb.tasks.create({
      data: {
        v: 0,
        priority,
        title,
        content,
        dueDateAt,
        section: sectionId.id,
        createdBy: session.user.id,
        updatedBy: session.user.id,
        position: tasksCount > 0 ? tasksCount : 0,
        user,
        taskStatus: "ACTIVE",
      },
    });

    await prismadb.boards.update({
      where: { id: board },
      data: { updatedAt: new Date() },
    });

    revalidatePath("/", "layout");
    return { success: true };
  } catch (error) {
    console.log("[CREATE_TASK]", error);
    return { error: "Failed to create task" };
  }
};
