import { withWhopAppConfig } from "@whop/react/next.config";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    optimizeCss: false,
  },
  images: {
    remotePatterns: [{ hostname: "**" }],
  },
};

export default withWhopAppConfig(nextConfig);
