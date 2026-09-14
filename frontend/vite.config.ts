import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    proxy: {
      // Backend Spring Boot chạy ở http://localhost:8080
      '/api': { target: 'http://localhost:8080', changeOrigin: true },
    },
  },
});
