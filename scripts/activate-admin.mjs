/**
 * Script kích hoạt admin user vừa tạo
 * Chạy: node scripts/activate-admin.mjs
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();


async function main() {
  // Xem tất cả user hiện có
  const users = await prisma.users.findMany({
    select: { id: true, name: true, email: true, role: true, userStatus: true, created_on: true },
    orderBy: { created_on: "desc" },
  });

  console.log("\n📋 Danh sách user:");
  console.table(users);

  // Kích hoạt + cấp admin cho user vừa tạo (admin@domain.com)
  const updated = await prisma.users.updateMany({
    where: { email: "admin@domain.com" },
    data: {
      role: "admin",
      userStatus: "ACTIVE",
    },
  });

  console.log(`\n✅ Đã cập nhật ${updated.count} user(s): role=admin, userStatus=ACTIVE`);

  // Kiểm tra lại
  const admin = await prisma.users.findFirst({
    where: { email: "admin@domain.com" },
    select: { id: true, name: true, email: true, role: true, userStatus: true },
  });
  console.log("\n👤 Admin user sau khi cập nhật:");
  console.log(admin);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
