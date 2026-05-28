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
    // CSP tuned to the site's real sources: same-origin assets + audio/video,
    // YouTube (no-cookie) embeds, the same-origin boardroom-game iframe, and
    // next/image remote patterns. 'unsafe-inline' is required for Next's
    // hydration scripts and inline styles (no nonce pipeline yet) — tighten
    // toward nonces later. The Gemini/Resend calls happen server-side, so the
    // browser only ever connects to 'self'.
    const csp = [
      "default-src 'self'",
      "base-uri 'self'",
      "form-action 'self'",
      "object-src 'none'",
      "frame-ancestors 'self'",
      "script-src 'self' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https:",
      "font-src 'self' data:",
      "media-src 'self' https:",
      "frame-src 'self' https://www.youtube-nocookie.com https://www.youtube.com",
      "connect-src 'self'",
    ].join("; ");
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Content-Security-Policy", value: csp },
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
