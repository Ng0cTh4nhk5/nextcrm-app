"use server";
import { getSession } from "@/lib/auth-server";
import { prismadb } from "@/lib/prisma";
import { junctionTableHelpers } from "@/lib/junction-helpers";
import { revalidatePath } from "next/cache";
import {
  requireAuthenticated,
  assertCanWriteBoard,
  AuthenticationError,
  AuthorizationError,
} from "@/lib/authz";

export const addCommentToTask = async (data: {
  taskId: string;
  comment: string;
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

  const { taskId, comment } = data;
  if (!taskId) return { error: "Missing task ID" };
  if (!comment) return { error: "Missing comment" };

  // Resolve parent board (if any) via assigned_section relation for scope check.
  const taskBoardLookup = await prismadb.tasks.findUnique({
    where: { id: taskId },
    select: {
      assigned_section: { select: { board_relation: { select: { id: true } } } },
    },
  });
  const parentBoardId =
    taskBoardLookup?.assigned_section?.board_relation?.id;
  if (parentBoardId) {
    try {
      await assertCanWriteBoard(authzUser, parentBoardId);
    } catch (e) {
      if (e instanceof AuthorizationError) return { error: "Forbidden" };
      throw e;
    }
  }

  try {
    const task = await prismadb.tasks.findUnique({
      where: { id: taskId },
    });

    if (!task) return { error: "Task not found" };
    if (!task.section) return { error: "Task section not found" };

    const section = await prismadb.sections.findUnique({
      where: { id: task.section },
    });

    if (section) {
      // Task from Projects module - add user as board watcher
      await prismadb.boards.update({
        where: { id: section.board },
        data: {
          watchers: junctionTableHelpers.addWatcher(session.user.id),
        },
      });

      const newComment = await prismadb.tasksComments.create({
        data: {
          v: 0,
          comment,
          task: taskId,
          user: session.user.id,
        },
      });

      revalidatePath("/", "layout");
      return { data: newComment };
    } else {
      // Task from CRM module (no section board)
      const newComment = await prismadb.tasksComments.create({
        data: {
          v: 0,
          comment,
          task: taskId,
          user: session.user.id,
        },
      });

      revalidatePath("/", "layout");
      return { data: newComment };
    }
  } catch (error) {
    console.log("[ADD_COMMENT_TO_TASK]", error);
    return { error: "Failed to add comment" };
  }
};
