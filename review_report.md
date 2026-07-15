# BÁO CÁO RÀ SOÁT MÃ NGUỒN — HỆ THỐNG CBEC

> Phiên bản ứng dụng: 0.0.3-beta | Ngày tạo: 2026-07-16 | Người thực hiện: AI Agent (Senior Code Reviewer)

---

## TÓM TẮT ĐIỀU HÀNH

| Nhóm lỗi | Số lượng | Mức độ nghiêm trọng |
|-----------|---------|---------------------|
| Lỗi biên dịch (Build) | 2 | 🔴 Critical |
| Lỗi bảo mật | 3 | 🔴 Critical |
| Lỗi xác thực người dùng | 1 | 🟡 High |
| Hiệu năng | 3 | 🟢 Medium |
| Mã nguồn dư thừa | 4 | ⚪ Low |

---

## NHÓM 1: LỖI BIÊN DỊCH

---

### Mã lỗi BLD01: Prisma `datasource db` thiếu trường `url`

- **Đường dẫn tệp tin:** `prisma/schema.prisma` (dòng 8-10)
- **Mức độ ảnh hưởng:** 🔴 Nghiêm trọng cao
- **Mô tả chi tiết:**

  Block `datasource db` trong file schema chỉ khai báo `provider` mà **không có trường `url`**:

  ```prisma
  datasource db {
    provider = "postgresql"
    // url và directUrl BỊ THIẾU
  }
  ```

  Prisma 6.x với `prisma.config.ts` sử dụng cấu hình mới (Prisma Config API), cho phép cung cấp `url` qua `prisma.config.ts`. Tuy nhiên, lệnh `prisma generate` và `prisma migrate deploy` cần cơ chế này hoạt động đúng. Thêm vào đó, khi triển khai lên **Supabase với pgBouncer** (connection pooler), cần có hai URL riêng biệt:
  - `DATABASE_URL`: URL kết nối qua pgBouncer (pooled, `?pgbouncer=true`)
  - `DIRECT_URL`: URL kết nối trực tiếp đến DB (không qua pgBouncer, dùng cho migrations)

  Hiện tại file `.env` có `DIRECT_URL` nhưng schema không sử dụng nó, dẫn đến `prisma migrate deploy` có thể lỗi với Supabase.

- **Đề xuất xử lý:**

  Cập nhật `prisma/schema.prisma` để thêm `url` và `directUrl`:
  ```prisma
  datasource db {
    provider  = "postgresql"
    url       = env("DATABASE_URL")
    directUrl = env("DIRECT_URL")
  }
  ```

---

### Mã lỗi BLD02: `NEXT_PUBLIC_NEXT_VERSION` không hợp lệ trong `.env`

- **Đường dẫn tệp tin:** `.env` (dòng 20)
- **Mức độ ảnh hưởng:** 🟡 Medium
- **Mô tả chi tiết:**

  File `.env` khai báo:
  ```
  NEXT_PUBLIC_NEXT_VERSION="16.2.6"
  ```
  Đây là biến public (client-exposed) với giá trị hiển thị phiên bản Next.js — không cần thiết và có thể gây nhầm lẫn. Không phải lỗi biên dịch nhưng là lỗi cấu hình không cần thiết.

- **Đề xuất xử lý:** Xóa biến này khỏi `.env` và `.env.example`.

---

## NHÓM 2: LỖI BẢO MẬT

---

### Mã lỗi SEC01: Route DEV `/api/dev/seed-admin` chưa bị xóa — Nguy cơ leo thang đặc quyền

- **Đường dẫn tệp tin:** `app/api/dev/seed-admin/route.ts`
- **Mức độ ảnh hưởng:** 🔴 Nghiêm trọng cao
- **Mô tả chi tiết:**

  Route này được thiết kế để tạo admin user trong môi trường dev, nhưng có hai vấn đề:

  1. **Secret key hardcode trong code**: `const DEV_SECRET = "dev123"` — ai cũng có thể đoán được nếu source code bị lộ.
  2. **Kiểm tra `NODE_ENV === "production"` không đáng tin cậy**: Trên Vercel, `NODE_ENV` luôn là `"production"` khi build, nhưng nếu deploy preview hoặc staging dùng `.env` sai, route này vẫn có thể được kích hoạt.
  3. **Cho phép tạo admin từ query string**: Kẻ tấn công có thể gọi `GET /api/dev/seed-admin?secret=dev123&email=admin@domain.com` để leo thang đặc quyền.

  File có comment `// XÓA ROUTE NÀY TRƯỚC KHI DEPLOY PRODUCTION` nhưng chưa được xóa.

- **Đề xuất xử lý:**

  **XÓA HOÀN TOÀN** thư mục `app/api/dev/` trước khi deploy. Thay thế bằng một Prisma seed script chạy một lần (`prisma/seeds/seed.ts`).

---

### Mã lỗi SEC02: `RESEND_API_KEY` bị lộ qua Server Component trong Admin UI

- **Đường dẫn tệp tin:** `app/[locale]/(routes)/admin/_components/ResendCard.tsx` (dòng 68-75)
- **Mức độ ảnh hưởng:** 🔴 Nghiêm trọng cao
- **Mô tả chi tiết:**

  Component `ResendCard.tsx` là Server Component nhưng nó hiển thị giá trị của `process.env.RESEND_API_KEY` ra HTML thông qua component `CopyKeyComponent`:

  ```tsx
  {process.env.RESEND_API_KEY ? (
    <CopyKeyComponent
      keyValue={process.env.RESEND_API_KEY}  // ⚠️ KEY BỊ LỘ TRONG HTML
      message="Resend - API Key"
    />
  ) : (...)}
  ```

  Tuy component này ở trong admin UI (yêu cầu đăng nhập), nhưng:
  - API key hiển thị dạng text trong DOM, có thể bị ghi lại bởi browser extension độc hại
  - Nếu admin session bị chiếm đoạt (XSS), key sẽ bị đánh cắp ngay lập tức
  - `RESEND_API_KEY` là secret cấp server, không bao giờ nên render ra UI

- **Đề xuất xử lý:**

  Thay vì hiển thị key thực, chỉ hiển thị trạng thái "configured" hoặc "not configured":
  ```tsx
  {process.env.RESEND_API_KEY ? (
    <span className="text-green-600">✓ Đã cấu hình</span>
  ) : (
    <span className="text-red-500">✗ Chưa cấu hình</span>
  )}
  ```

---

### Mã lỗi SEC03: `getCampaigns` trong `actions/crm/` không có auth guard

- **Đường dẫn tệp tin:** `actions/crm/get-campaigns.ts`
- **Mức độ ảnh hưởng:** 🟡 High
- **Mô tả chi tiết:**

  Trong thư mục `actions/crm/` có file `get-campaigns.ts` (khác với `actions/campaigns/get-campaigns.ts`) sử dụng Prisma trực tiếp mà **không kiểm tra auth**:

  ```typescript
  // actions/crm/get-campaigns.ts
  import { prismadb } from "@/lib/prisma";
  
  export const getCampaigns = async () => {
    const data = await prismadb.crm_campaigns.findMany({});  // Không có auth check, không có where clause
    return data;
  };
  ```

  Trong khi đó, `actions/campaigns/get-campaigns.ts` (phiên bản đúng) đã có `requireAuthenticated()` và `campaignReadScopeWhere`. File trong `actions/crm/` là code cũ dư thừa có thể vẫn đang được import ở đâu đó.

- **Đề xuất xử lý:** Kiểm tra toàn bộ import của `actions/crm/get-campaigns.ts` và xóa file này. Đảm bảo tất cả code sử dụng `actions/campaigns/get-campaigns.ts`.

---

## NHÓM 3: LỖI XÁC THỰC NGƯỜI DÙNG

---

### Mã lỗi AUTH01: Race condition trong `onUserCreated` callback — Người dùng đầu tiên không được cấp quyền admin ổn định

- **Đường dẫn tệp tin:** `lib/auth.ts` (dòng 80-92)
- **Mức độ ảnh hưởng:** 🟡 High
- **Mô tả chi tiết:**

  Callback `onUserCreated` sử dụng `prismadb.users.count()` để kiểm tra xem đây có phải người dùng đầu tiên không:

  ```typescript
  callbacks: {
    async onUserCreated(user: { id: string }) {
      const count = await prismadb.users.count();
      if (count === 1) {  // ⚠️ Race condition có thể xảy ra
        await prismadb.users.update({...});
      }
    }
  }
  ```

  **Vấn đề**: Nếu trong khoảng thời gian giữa bước tạo user và bước `count()`, có một user khác được tạo (scenario ít xảy ra nhưng có thể trong môi trường concurrent), count có thể trả về giá trị > 1, khiến admin đầu tiên không được kích hoạt. Đây là race condition cổ điển trong logic "first-user-is-admin".

  **Thực tế hơn**: Với small team deployment, vấn đề này hiếm khi xảy ra, nhưng cần lưu ý khi có seeding hoặc migration dữ liệu.

- **Đề xuất xử lý:**

  Thay `count()` bằng kiểm tra trực tiếp xem user vừa tạo có phải ID đầu tiên không, hoặc sử dụng `findFirst` với `orderBy: { created_on: 'asc' }` để lấy user sớm nhất:
  ```typescript
  const firstUser = await prismadb.users.findFirst({
    orderBy: { created_on: 'asc' },
    select: { id: true },
  });
  if (firstUser?.id === user.id) {
    await prismadb.users.update({...});
  }
  ```

---

## NHÓM 4: HIỆU NĂNG HỆ THỐNG

---

### Mã lỗi PERF01: `schema.prisma` thiếu `directUrl` — Migrations chậm trên Supabase

- **Đường dẫn tệp tin:** `prisma/schema.prisma` (dòng 8-10)
- **Mức độ ảnh hưởng:** 🟢 Medium
- **Mô tả chi tiết:**

  Khi triển khai lên Supabase với pgBouncer, việc chạy migrations qua connection pooler thường gây lỗi "prepared statement already exists" hoặc timeout. Supabase khuyến nghị dùng `directUrl` cho migrations và `url` (pooled) cho runtime queries.

  Hiện tại `DATABASE_URL` và `DIRECT_URL` trong `.env` đều trỏ về cùng `localhost:5432` (local dev), nên khi dev không thấy vấn đề. Nhưng khi deploy lên Supabase, nếu không cấu hình đúng sẽ gây lỗi migrations.

- **Đề xuất xử lý:** Xem BLD01 — thêm `directUrl = env("DIRECT_URL")` vào schema.

---

### Mã lỗi PERF02: `getCampaigns` trong `actions/crm/` — Full table scan

- **Đường dẫn tệp tin:** `actions/crm/get-campaigns.ts`
- **Mức độ ảnh hưởng:** 🟢 Medium
- **Mô tả chi tiết:**

  ```typescript
  const data = await prismadb.crm_campaigns.findMany({});  // Không có select, where, limit
  ```

  Query này lấy toàn bộ dữ liệu campaigns không giới hạn, bao gồm tất cả fields. Với bảng lớn, đây là full table scan tốn kém.

- **Đề xuất xử lý:** Xóa file này (đã có phiên bản tốt hơn ở `actions/campaigns/get-campaigns.ts`).

---

### Mã lỗi PERF03: Thiếu `skip` và `take` pagination trong một số queries CRM

- **Đường dẫn tệp tin:** `actions/crm/get-accounts.ts`, `actions/crm/get-contacts.ts`, v.v.
- **Mức độ ảnh hưởng:** 🟢 Medium
- **Mô tả chi tiết:**

  Một số action files cho phép query toàn bộ records mà không có giới hạn. Trong môi trường production với hàng nghìn records, điều này sẽ gây chậm.

- **Đề xuất xử lý:** Thêm default `take: 100` và cursor-based pagination cho các endpoints có thể trả về nhiều records. (Giai đoạn cải thiện dài hạn)

---

## NHÓM 5: MÃ NGUỒN DƯ THỪA

---

### Mã lỗi DEAD01: `actions/crm/get-campaigns.ts` — File dư thừa, code cũ không có auth

- **Đường dẫn tệp tin:** `actions/crm/get-campaigns.ts`
- **Mức độ ảnh hưởng:** 🔴 Bảo mật + Dead code
- **Mô tả chi tiết:** File này trùng tên chức năng với `actions/campaigns/get-campaigns.ts` nhưng là phiên bản cũ không có auth. Cần xóa.

---

### Mã lỗi DEAD02: `app/[locale]/globals.css.bck` — Backup file trong repo

- **Đường dẫn tệp tin:** `app/[locale]/globals.css.bck`
- **Mức độ ảnh hưởng:** ⚪ Low
- **Mô tả chi tiết:** File backup CSS không nên commit vào git repository. Không ảnh hưởng build nhưng gây rối.
- **Đề xuất xử lý:** Xóa file và thêm `*.bck` vào `.gitignore`.

---

### Mã lỗi DEAD03: `ApiKeyProvider` enum còn OPENAI, FIRECRAWL, ANTHROPIC, GROQ trong schema

- **Đường dẫn tệp tin:** `prisma/schema.prisma` (dòng 1056-1066)
- **Mức độ ảnh hưởng:** ⚪ Low
- **Mô tả chi tiết:**

  Schema vẫn giữ enum values cho các AI providers đã bị xóa khỏi UI:
  ```prisma
  enum ApiKeyProvider {
    OPENAI      // ⚠️ Đã xóa khỏi UI?
    FIRECRAWL   // ⚠️ Đã xóa khỏi UI?
    ANTHROPIC   // ⚠️ Đã xóa khỏi UI?
    GROQ        // ⚠️ Đã xóa khỏi UI?
  }
  ```
  Nếu UI không còn sử dụng các providers này, enum có thể được dọn dẹp trong migration tiếp theo.

---

### Mã lỗi DEAD04: `app/api/crm/contacts/enrich/` và `enrich-bulk/` — API stubs chưa xóa

- **Đường dẫn tệp tin:** `app/api/crm/contacts/enrich/route.ts`, `app/api/crm/contacts/enrich-bulk/route.ts`
- **Mức độ ảnh hưởng:** ⚪ Low
- **Mô tả chi tiết:**

  Hai routes này đã được stub thành HTTP 410 Gone, nhưng vẫn còn tồn tại. Đây là cách xử lý đúng (graceful degradation), tuy nhiên có thể xóa hoàn toàn nếu không cần backward compatibility.

---

## ĐÁNH GIÁ RLS (ROW LEVEL SECURITY)

File migration `supabase/migrations/20260715_enable_rls_all_tables.sql` đã được tạo và bao gồm:
- ✅ `ALTER TABLE ... ENABLE ROW LEVEL SECURITY` cho tất cả bảng public
- ✅ `service_role` bypass policies (để Prisma server-side hoạt động đúng)
- ✅ Restrict `anon` và `authenticated` roles

**Đánh giá:** RLS đã được thiết lập đúng. Cần đảm bảo migration này đã được apply lên Supabase production.

---

## ĐÁNH GIÁ BETTER AUTH

| Khía cạnh | Trạng thái | Ghi chú |
|-----------|-----------|---------|
| Session config | ✅ Tốt | 7 ngày TTL, 24h refresh |
| Email/password | ✅ Tốt | `autoSignIn: false`, không cần verify email |
| Admin plugin | ✅ Tốt | RBAC: admin, manager, user |
| Account linking | ✅ Tốt | Disabled |
| `getSession()` usage | ✅ Tốt | Dùng `await headers()` đúng cách |
| `requireAuthenticated()` | ✅ Tốt | Double-check DB user tồn tại |
| `BETTER_AUTH_SECRET` | ⚠️ Warning | Đã set nhưng cần regenerate cho production |
| `BETTER_AUTH_URL` | ⚠️ Warning | Hiện trỏ localhost, cần update cho production |

---

## NHẬT KÝ SỬA ĐỔI

> Cập nhật: 2026-07-16 | Giai đoạn 3 hoàn thành

### Lần sửa đổi 1 — Sửa lỗi biên dịch & bảo mật (Batch 1)

**Thời gian:** 2026-07-16

| # | Lỗi | Hành động | File | Kết quả |
|---|-----|-----------|------|---------|
| 1 | BLD01 | Phát hiện Prisma 7 không hỗ trợ `url` trong schema → Cấu hình `directUrl` vào `prisma.config.ts` | `prisma.config.ts` | ✅ Đã sửa |
| 2 | BLD01 | Hoàn nguyên `prisma/schema.prisma` về đúng cú pháp Prisma 7 (chỉ `provider`) | `prisma/schema.prisma` | ✅ Đã sửa |
| 3 | SEC01 | **Xóa** toàn bộ thư mục `app/api/dev/` và route seed-admin nguy hiểm | `app/api/dev/` | ✅ Đã xóa |
| 4 | SEC02 | Che giấu `RESEND_API_KEY` trong ResendCard — thay render giá trị bằng status | `ResendCard.tsx` | ✅ Đã sửa |
| 5 | AUTH01 | Sửa race condition `count()` → `findFirst()` trong `onUserCreated` | `lib/auth.ts` | ✅ Đã sửa |
| 6 | DEAD01 | Xóa `actions/crm/get-campaigns.ts` (dead code không có auth) | `actions/crm/get-campaigns.ts` | ✅ Đã xóa |
| 7 | DEAD02 | Xóa `globals.css.bck` backup file | `app/[locale]/globals.css.bck` | ✅ Đã xóa |
| 8 | DEAD02 | Thêm `*.bck` và `*.backup` vào `.gitignore` | `.gitignore` | ✅ Đã thêm |

### Kết quả kiểm tra build sau sửa đổi

```
> nextcrm-app@0.12.3 build
> prisma generate && prisma migrate deploy && next build

✔ Generated Prisma Client (v7.6.0) in 602ms
  No pending migrations to apply.
  ▲ Next.js 16.2.6 (Turbopack)
  ✓ Compiled successfully in 11.8s
  ✓ TypeScript in 25.6s
  ✓ Generating static pages (17/17) in 113ms

Exit code: 0 ✅ BUILD THÀNH CÔNG
```

**Warning còn lại (không ảnh hưởng build):**
- `metadataBase` chưa được cấu hình → Sẽ xử lý trong `deploy_guide.md` khi setup production URL

