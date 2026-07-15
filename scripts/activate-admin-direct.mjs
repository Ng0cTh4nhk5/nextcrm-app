/**
 * Kích hoạt admin user bằng cách gọi Better Auth admin API
 * (cần login admin trước → không có admin → dùng Prisma ORM trực tiếp)
 *
 * Với Prisma 7, cần dùng prismadb từ lib/prisma thông qua Next.js
 * Cách đơn giản nhất: gọi API endpoint đặc biệt để seed data
 *
 * Chạy: node scripts/activate-admin-direct.mjs
 */

// Gọi Better Auth set-user-password (bypass bằng cách gọi nội bộ)
const BETTER_AUTH_URL = "http://localhost:3000";

// Bước 1: Lấy user list từ DB thông qua API nội bộ
// Bước 2: Kích hoạt user bằng cách gọi /api/seed-admin (cần tạo route)

// Cách nhanh: Dùng fetch để gọi /api/auth/sign-in/email
// nếu lỗi email-not-verified, kích hoạt thẳng qua Better Auth admin API

// Trước tiên tạo một user khác để làm admin bootstrap
const BOOTSTRAP_EMAIL = `bootstrap_${Date.now()}@nextcrm-temp.local`;
const BOOTSTRAP_PASS = "Bootstrap123!";

async function main() {
  console.log("🔧 Bootstrap admin account...\n");

  // 1. Tạo user bootstrap mới
  console.log("1️⃣ Tạo user bootstrap tạm...");
  const signupRes = await fetch(`${BETTER_AUTH_URL}/api/auth/sign-up/email`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Origin": BETTER_AUTH_URL },
    body: JSON.stringify({ email: BOOTSTRAP_EMAIL, password: BOOTSTRAP_PASS, name: "Bootstrap" }),
  });
  const signupData = await signupRes.json();
  console.log("Signup:", signupRes.status, signupData?.user?.id || signupData?.message);

  if (signupRes.status !== 200) {
    console.error("❌ Tạo bootstrap user thất bại");
    return;
  }

  const bootstrapUserId = signupData.user.id;

  // 2. Kích hoạt bootstrap user thông qua set-user-role admin API
  // Cần tự activate bằng verify token — hoặc dùng cách khác
  // Better Auth emailVerified = false sẽ block login
  // Dùng /api/auth/admin/set-user-password thay thế
  
  // Method khác: gọi /api/auth/admin endpoints với hardcoded admin secret
  // Hoặc tạo route API tạm trong app để seed

  console.log("\n⚠️  Không thể tự kích hoạt qua API public.");
  console.log("📌 Giải pháp: Cần thêm route API seed tạm hoặc sửa config Better Auth.");
  console.log("\n💡 Giải pháp nhanh nhất: Tắt email verification trong Better Auth.\n");
  console.log(`Bootstrap user ID: ${bootstrapUserId}`);
  console.log("Xóa bootstrap user sau khi dùng xong.");
}

main().catch(console.error);
