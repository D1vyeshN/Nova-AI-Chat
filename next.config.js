import withPWA from 'next-pwa'

const nextConfig = {
  reactStrictMode: true,
  turbopack: {}, // Empty turbopack config to silence the error
}

export default withPWA({
  dest: 'public',
  register: true,
  skipWaiting: true,
  // disable: process.env.NODE_ENV === 'development',
})(nextConfig)
