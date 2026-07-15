const withNextIntl = require("next-intl/plugin")(
  "./i18n/request.ts"
);

/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ["pdf-parse", "pdfjs-dist"],
  images: {
    remotePatterns: [
      // Local development
      { protocol: "http", hostname: "localhost" },
      { protocol: "https", hostname: "localhost" },
      // Google (avatars OAuth)
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      // Cloudinary (nếu có dùng)
      { protocol: "https", hostname: "res.cloudinary.com" },
      // Supabase Storage (thay MinIO)
      { protocol: "https", hostname: "bysnemsdhbjeezkqppwp.supabase.co" },
    ],
  },
  experimental: {
    workerThreads: false,
    cpus: 1,
  },
  async redirects() {
    return [
      {
        source: "/:locale/crm/targets/:path*",
        destination: "/:locale/campaigns/targets/:path*",
        permanent: true,
      },
      {
        source: "/:locale/crm/target-lists/:path*",
        destination: "/:locale/campaigns/target-lists/:path*",
        permanent: true,
      },
    ];
  },
};

module.exports = withNextIntl(nextConfig);
