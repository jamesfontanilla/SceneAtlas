/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    typedRoutes: true
  },
  transpilePackages: ["@sceneatlas/shared", "@sceneatlas/db"]
};

export default nextConfig;
