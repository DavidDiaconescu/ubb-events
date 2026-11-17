import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  experimental: {
    instantInsights: {
      // The pages are rendered only in the browser, after AppShell has loaded the data from the backend,
      // so the server never renders them and the default validation reports every route as "dropped".
      // Validate only the segments that opt in explicitly with `export const instant = true`.
      validationLevel: "manual-warning",
    },
  },
  images: {
    // Generic event photos used on the home page.
    // Object form, because Unsplash URLs carry crop/size query parameters (a URL pattern would forbid them).
    remotePatterns: [{ protocol: "https", hostname: "images.unsplash.com", pathname: "/**" }],
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
