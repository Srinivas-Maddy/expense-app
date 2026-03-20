import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@expense-app/shared"],
  output: "standalone",
  outputFileTracingRoot: require("path").join(__dirname, "../../"),
};

export default nextConfig;
