/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  experimental: {
    serverComponentsExternalPackages: ['@whiskeysockets/baileys', 'pino', 'qrcode'],
    outputFileTracingIncludes: {
      '/**': ['./prisma/dev.db'],
    },
  },
}

module.exports = nextConfig
