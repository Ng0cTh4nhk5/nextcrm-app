# KẾ HOẠCH RÀ SOÁT HỆ THỐNG CBEC (nextcrm-app)

> Tạo ngày: 2026-07-16 | Người thực hiện: Senior Software Engineer (AI Agent)

---

## 1. KIẾN TRÚC HỆ THỐNG

### 1.1 Tổng quan

**CBEC** là một hệ thống CRM được xây dựng trên nền tảng **Next.js 15 (App Router)**. Ứng dụng kế thừa từ dự án NextCRM và đã được tùy chỉnh để loại bỏ các tính năng không cần thiết (Campaign emails, AI enrichment, LLM keys). Sản phẩm đang trong giai đoạn chuẩn bị triển khai lên Vercel với Supabase (PostgreSQL).

**Tên thương hiệu:** CBEC | **Phiên bản:** 0.0.3-beta | **Ngôn ngữ:** TypeScript

### 1.2 Luồng dữ liệu chính

```
Browser (Client Components)
    │
    ├── next-intl (i18n routing)
    │
    ▼
[locale]/layout.tsx  ─── Server Components ─── better-auth session check
    │
    ├── /app/[locale]/(auth)/     → Trang đăng nhập/đăng ký
    ├── /app/[locale]/(routes)/   → Dashboard, CRM, Projects, Documents, Invoices
    │
    ▼
Server Actions (/actions/**)    ─── Prisma ORM ──► Supabase PostgreSQL
API Routes (/app/api/**)        └── Better Auth Session
    │
    └── Middleware (/middleware.ts) → Route protection (auth + locale)
```

### 1.3 Công nghệ sử dụng

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15.x (App Router) |
| Authentication | Better Auth + adminPlugin |
| Database ORM | Prisma 6.x với `@prisma/adapter-pg` |
| Database | PostgreSQL (Supabase) |
| Storage | MinIO/S3-compatible (Supabase Storage) |
| i18n | next-intl |
| Background Jobs | Inngest |
| UI | shadcn/ui + Tailwind CSS |

### 1.4 Cấu trúc thư mục quan trọng

```
nextcrm-app/
├── app/
│   ├── api/
│   │   ├── admin/invoices/{series,tax-rates}  → Admin API (protected)
│   │   ├── auth/[...all]                      → Better Auth handler
│   │   ├── campaigns/targets                  → Campaign targets
│   │   ├── crm/contacts/[id]                  → Contact PATCH
│   │   ├── crm/contacts/enrich{,-bulk}        → Enrichment stubs (disabled)
│   │   ├── crm/leads, targets                 → CRM data APIs
│   │   ├── dev/seed-admin                     → Dev-only seeder (⚠️)
│   │   ├── invoices/[invoiceId]/pdf            → PDF download
│   │   ├── reports/export                     → CSV/PDF export
│   │   └── upload/presigned-url               → Storage upload
│   └── [locale]/
│       ├── (auth)/                            → Public auth pages
│       └── (routes)/                          → Protected app pages
├── actions/                                   → Server Actions ("use server")
├── lib/
│   ├── auth.ts                                → Better Auth config
│   ├── auth-server.ts                         → getSession() helper
│   ├── auth-guards.ts                         → requireOwnerOrAdmin()
│   ├── authz/                                 → Authorization system
│   │   ├── index.ts                           → Barrel exports
│   │   ├── session.ts                         → requireAuthenticated()
│   │   ├── roles.ts                           → AppRole definition
│   │   ├── errors.ts                          → AuthenticationError, AuthorizationError
│   │   └── scopes/crm.ts                      → CRM scope guards
│   └── prisma.ts                              → Prisma client singleton
├── prisma/schema.prisma                       → 1911 dòng schema
└── supabase/migrations/                       → SQL migrations
```

---

## 2. NỘI DUNG DỰ KIẾN KIỂM TRA

### 2.1 Lỗi biên dịch (Build-breaking)

- [ ] Kiểm tra TypeScript strict mode trong tsconfig.json
- [ ] Kiểm tra các import bị lỗi sau khi xóa modules (Campaign, AI, LLM)
- [ ] Kiểm tra `datasource db` trong schema.prisma có `url = env("DATABASE_URL")` không
- [ ] Kiểm tra `DIRECT_URL` cho Supabase với pgBouncer (connection pooler)
- [ ] Kiểm tra các pages/components có sử dụng modules đã bị xóa không
- [ ] Chạy `npm run build` để xác minh trạng thái biên dịch thực tế

### 2.2 Lỗi bảo mật

- [ ] Rà soát toàn bộ API routes — kiểm tra xem có route nào thiếu auth guard
- [ ] Đặc biệt kiểm tra `/api/dev/seed-admin` — route DEV-ONLY nguy hiểm
- [ ] Kiểm tra việc lộ secrets/keys trong client components
- [ ] Kiểm tra `NEXT_PUBLIC_*` variables không chứa secrets
- [ ] Rà soát cấu hình RLS trong supabase/migrations

### 2.3 Lỗi xác thực người dùng (Better Auth)

- [ ] Kiểm tra middleware route protection
- [ ] Kiểm tra `getSession()` được gọi đúng trong Server Components và API Routes
- [ ] Kiểm tra `requireAuthenticated()` vs truy cập DB trực tiếp bằng Prisma
- [ ] Kiểm tra callback `onUserCreated` - race condition với count()

### 2.4 Hiệu năng Prisma

- [ ] Kiểm tra N+1 queries trong các server actions
- [ ] Kiểm tra `getCampaigns` thiếu `where` và `select` (full table scan)
- [ ] Kiểm tra các query không có index tương ứng trong schema
- [ ] Kiểm tra Prisma datasource — thiếu `directUrl` cho Supabase

### 2.5 Mã nguồn dư thừa

- [ ] Kiểm tra `actions/campaigns/` — có còn dùng hay đã disabled
- [ ] Kiểm tra `lib/campaigns/merge-tags.ts` — còn được import không
- [ ] Kiểm tra `emails/` directory — resend đã bị xóa
- [ ] Kiểm tra `app/[locale]/globals.css.bck` — backup file không nên commit
- [ ] Kiểm tra `ApiKeys` model trong schema — OPENAI, FIRECRAWL, ANTHROPIC, GROQ đã xóa khỏi UI?

---

## 3. PHƯƠNG PHÁP KIỂM TRA

1. **Static analysis**: Đọc mã nguồn và so sánh với các mẫu lỗi đã biết
2. **Build verification**: Chạy `npm run build` để phát hiện lỗi TypeScript và Next.js compile-time
3. **Dependency trace**: Theo dõi các import từ file bị xóa
4. **Security audit**: Kiểm tra từng API route handler theo checklist

---

## 4. ƯU TIÊN SỬA LỖI

1. 🔴 **Critical**: Build-breaking errors → phải sửa trước khi deploy
2. 🔴 **Critical**: Security issues → bảo mật hệ thống
3. 🟡 **High**: Auth issues → ảnh hưởng trải nghiệm người dùng
4. 🟢 **Medium**: Performance issues → tối ưu hóa
5. ⚪ **Low**: Dead code cleanup → dọn dẹp

---

*Tài liệu này sẽ được cập nhật sau khi hoàn thành mỗi giai đoạn rà soát.*
