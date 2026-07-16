import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { admin as adminPlugin } from "better-auth/plugins";
import { prismadb } from "@/lib/prisma";
import { ac, admin, manager, user } from "@/lib/auth-permissions";


const getBaseURL = () => {
  if (process.env.VERCEL === "1") {
    if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
      return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
    }
    if (process.env.VERCEL_URL) {
      return `https://${process.env.VERCEL_URL}`;
    }
  }
  return process.env.BETTER_AUTH_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
};

const isDemo = process.env.NEXT_PUBLIC_APP_URL === "https://demo.nextcrm.io";

export const auth = betterAuth({
  database: prismaAdapter(prismadb, { provider: "postgresql" }),
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: getBaseURL(),
  trustedOrigins: [
    "https://cbec-crm.vercel.app",
    "https://*.vercel.app",
  ],
  advanced: {
    database: {
      generateId: "uuid",
    },
  },

  session: {
    expiresIn: 60 * 60 * 24 * 7,    // 7 ngày
    updateAge: 60 * 60 * 24,         // refresh mỗi 24 giờ
  },

  user: {
    modelName: "Users",
    fields: {
      createdAt: "created_on",
      updatedAt: "updated_at",
      image: "image",
    },
    additionalFields: {
      role: {
        type: "string",
        defaultValue: "user",
        input: false,
      },
      userStatus: {
        type: "string",
        defaultValue: isDemo ? "ACTIVE" : "PENDING",
        input: false,
      },
      userLanguage: {
        type: "string",
        defaultValue: "en",
        input: false,
      },
      avatar: {
        type: "string",
        required: false,
        input: false,
      },
    },
  },

  emailAndPassword: {
    enabled: true,
    // autoSignIn mặc định là false — admin tạo user không bị tự đăng nhập
    autoSignIn: false,
    // Không yêu cầu verify email — admin tạo user trực tiếp, không cần confirm
    requireEmailVerification: false,
  },


  plugins: [
    adminPlugin({
      ac,
      roles: { admin, manager, user },
      defaultRole: "user",
    }),
  ],

  account: {
    accountLinking: {
      enabled: false,
    },
  },

  callbacks: {
    async onUserCreated(user: { id: string }) {
      // Người dùng đầu tiên được tạo → tự động thành admin và kích hoạt
      // Dùng findFirst thay vì count() để tránh race condition
      // (nếu nhiều user được tạo cùng lúc, count() có thể trả về sai)
      const firstUser = await prismadb.users.findFirst({
        orderBy: { created_on: "asc" },
        select: { id: true },
      });
      if (firstUser?.id === user.id) {
        await prismadb.users.update({
          where: { id: user.id },
          data: { role: "admin", userStatus: "ACTIVE" },
        });
      }
      // Với email+password, admin tạo user trực tiếp từ trang quản trị
      // nên không cần gửi thông báo newUserNotify ở đây nữa
    },
  },
});

export type Session = typeof auth.$Infer.Session;
