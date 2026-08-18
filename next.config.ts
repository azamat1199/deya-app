import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.join(__dirname),
  },
  images: {
    // Local placeholder illustrations (authored by us, not user-uploaded)
    // until real product/factory photography is supplied.
    dangerouslyAllowSVG: true,
    // next/image refuses any host not listed here. deya.uz is our own backend
    // and serves the uploads behind /api/v1/*, so the whole host is allowed
    // rather than guessing at a media prefix. Evaluated at build time, so a
    // per-environment host needs its own entry — this cannot read
    // NEXT_PUBLIC_API_URL.
    remotePatterns: [{ protocol: "https", hostname: "deya.uz" }],
  },
};

export default nextConfig;
