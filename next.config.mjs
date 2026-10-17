/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          // Force HTTPS for a year (preload-ready). Kills SSL-stripping.
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains",
          },
          // Never render the site inside someone else's frame (clickjacking).
          { key: "X-Frame-Options", value: "DENY" },
          // Stop MIME-sniffing attacks.
          { key: "X-Content-Type-Options", value: "nosniff" },
          // Don't leak full URLs to third parties.
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
