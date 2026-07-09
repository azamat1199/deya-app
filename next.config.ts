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
  },
};

export default nextConfig;
