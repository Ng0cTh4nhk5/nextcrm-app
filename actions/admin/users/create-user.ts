"use server";

import { auth } from "@/lib/auth";
import { prismadb } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { Language } from "@prisma/client";
import {
  requireRole,
  AuthenticationError,
  AuthorizationError,
} from "@/lib/authz";

export const createUserByAdmin = async (data: {
  name: string;
  email: string;
  password: string;
  role: "admin" | "manager" | "user";
  language: string;
}) => {
  // Chỉ admin mới có thể tạo user
  try {
    await requireRole(["admin"]);
  } catch (e) {
    if (e instanceof AuthenticationError) return { error: "Unauthorized" };
    if (e instanceof AuthorizationError) return { error: "Forbidden" };
    throw e;
  }

  const { name, email, password, role, language } = data;

  if (!name || !email || !password) {
    return { error: "Tên, email và mật khẩu là bắt buộc." };
  }

  if (password.length < 8) {
    return { error: "Mật khẩu phải có ít nhất 8 ký tự." };
  }

  // Kiểm tra email đã tồn tại chưa
  const existing = await prismadb.users.findFirst({ where: { email } });
  if (existing) {
    return { error: "Email này đã được sử dụng." };
  }

  try {
    // Dùng admin plugin của Better Auth để tạo user — password hash tự động
    // auth.api.admin.createUser là endpoint đúng: POST /admin/create-user
    const result = await auth.api.createUser({
      body: {
        name,
        email,
        password,
        role,
        // data để override các field bổ sung
        data: {
          userStatus: "ACTIVE",
          userLanguage: language,
        },
      },
    });

    if (!result?.user) {
      return { error: "Không thể tạo user." };
    }

    // Đảm bảo role và status được đặt đúng (Better Auth có thể không áp dụng data field)
    await prismadb.users.update({
      where: { id: result.user.id },
      data: {
        role,
        userStatus: "ACTIVE",
        userLanguage: language as Language,
      },
    });

    revalidatePath("/", "layout");
    return { data: { id: result.user.id, name, email, role } };
  } catch (error: any) {
    console.error("[CREATE_USER_BY_ADMIN]", error);

    // Better Auth trả lỗi dạng cụ thể khi email đã tồn tại
    if (
      error?.message?.toLowerCase().includes("exists") ||
      error?.message?.toLowerCase().includes("duplicate") ||
      error?.message?.toLowerCase().includes("unique")
    ) {
      return { error: "Email này đã được sử dụng." };
    }

    return { error: error?.message || "Tạo user thất bại." };
  }
};
