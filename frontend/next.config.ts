import type { NextConfig } from "next";

// The browser only ever talks to the frontend's own origin — the Next server
// forwards /api and /uploads to the backend over the internal Docker network.
// That keeps the deployment working behind a single reverse proxy (only the
// frontend needs to be publicly reachable) and sidesteps CORS entirely.
//
// Next bakes rewrites into the build output, so this is read at build time and
// passed as a build arg from docker-compose — not at runtime.
const BACKEND_URL = (
  process.env.BACKEND_INTERNAL_URL || "http://backend:5030"
).replace(/\/+$/, "");

const nextConfig: NextConfig = {
  output: "standalone",
  async rewrites() {
    return [
      { source: "/api/:path*", destination: `${BACKEND_URL}/api/:path*` },
      { source: "/uploads/:path*", destination: `${BACKEND_URL}/uploads/:path*` },
    ];
  },
};

export default nextConfig;
