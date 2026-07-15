"use server";

import { auth } from "@/lib/auth";
import { requireRole, AuthenticationError, AuthorizationError } from "@/lib/authz";

export const resetUserPassword = async (userId: string, newPassword: string) => {
  try {
    await requireRole(["admin"]);
  } catch (e) {
    if (e instanceof AuthenticationError) return { error: "Unauthorized" };
    if (e instanceof AuthorizationError) return { error: "Forbidden" };
    throw e;
  }

  if (!newPassword || newPassword.length < 8) {
    return { error: "Mật khẩu phải ít nhất 8 ký tự." };
  }

  if (!userId) {
    return { error: "userId là bắt buộc." };
  }

  try {
    // Dùng endpoint đúng của admin plugin: POST /admin/set-user-password
    // Body nhận: { userId, newPassword }
    await auth.api.setUserPassword({
      body: {
        userId,
        newPassword,
      },
    });

    return { success: true };
  } catch (error: any) {
    console.error("[RESET_USER_PASSWORD]", error);
    return { error: error?.message || "Không thể đặt lại mật khẩu." };
  }
};
