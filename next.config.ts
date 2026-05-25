import type { NextConfig } from "next";

const config: NextConfig = {
  output: "standalone",
  reactStrictMode: true,
  poweredByHeader: false,
  // typedRoutes disabled: races with standalone-mode manifest copy on
  // Windows builds (PageNotFoundError during page-data collection).
  // We don't depend on its type safety today; reenable if Link href
  // typing becomes load-bearing.
  typedRoutes: false,
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "media.rutgertuit.nl",
      },
      {
        protocol: "https",
        hostname: "storage.googleapis.com",
        pathname: "/rutgertuit-media/**",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
  async redirects() {
    return [
      // The video-models article was originally shipped as /creative/briefing-inversion.
      // Keep the old URL alive for anyone who linked to it during the early hours.
      {
        source: "/creative/briefing-inversion",
        destination: "/creative/video-models",
        permanent: true,
      },
    ];
  },
};

export default config;
