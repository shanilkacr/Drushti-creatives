import { withPayload } from "@payloadcms/next/withPayload";

function r2RemotePattern() {
  const publicUrl = process.env.R2_PUBLIC_URL;
  if (!publicUrl) return null;
  try {
    const { protocol, hostname } = new URL(publicUrl);
    return {
      protocol: protocol.replace(":", ""),
      hostname,
    };
  } catch {
    return null;
  }
}

const r2Pattern = r2RemotePattern();

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    qualities: [75, 85, 90],
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      ...(r2Pattern ? [r2Pattern] : []),
    ],
  },
  async redirects() {
    return [
      // Only redirect portfolio slugs — skip static assets in public/work/
      // (e.g. drushtiwhitecopy-trimmed.png) which include a file extension.
      {
        source: "/work/:slug((?!.*\\.).+)",
        destination: "/portfolio/:slug",
        permanent: true,
      },
    ];
  },
};

export default withPayload(nextConfig);
