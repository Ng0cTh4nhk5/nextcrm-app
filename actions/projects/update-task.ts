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

export const updateTask = async (data: {
  taskId: string;
  title: string;
  user: string;
  board?: string;
  boardId?: string;
  priority: string;
  content: string;
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

  const { taskId, title, user, boardId, priority, content, dueDateAt } = data;
  const resolvedBoardId = boardId || data.board;

  if (!taskId) return { error: "Missing task ID" };
  if (!title || !user || !priority || !content) {
    return { error: "Missing one of the task data" };
  }

  const existing = await prismadb.tasks.findUnique({
    where: { id: taskId },
    select: {
      assigned_section: { select: { board_relation: { select: { id: true } } } },
    },
  });
  const parentBoardId = existing?.assigned_section?.board_relation?.id;
  if (!parentBoardId) return { error: "Not found" };

  try {
    await assertCanWriteBoard(authzUser, parentBoardId);
  } catch (e) {
    if (e instanceof AuthorizationError) return { error: "Forbidden" };
    throw e;
  }

  try {
    await prismadb.tasks.update({
      where: { id: taskId },
      data: {
        priority,
        title,
        content,
        updatedBy: user,
        dueDateAt,
        user,
      },
    });

    if (resolvedBoardId) {
      await prismadb.boards.update({
        where: { id: resolvedBoardId },
        data: { updatedAt: new Date() },
      });
    }

    revalidatePath("/", "layout");
    return { success: true };
  } catch (error) {
    console.log("[UPDATE_TASK]", error);
    return { error: "Failed to update task" };
  }
};
