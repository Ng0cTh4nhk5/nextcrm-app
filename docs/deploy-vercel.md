# Hướng dẫn Deploy NextCRM lên Vercel

> Stack: **Next.js** + **Vercel** + **Supabase** (PostgreSQL + Storage)

---

## Tổng quan quy trình

```
1. Chuẩn bị codebase
2. Setup Supabase (Database + Storage)
3. Chạy Database Migration
4. Deploy lên Vercel
5. Cấu hình Environment Variables
6. Cấu hình OAuth & dịch vụ ngoài
7. Kiểm tra & Go Live
```

---

## Bước 1 — Chuẩn bị Codebase

### 1.1 Kiểm tra `next.config.js`

Đảm bảo **không có** `output: "standalone"` — cấu hình đó dành cho Docker, không dùng với Vercel.

File `next.config.js` đúng:

```js
const withNextIntl = require("next-intl/plugin")("./i18n/request.ts");

const nextConfig = {
  serverExternalPackages: ["pdf-parse", "pdfjs-dist"],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "[PROJECT-REF].supabase.co" }, // thêm domain Supabase
    ],
  },
  // ...
};

module.exports = withNextIntl(nextConfig);
```

> ⚠️ Nhớ thêm hostname Supabase vào `remotePatterns` để ảnh từ Supabase Storage hiển thị được.

### 1.2 Commit thay đổi

```bash
git add next.config.js
git commit -m "chore: prepare next.config.js for Vercel deployment"
git push origin dev
```

---

## Bước 2 — Setup Supabase

### 2.1 Tạo Project

1. Đăng ký / đăng nhập tại [supabase.com](https://supabase.com)
2. Click **New Project**
3. Điền:
   - **Name**: `nextcrm-prod` (hoặc tên bạn muốn)
   - **Database Password**: tạo password mạnh, **lưu lại ngay**
   - **Region**: `Southeast Asia (Singapore)` — gần Việt Nam nhất
4. Đợi ~2 phút để project khởi động xong

### 2.2 Lấy Database URL

Vào **Project Settings → Database → Connection string**:

- Chọn tab **Transaction** (bắt buộc với Vercel serverless)
- Copy URI dạng:

```
postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

> 💡 `[PROJECT-REF]` là chuỗi ký tự ngắn trong URL project của bạn, ví dụ `abcdefghijklmnop`.

### 2.3 Tạo Storage Bucket

1. Vào tab **Storage** trong Supabase Dashboard
2. Click **New bucket**
3. Điền:
   - **Name**: `nextcrm`
   - **Public bucket**: ✅ bật (để file có thể truy cập qua URL công khai)
4. Click **Save**

### 2.4 Lấy API Keys

Vào **Project Settings → API**:

| Key | Dùng cho |
|-----|----------|
| **Project URL** | `https://[PROJECT-REF].supabase.co` |
| **anon / public** | Client-side (không dùng trong project này) |
| **service_role** | `MINIO_SECRET_KEY` — dùng để upload file server-side |

> ⚠️ `service_role` key là **bí mật tuyệt đối** — không bao giờ đưa vào `NEXT_PUBLIC_*`.

---

## Bước 3 — Chạy Database Migration

Chạy lệnh này trên máy local để đẩy schema lên Supabase:

```powershell
# Windows PowerShell
$env:DATABASE_URL="postgresql://postgres.[ref]:[password]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
npx prisma migrate deploy
```

```bash
# macOS / Linux
DATABASE_URL="postgresql://postgres.[ref]:[password]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true" \
  npx prisma migrate deploy
```

Kết quả thành công:
```
Applied X migration(s) to the database.
```

---

## Bước 4 — Deploy lên Vercel

### Option A: Vercel Dashboard (khuyến nghị lần đầu)

1. Vào [vercel.com/new](https://vercel.com/new)
2. **Import** repo GitHub `Ng0cTh4nhk5/nextcrm-app`
3. Framework preset tự nhận **Next.js** ✅
4. **Chưa cần** điền env vars ở bước này — làm ở Bước 5
5. Click **Deploy** (sẽ fail lần đầu vì chưa có env vars — bình thường)

### Option B: Vercel CLI

```powershell
# Cài Vercel CLI (chạy 1 lần)
npm i -g vercel

# Đăng nhập
vercel login

# Deploy từ thư mục project
cd d:\Working\nextcrm-app
vercel

# Sau khi đã có env vars → deploy production
vercel --prod
```

---

## Bước 5 — Cấu hình Environment Variables

Vào **Vercel Dashboard → Project → Settings → Environment Variables**.

Thêm từng biến, chọn scope **Production** (và **Preview** nếu muốn test trên preview deploy).

### 5.1 Database

```env
DATABASE_URL=postgresql://postgres.[ref]:[password]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

### 5.2 Authentication (Better Auth)

```env
BETTER_AUTH_SECRET=<generate: openssl rand -base64 32>
BETTER_AUTH_URL=https://your-app.vercel.app
```

> Sau khi có domain Vercel thật (hoặc custom domain), cập nhật `BETTER_AUTH_URL` cho đúng.

### 5.3 Google OAuth

```env
GOOGLE_ID=your-google-client-id
GOOGLE_SECRET=your-google-client-secret
```

### 5.4 Email (Resend)

```env
RESEND_API_KEY=re_xxxxxxxxxxxx
RESEND_FROM_EMAIL=noreply@yourdomain.com
RESEND_WEBHOOK_SECRET=whsec_xxxxxxxxxxxx
```

### 5.5 Storage (Supabase Storage — thay thế MinIO)

```env
MINIO_ENDPOINT=https://[PROJECT-REF].supabase.co/storage/v1/s3
MINIO_ACCESS_KEY=[PROJECT-REF]
MINIO_SECRET_KEY=[service_role key từ Supabase Settings → API]
MINIO_BUCKET=nextcrm
MINIO_USE_SSL=true
NEXT_PUBLIC_MINIO_ENDPOINT=https://[PROJECT-REF].supabase.co/storage/v1/object/public
```

> 💡 `NEXT_PUBLIC_MINIO_ENDPOINT` trỏ `/object/public` để browser có thể load file trực tiếp.

### 5.6 AI & các dịch vụ khác (tùy chọn)

```env
OPENAI_API_KEY=sk-xxxxxxxxxxxx
FIRECRAWL_API_KEY=fc-xxxxxxxxxxxx
ROSSUM_USERNAME=your-username
ROSSUM_PASSWORD=your-password
CRON_SECRET=<generate: openssl rand -hex 16>
EMAIL_ENCRYPTION_KEY=<64 ký tự hex: openssl rand -hex 32>
```

### 5.7 Redeploy sau khi điền xong

Vào **Vercel Dashboard → Deployments → ... → Redeploy** để áp dụng env vars mới.

---

## Bước 6 — Cấu hình dịch vụ ngoài

### 6.1 Google OAuth — Cập nhật Redirect URI

Vào [Google Cloud Console](https://console.cloud.google.com) → **APIs & Services → Credentials → OAuth 2.0 Client IDs**:

Thêm vào **Authorized redirect URIs**:
```
https://your-app.vercel.app/api/auth/callback/google
```

Nếu dùng custom domain, thêm cả:
```
https://yourdomain.com/api/auth/callback/google
```

### 6.2 Resend — Cấu hình domain

1. Vào [resend.com](https://resend.com) → **Domains → Add Domain**
2. Thêm DNS record theo hướng dẫn (DKIM, SPF)
3. Cập nhật `RESEND_FROM_EMAIL` thành email thuộc domain đã verify

### 6.3 Custom Domain trên Vercel (nếu có)

1. **Vercel Dashboard → Project → Settings → Domains**
2. Thêm domain của bạn
3. Cập nhật DNS tại nhà cung cấp domain:
   - `A record`: `@` → `76.76.21.21`
   - `CNAME`: `www` → `cname.vercel-dns.com`
4. Nhớ cập nhật lại `BETTER_AUTH_URL` thành domain mới → Redeploy

---

## Bước 7 — Kiểm tra sau Deploy

### Checklist cơ bản

- [ ] Truy cập được URL Vercel, trang login hiển thị
- [ ] Đăng nhập bằng Google OAuth thành công
- [ ] Tạo thử 1 contact/lead mới → lưu vào DB
- [ ] Upload 1 file trong module Documents → file xuất hiện trong Supabase Storage
- [ ] Gửi email test (nếu đã cấu hình Resend)

### Kiểm tra logs nếu có lỗi

```
Vercel Dashboard → Project → Deployments → [deployment] → Functions → View Logs
```

### Lỗi thường gặp

| Lỗi | Nguyên nhân | Fix |
|-----|-------------|-----|
| `MINIO_ENDPOINT is not defined` | Thiếu env var | Thêm đủ 5 biến MINIO_* |
| `BETTER_AUTH_SECRET is not defined` | Thiếu secret | Generate và thêm vào Vercel |
| `PrismaClientInitializationError` | Sai DATABASE_URL | Kiểm tra dùng Transaction pooler URL |
| `OAuth redirect_uri_mismatch` | Chưa cập nhật Google Console | Thêm redirect URI mới |
| Ảnh không load | Thiếu hostname trong `next.config.js` | Thêm `[PROJECT-REF].supabase.co` vào `remotePatterns` |

---

## Tóm tắt toàn bộ

```
✅ Bước 1: Bỏ output:"standalone" trong next.config.js
✅ Bước 2: Tạo Supabase project → lấy DB URL + tạo bucket "nextcrm"
✅ Bước 3: npx prisma migrate deploy (từ máy local)
✅ Bước 4: Import repo lên Vercel
✅ Bước 5: Điền đủ env vars trong Vercel Dashboard → Redeploy
✅ Bước 6: Cập nhật Google OAuth redirect URI
✅ Bước 7: Test các tính năng chính
```

---

## Tham khảo

- [Vercel Documentation](https://vercel.com/docs)
- [Supabase + Prisma Guide](https://supabase.com/docs/guides/integrations/prisma)
- [Supabase Storage S3 API](https://supabase.com/docs/guides/storage/s3/authentication)
- [Better Auth Documentation](https://www.better-auth.com/docs)
- [Resend Documentation](https://resend.com/docs)
