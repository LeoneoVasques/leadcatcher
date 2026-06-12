/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: [],
  // Permitir acesso do túnel no modo DEV
  experimental: {
    allowedDevOrigins: ['97676c02e9c8fb.lhr.life']
  }
};

export default nextConfig;
