import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  base: './', // Important for Chrome Extensions
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    chunkSizeWarningLimit: 1000,
  },
  resolve: {
    alias: {
      // Ось цей рядок каже Vite, що символ '@' означає папку './src'
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
});
