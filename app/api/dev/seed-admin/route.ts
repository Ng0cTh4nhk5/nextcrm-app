/**
 * Route API tạm để seed admin user — CHỈ DÙNG TRONG DEV
 * Gọi: GET /api/dev/seed-admin?secret=dev123&email=admin@domain.com&password=Admin@2024!
 *
 * XÓA ROUTE NÀY TRƯỚC KHI DEPLOY PRODUCTION
 */

import { NextRequest, NextResponse } from "next/server";
import { prismadb } from "@/lib/prisma";
import { auth } from "@/lib/auth";

const DEV_SECRET = "dev123";

export async function GET(req: NextRequest) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not available in production" }, { status: 404 });
  }

  const secret = req.nextUrl.searchParams.get("secret");
  if (secret !== DEV_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const targetEmail = req.nextUrl.searchParams.get("email") || "admin@domain.com";
  const newPassword = req.nextUrl.searchParams.get("password") || "Admin@2024!";

  try {
    // Tìm user hiện tại
    const existingUser = await prismadb.users.findFirst({
      where: { email: targetEmail },
    });

    if (!existingUser) {
      return NextResponse.json({ error: `User ${targetEmail} không tồn tại trong DB` }, { status: 404 });
    }

    // Kiểm tra xem đã có credential account chưa
    const existingAccount = await prismadb.account.findFirst({
      where: { userId: existingUser.id, providerId: "credential" },
    });

    let step = "";

    if (existingAccount) {
      step = "credential_exists";
    } else {
      // Cần tạo credential account — dùng Better Auth sign-up với email tạm
      // để lấy hash password, rồi chuyển account sang user cũ
      const tempEmail = `temp_seed_${Date.now()}@nextcrm-temp.invalid`;

      const signupRes = await auth.api.signUpEmail({
        body: { email: tempEmail, password: newPassword, name: existingUser.name || "Admin" },
        asResponse: true,
      });

      if (signupRes.status !== 200) {
        const errBody = await signupRes.text();
        return NextResponse.json({ error: "signUp failed", detail: errBody }, { status: 500 });
      }

      const signupData = await signupRes.json();
      const tempUserId = signupData?.user?.id;

      if (!tempUserId) {
        return NextResponse.json({ error: "No user ID from signup" }, { status: 500 });
      }

      // Chuyển credential account từ tempUser sang existingUser
      await prismadb.account.updateMany({
        where: { userId: tempUserId, providerId: "credential" },
        data: { userId: existingUser.id },
      });

      // Xóa temp user (session và account đã chuyển sang existingUser)
      await prismadb.session.deleteMany({ where: { userId: tempUserId } });
      await prismadb.account.deleteMany({ where: { userId: tempUserId } });
      await prismadb.users.delete({ where: { id: tempUserId } });

      step = "credential_created";
    }

    // Kích hoạt user + cấp quyền admin
    await prismadb.users.update({
      where: { id: existingUser.id },
      data: { role: "admin", userStatus: "ACTIVE" },
    });

    const finalUser = await prismadb.users.findFirst({
      where: { id: existingUser.id },
      select: { id: true, name: true, email: true, role: true, userStatus: true },
    });

    return NextResponse.json({
      success: true,
      step,
      user: finalUser,
      message: `✅ Xong! Đăng nhập với:\n  Email: ${targetEmail}\n  Password: ${newPassword}`,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
