/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Включаем standalone режим для Docker
  output: 'standalone',
  // Настройки для работы с API Gateway
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://api-gateway:3000/api/:path*',
      },
    ];
  },
}

export default nextConfig
