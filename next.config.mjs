/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: { remotePatterns: [{ protocol: 'https', hostname: 'images.unsplash.com' }] },
  // sql.js Node tomonda WASM yuklaydi — webpack uni bundle qilmasin
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = config.externals || [];
      config.externals.push('sql.js');
    }
    return config;
  },
};
export default nextConfig;
