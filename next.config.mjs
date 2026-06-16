/** @type {import('next').NextConfig} */
const nextConfig = {
  // Lint poganjaj ločeno (`npm run lint`); naj ne blokira produkcijskega builda.
  eslint: { ignoreDuringBuilds: true },
  images: {
    // Dovoli slike iz Vercel Blob in (po želji) Cloudinary CDN-ja.
    remotePatterns: [
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com" },
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
};

export default nextConfig;
