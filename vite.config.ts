import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  return {
    plugins: [react()],
    server: {
      proxy: {
        "/api":
          // check value of FLASK_ENV instead of NODE_ENV
          // since the latter may impact other stuff
          env.FLASK_ENV === "testing"
            ? "http://localhost:5171"
            : "http://localhost:5172",
      },
    },
  };
});
