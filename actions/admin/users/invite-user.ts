"use server";
import { prismadb } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { Language } from "@prisma/client";
import {
  requireRole,
  AuthenticationError,
  AuthorizationError,
} from "@/lib/authz";

export const inviteUser = async (data: {
  name: string;
  email: string;
  language: string;
}) => {
  try {
    await requireRole(["admin"]);
  } catch (e) {
    if (e instanceof AuthenticationError) return { error: "Unauthorized" };
    if (e instanceof AuthorizationError) return { error: "Forbidden" };
    throw e;
  }

  const { name, email, language } = data;

  if (!name || !email || !language) {
    return { error: "Name, Email, and Language is required!" };
  }

  const checkexisting = await prismadb.users.findFirst({
    where: { email },
  });

  if (checkexisting) {
    return { error: "User already exists!" };
  }

  try {
    const user = await prismadb.users.create({
      data: {
        name,
        email,
        userStatus: "ACTIVE",
        userLanguage: language as Language,
        role: "user",
      },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        role: true,
        userLanguage: true,
        userStatus: true,
        lastLoginAt: true,
      },
    });

    if (!user) {
      return { error: "User not created" };
    }

    revalidatePath("/[locale]/(routes)/admin", "page");
    return { data: user };
  } catch (error) {
    console.log("[INVITE_USER]", error);
    return { error: "Failed to create user" };
  }
};
