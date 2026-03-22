/** @type {import('next').NextConfig} */
const nextConfig = {
  // Capacitor 빌드 시에만 static export 활성화
  // npm run build:mobile 또는 NEXT_EXPORT=true npm run build
  ...(process.env.NEXT_EXPORT === 'true' ? { output: 'export' } : {}),
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig;
