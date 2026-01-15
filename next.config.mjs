/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Disable ESLint during build completely
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Skip type checking during build if needed
    tsc: true,
  },
};

export default nextConfig;
