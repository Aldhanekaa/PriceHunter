import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { viteStaticCopy } from "vite-plugin-static-copy";
import tailwindcss from "@tailwindcss/vite";
import { resolve } from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
    viteStaticCopy({
      targets: [
        {
          src: "public/manifest.json",
          dest: ".",
        },
        {
          src: "public/background.js",
          dest: ".",
        },
      ],
    }),
  ],
  build: {
    outDir: "build",
    emptyOutDir: true,
    sourcemap: true,
    rollupOptions: {
      input: {
        popup: resolve(__dirname, "./index.html"),
        background: resolve(__dirname, "src/background.ts"),
      },

      output: {
        entryFileNames: (chunk) => {
          console.log("chunk", chunk);
          if (chunk.name === "background") return "assets/background.js";
          return "assets/[name].js";
        },
      },
    },
  },
});
