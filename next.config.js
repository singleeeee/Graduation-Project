/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // 构建时忽略 ESLint 错误（不影响开发时的提示）
    ignoreDuringBuilds: true,
  },
  typescript: {
    // 构建时忽略 TypeScript 类型错误
    ignoreBuildErrors: true,
  },
}

module.exports = nextConfig
