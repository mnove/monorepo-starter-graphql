import path from "node:path";
import { defineConfig, loadEnv } from "vite";
import viteReact from "@vitejs/plugin-react";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
import { resolve } from "node:path";
import tailwindcss from "@tailwindcss/vite";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load environment variables based on the current mode
  const env = loadEnv(mode, process.cwd(), "");

  console.log("Vite building with environment:", mode);
  console.log("Server URL:", env.VITE_SERVER_URL || "Not defined");

  return {
    plugins: [
      TanStackRouterVite({ target: "react", autoCodeSplitting: true }),
      viteReact(),
      tailwindcss(),
    ],
    preview: {
      port: 5173,
    },
    test: {
      globals: true,
      environment: "jsdom",
    },
    resolve: {
      alias: {
        "@": resolve(__dirname, "./src"),
        "@components": path.resolve(__dirname, "./src/components"),
      },
    },
    define: {
      "import.meta.env.VITE_SERVER_URL": JSON.stringify(
        env.VITE_SERVER_URL || "http://localhost:5001/graphql"
      ),
    },
  };
});
