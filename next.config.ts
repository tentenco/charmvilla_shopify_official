import type { NextConfig } from "next";

// Isolated checkout test build folders; ignored by Vercel. Tests never replace production product mappings.
const testBuild = !process.env.VERCEL && /^\.next\/test-(shopify|local)$/.test(process.env.CV_TEST_BUILD ?? "") ? process.env.CV_TEST_BUILD : null;

// The review project and this dedicated branch must never inherit live commerce.
const designPreview = process.env.CV_DESIGN_PREVIEW === "true" || process.env.VERCEL_GIT_COMMIT_REF === "design/museum-preview";

const nextConfig: NextConfig = {
  ...(designPreview ? { env: {
    NEXT_PUBLIC_DESIGN_PREVIEW: "true",
    NEXT_PUBLIC_COMMERCE_MODE: "local",
    NEXT_PUBLIC_ACCOUNTS_OPEN: "false",
    NEXT_PUBLIC_GA4_MEASUREMENT_ID: "",
    NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN: "",
  } } : {}),
  ...(testBuild ? { distDir: testBuild } : {}),
  devIndicators: false,
  // Retired product URLs, in both languages. English is unprefixed and Chinese lives under /zh (user 2026-10-13); the "/en" entries
  // only catch old links from before that change (src/proxy.ts then 308s /en/... to the unprefixed address).
  redirects: async () => ["", "/en", "/zh"].flatMap(prefix => [
    ...["rose-jinxuan", "lychee-ruby", "honey-oriental-beauty", "osmanthus-baozhong", "roselle-roasted-oolong"].map(flavor => ({ source: `${prefix}/products/goldfish-tea-${flavor}`, destination: `${prefix}/collections/tea`, permanent: true })),
    ...["goldfish-diamond-drop"].map(slug => ({ source: `${prefix}/products/${slug}`, destination: `${prefix}/products/diamond-goldfish-earrings`, permanent: true })),
    ...["goldfish-diamond-stud", "bezel-diamond-goldfish-earrings", "single-diamond-goldfish-earrings"].map(slug => ({ source: `${prefix}/products/${slug}`, destination: `${prefix}/products/diamond-goldfish-stud-earrings`, permanent: true })),
    // the coaster and the teaspoon are separate products (user 2026-10-02); the merged listing's address goes to the coasters
    { source: `${prefix}/collections/teaware`, destination: `${prefix}/collections/scents`, permanent: true },
    { source: `${prefix}/shopping-guide`, destination: `${prefix}/policy`, permanent: true }, // the Taiwan shopping guide became the US Shipping & Returns Policy (user's document 2026-10-07) // 茶器與工藝 split (user's Google Doc 2026-10-02)
    ...["christmas-edition-stocking", "christmas-edition-candy-cane"].map(slug => ({ source: `${prefix}/products/${slug}`, destination: `${prefix}/collections/tea`, permanent: true })), // removed (user 2026-10-05: 「聖誕節茶包都刪」)
    { source: `${prefix}/products/prosperity-stand-gift-box`, destination: `${prefix}/products/prosperity-dessert-stand`, permanent: true }, // one product on the official store (user 2026-10-05: 「照官網的」)
    { source: `${prefix}/products/wooden-coaster-teaspoon`, destination: `${prefix}/products/cloud-coaster`, permanent: true },
    { source: `${prefix}/news/monocle-interview`, destination: `${prefix}/news`, permanent: false }, // entry removed (user 2026-10-02: 「刪」)
  ]).concat(["", "/zh"].map(prefix => ({ source: `${prefix}/news/goldfish-in-a-cup-eslite-nanxi`, destination: `${prefix}/news/la-popup-scholart-selection-2026`, permanent: false }))), // eslite Nanxi entry replaced by the LA pop-up (client's answer A2, 2026-10-13)
  // Only the production domain may be indexed. Every other host (charmvilla-demo2.vercel.app, Vercel previews, localhost) gets
  // noindex on every response, pages and files alike; robots.txt stays Allow so crawlers can fetch the pages and see this header.
  // Done here rather than in src/proxy.ts because the proxy skips media, sitemap.xml and robots.txt, and the host test needs no code.
  headers: async () => [{
    source: "/:path*",
    missing: [{ type: "host", value: "(?:www\\.)?charmvilla\\.com" }],
    headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
  }],
  // 90 is used by the tall product-page image, which must stay crisp (user 2026-10-01)
  images: { formats: ["image/avif", "image/webp"], qualities: [75, 90] },
};

export default nextConfig;
