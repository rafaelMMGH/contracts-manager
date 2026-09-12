/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3001', '192.168.100.162:3001'],
    },
  },
}

module.exports = nextConfig
