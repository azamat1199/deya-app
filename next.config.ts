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
    // next/image refuses any src that matches no entry here. Narrowed to the
    // upload prefix the API actually serves, so a stray absolute URL pointing
    // anywhere else on the host fails at render instead of being proxied.
    //
    // https ONLY, deliberately. The backend currently stamps its media URLs
    // with http:// (it sits behind a TLS-terminating proxy that does not set
    // X-Forwarded-Proto), and src/lib/api.ts rewrites them on the way in. An
    // http entry here would accept the un-rewritten ones and let the browser
    // block them as mixed content — silently, at runtime — instead of failing
    // loudly at build.
    //
    // Evaluated at build time, so a per-environment host needs its own entry:
    // this cannot read NEXT_PUBLIC_API_URL.
    remotePatterns: [
      { protocol: "https", hostname: "deya.uz", pathname: "/media/**" },
    ],
  },
};

export default nextConfig;
