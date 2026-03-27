// @ts-check
import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  site: "https://pdf.oriz.in",
  output: "static",
  integrations: [
    react(),
    mdx(),
    sitemap({
      changefreq: "monthly",
      priority: 0.7,
      lastmod: new Date(),
      serialize(item) {
        if (item.url.includes("/tools/")) {
          item.changefreq = "monthly";
          item.priority = 0.9;
        }
        if (item.url.includes("/blog/")) {
          item.changefreq = "yearly";
          item.priority = 0.7;
        }
        return item;
      },
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
    optimizeDeps: {
      exclude: ["pdfjs-dist"],
    },
    ssr: {
      noExternal: ["framer-motion"],
    },
  },
});
