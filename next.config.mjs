/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', // 정적 빌드 (Capacitor용)
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Capacitor를 위한 trailing slash
  trailingSlash: true,
}

export default nextConfig;
