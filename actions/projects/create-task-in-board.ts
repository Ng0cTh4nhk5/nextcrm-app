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

export const createTaskInBoard = async (data: {
  boardId: string;
  section: string;
  title?: string;
  priority?: string;
  content?: string;
  user?: string;
  dueDateAt?: Date;
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

  const { boardId, section, title, priority, content, user, dueDateAt } = data;

  if (!section) return { error: "Missing section ID" };

  try {
    await assertCanWriteBoard(authzUser, boardId);
  } catch (e) {
    if (e instanceof AuthorizationError) return { error: "Forbidden" };
    throw e;
  }

  // Quick-add path: no title/user/priority/content - create a blank task
  if (!title || !user || !priority || !content) {
    try {
      const tasksCount = await prismadb.tasks.count({
        where: { section },
      });

      await prismadb.tasks.create({
        data: {
          v: 0,
          priority: "normal",
          title: "New task",
          content: "",
          section,
          createdBy: session.user.id,
          updatedBy: session.user.id,
          position: tasksCount > 0 ? tasksCount : 0,
          user: session.user.id,
          taskStatus: "ACTIVE",
        },
      });

      await prismadb.boards.update({
        where: { id: boardId },
        data: { updatedAt: new Date() },
      });

      revalidatePath("/", "layout");
      return { success: true };
    } catch (error) {
      console.log("[CREATE_TASK_IN_BOARD_QUICK]", error);
      return { error: "Failed to create task" };
    }
  }

  // Full-detail path
  try {
    const tasksCount = await prismadb.tasks.count({
      where: { section },
    });

    await prismadb.tasks.create({
      data: {
        v: 0,
        priority,
        title,
        content,
        dueDateAt,
        section,
        createdBy: user,
        updatedBy: user,
        position: tasksCount > 0 ? tasksCount : 0,
        user,
        taskStatus: "ACTIVE",
      },
    });

    await prismadb.boards.update({
      where: { id: boardId },
      data: { updatedAt: new Date() },
    });

    revalidatePath("/", "layout");
    return { success: true };
  } catch (error) {
    console.log("[CREATE_TASK_IN_BOARD]", error);
    return { error: "Failed to create task" };
  }
};
