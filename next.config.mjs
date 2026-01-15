/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Disable ESLint during build - causing serialization errors
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
