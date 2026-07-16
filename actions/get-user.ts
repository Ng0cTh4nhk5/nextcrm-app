import { prismadb } from "@/lib/prisma";
import { getSession } from "@/lib/auth-server";

export const getUser = async () => {
  const session = await getSession();
  const userId = session?.user?.id;
  if (!userId) {
    throw new Error("Unauthenticated");
  }

  const data = await prismadb.users.findUnique({
    where: { id: userId },
    select: {
      id: true,
      v: true,
      account_name: true,
      avatar: true,
      email: true,
      emailVerified: true,
      image: true,
      role: true,
      created_on: true,
      updated_at: true,
      lastLoginAt: true,
      name: true,
      username: true,
      userStatus: true,
      userLanguage: true,
      banned: true,
      banReason: true,
      banExpires: true,
    },
  });

  if (!data) {
    throw new Error("User not found");
  }

  return data;
};
