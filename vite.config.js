import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig({
  plugins: [react()],
  base: './',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  server: {
    port: 5173,
    open: false,
  },
  preview: {
    port: 4173,
    open: false,
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    target: 'es2020',
    rollupOptions: {
      input: path.resolve(__dirname, 'index.app.html'),
    },
  },
});
