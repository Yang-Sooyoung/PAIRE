/** @type {import('next').NextConfig} */
const nextConfig = {
  // output: 'export', // 개발/프로덕션에서는 제거 (Capacitor 빌드 시에만 사용)
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig;
