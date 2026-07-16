/**
 * Script tạm để set password cho admin user hiện tại
 * Chạy: node scripts/set-admin-password.mjs
 */

const BETTER_AUTH_URL = "http://localhost:3000";
const ADMIN_EMAIL = "admin@domain.com";
const NEW_PASSWORD = "Admin@2024!";

async function main() {
  console.log(`🔑 Đang đặt lại mật khẩu cho: ${ADMIN_EMAIL}`);
  console.log(`📡 Gọi Better Auth API: ${BETTER_AUTH_URL}/api/auth/sign-up/email`);
  console.log("⚠️  Nếu email đã tồn tại, sẽ báo lỗi — cần dùng API reset password\n");

  // Thử tạo account row mới với credential provider
  // Better Auth xử lý hash tự động
  const res = await fetch(`${BETTER_AUTH_URL}/api/auth/sign-up/email`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Origin": BETTER_AUTH_URL,
    },
    body: JSON.stringify({
      email: ADMIN_EMAIL,
      password: NEW_PASSWORD,
      name: "Admin",
    }),
  });

  const data = await res.json();
  console.log("Response status:", res.status);
  console.log("Response body:", JSON.stringify(data, null, 2));

  if (res.status === 200 || res.status === 201) {
    console.log("\n✅ Thành công!");
    console.log(`📧 Email: ${ADMIN_EMAIL}`);
    console.log(`🔐 Password: ${NEW_PASSWORD}`);
  } else {
    console.log("\n❌ Tạo mới thất bại (email đã tồn tại).");
    console.log("👉 Thử đặt lại mật khẩu qua API admin...\n");
  }
}

main().catch(console.error);
