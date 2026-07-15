# HƯỚNG DẪN TRIỂN KHAI CBEC LÊN VERCEL + SUPABASE

> Phiên bản: 1.0 | Cập nhật: 2026-07-16 | Dành cho: Team Operations

---

## 1. ĐIỀU KIỆN TIÊN QUYẾT

Trước khi bắt đầu, đảm bảo bạn có:

- [ ] Tài khoản Vercel (https://vercel.com)
- [ ] Tài khoản Supabase (https://supabase.com) — **Free tier đủ dùng cho production nhỏ**
- [ ] Domain trỏ về Vercel (hoặc dùng subdomain `.vercel.app`)
- [ ] Node.js >= 22.12.0 cài đặt trên máy local
- [ ] pnpm >= 9.0.0

---

## 2. THIẾT LẬP SUPABASE (Lần đầu)

### Bước 2.1: Tạo Project Supabase

1. Đăng nhập Supabase → **New Project**
2. Đặt tên project: `cbec-production`
3. Chọn **Database Password** mạnh — lưu lại ngay
4. Chọn Region gần nhất (Singapore cho VN)
5. Chờ project khởi động (khoảng 1-2 phút)

### Bước 2.2: Lấy Connection Strings

Trong project Supabase → **Project Settings** → **Database**:

**Connection Pooler (cho runtime queries):**
```
postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true
```
→ Dùng làm `DATABASE_URL` trên Vercel

**Direct Connection (cho migrations):**
```
postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres
```
→ Dùng làm `DIRECT_URL` trên Vercel

> ⚠️ **Lưu ý quan trọng**: Hai URL này KHÁC NHAU ở port (6543 vs 5432) và query string `?pgbouncer=true`. Không được nhầm lẫn.

### Bước 2.3: Kích hoạt Row Level Security (RLS)

Nếu chưa có migration RLS, chạy script sau trong **Supabase SQL Editor**:

```sql
-- Kích hoạt RLS cho tất cả bảng
DO $$
DECLARE r record;
BEGIN
  FOR r IN SELECT tablename FROM pg_tables WHERE schemaname = 'public'
  LOOP
    EXECUTE 'ALTER TABLE public.' || quote_ident(r.tablename) || ' ENABLE ROW LEVEL SECURITY;';
    -- Cho phép service_role (Prisma server) bypass RLS
    EXECUTE 'CREATE POLICY IF NOT EXISTS "service_role_bypass" ON public.' || quote_ident(r.tablename) ||
            ' TO service_role USING (true) WITH CHECK (true);';
  END LOOP;
END$$;
```

---

## 3. THIẾT LẬP VERCEL

### Bước 3.1: Import Project

1. Vercel Dashboard → **Add New Project** → **Import Git Repository**
2. Chọn repository `cbec` (hoặc `nextcrm-app`)
3. Framework: **Next.js** (tự nhận diện)
4. Root Directory: `.` (mặc định)

### Bước 3.2: Cấu hình Build Settings

Trong Vercel Project Settings → **Build & Development Settings**:

| Setting | Giá trị |
|---------|---------|
| Build Command | `pnpm run build` |
| Install Command | `pnpm install` |
| Output Directory | `.next` (mặc định) |
| Node.js Version | `22.x` |

### Bước 3.3: Cấu hình Environment Variables

Vào **Project Settings** → **Environment Variables** và thêm từng biến:

#### 🔑 Bắt buộc — Database

| Variable | Value | Environment |
|----------|-------|-------------|
| `DATABASE_URL` | `postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true` | Production, Preview |
| `DIRECT_URL` | `postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres` | Production, Preview |

#### 🔑 Bắt buộc — Auth (Better Auth)

| Variable | Value | Environment |
|----------|-------|-------------|
| `BETTER_AUTH_SECRET` | Chuỗi ngẫu nhiên 32+ chars — [generate tại đây](https://1password.com/password-generator/) | Production |
| `BETTER_AUTH_URL` | `https://your-domain.vercel.app` | Production |
| `NEXT_PUBLIC_APP_URL` | `https://your-domain.vercel.app` | Production |

> ⚠️ **KHÔNG dùng `BETTER_AUTH_SECRET` giống nhau** giữa dev và production. Generate riêng.

#### 🟡 Tuỳ chọn — Email (Resend)

| Variable | Value | Environment |
|----------|-------|-------------|
| `RESEND_API_KEY` | API key từ resend.com | Production |

#### 🟡 Tuỳ chọn — Storage (MinIO hoặc S3)

| Variable | Value |
|----------|-------|
| `S3_ENDPOINT` | URL của S3/MinIO server |
| `S3_ACCESS_KEY_ID` | Access key |
| `S3_SECRET_ACCESS_KEY` | Secret key |
| `S3_BUCKET_NAME` | Tên bucket |

#### 🟡 Tuỳ chọn — Rate Limiting (Upstash Redis)

| Variable | Value |
|----------|-------|
| `UPSTASH_REDIS_REST_URL` | URL từ Upstash console |
| `UPSTASH_REDIS_REST_TOKEN` | Token từ Upstash console |

#### 🟡 Tuỳ chọn — OG Image

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_SITE_URL` | `https://your-domain.vercel.app` |

---

## 4. QUY TRÌNH DEPLOY LẦN ĐẦU

### Bước 4.1: Chạy Migrations Database

Migrations cần được chạy **MỘT LẦN** từ máy local trước khi deploy lần đầu:

```bash
# Kết nối trực tiếp đến Supabase (dùng DIRECT_URL)
$env:DATABASE_URL="postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres"
$env:DIRECT_URL=$env:DATABASE_URL

# Chạy migrations
pnpm exec prisma migrate deploy

# Xác nhận kết quả
# Expected output: "X migrations found in prisma/migrations. All migrations have been applied."
```

### Bước 4.2: Deploy lên Vercel

```bash
# Từ nhánh dev (sau khi đã test local)
git push origin dev

# Tạo PR dev → main
gh pr create --base main --head dev --title "deploy: initial production release"
```

Sau khi merge PR, Vercel tự động deploy.

### Bước 4.3: Thiết lập Admin User đầu tiên

Sau khi deploy thành công:

1. Truy cập `https://your-domain.vercel.app/sign-in`
2. Điền form đăng ký — người dùng **đầu tiên** tự động được cấp quyền `admin` và trạng thái `ACTIVE`
3. Đăng nhập bình thường

> ⚠️ Nếu muốn seed admin từ script, chạy `pnpm exec prisma db seed` từ local với `DIRECT_URL` trỏ vào Supabase.

---

## 5. CHECKLIST TRƯỚC KHI ĐƯA LÊN PRODUCTION

### Bảo mật

- [ ] `BETTER_AUTH_SECRET` đã được generate ngẫu nhiên (không phải giá trị test)
- [ ] `BETTER_AUTH_URL` trỏ đúng domain production
- [ ] Không có file `app/api/dev/` trong repository
- [ ] `RESEND_API_KEY` đã được set trên Vercel (không phải trong code)
- [ ] RLS đã được kích hoạt trên Supabase

### Database

- [ ] `DATABASE_URL` trỏ đến pgBouncer (port 6543, có `?pgbouncer=true`)
- [ ] `DIRECT_URL` trỏ trực tiếp đến DB (port 5432)
- [ ] `prisma migrate deploy` đã chạy thành công
- [ ] Không có pending migrations

### Build

- [ ] `npm run build` (hoặc `pnpm run build`) thành công trên local
- [ ] TypeScript không có lỗi (exit code 0)
- [ ] Không có warnings về type errors

### Metadata (Warning → Production Fix)

Thêm `metadataBase` vào `app/[locale]/layout.tsx`:

```tsx
export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://your-domain.vercel.app"),
  title: "CBEC - CRM System",
  description: "...",
};
```

---

## 6. QUY TRÌNH DEPLOY CÁC LẦN SAU (Routine)

```bash
# 1. Làm việc trên nhánh dev
git add .
git commit -m "feat: thêm tính năng mới"

# 2. Push lên remote dev để test integration
git push origin dev

# 3. Kiểm tra Vercel Preview deployment

# 4. Nếu OK → Tạo PR và merge lên main (production)
gh pr create --base main --head dev --title "feat: mô tả tính năng"
```

---

## 7. XỬ LÝ SỰ CỐ THƯỜNG GẶP

### Lỗi: "Error: The table `...` does not exist in the current database."

**Nguyên nhân:** Migrations chưa được chạy.  
**Giải quyết:** Chạy `prisma migrate deploy` từ local với `DIRECT_URL` trỏ Supabase.

### Lỗi: "Error: prepared statement already exists"

**Nguyên nhân:** `DATABASE_URL` đang dùng connection pooler cho migrations (sai port).  
**Giải quyết:** Dùng `DIRECT_URL` (port 5432) cho migrate, `DATABASE_URL` (port 6543) cho runtime.

### Lỗi: "Error: BETTER_AUTH_SECRET is not set"

**Nguyên nhân:** Biến môi trường chưa được set trên Vercel.  
**Giải quyết:** Vercel Dashboard → Settings → Environment Variables → thêm `BETTER_AUTH_SECRET`.

### Lỗi: "Error: Invalid session" (sau khi deploy)

**Nguyên nhân:** `BETTER_AUTH_SECRET` thay đổi giữa các lần deploy → invalidate sessions cũ.  
**Giải quyết:** Không thay đổi `BETTER_AUTH_SECRET` sau khi đã có users. Nếu cần thay đổi, thông báo trước để users re-login.

---

## 8. MONITORING VÀ LOGS

### Xem logs Vercel

```bash
vercel logs --follow
```

Hoặc truy cập Vercel Dashboard → Project → **Deployments** → chọn deployment → **Functions**.

### Kiểm tra Prisma connections

Trong Supabase Dashboard → **Project Settings** → **Database** → **Connection Pool** để xem số lượng connections hiện tại.

---

*Tài liệu này cần được cập nhật khi có thay đổi về cấu hình deployment.*
