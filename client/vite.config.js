import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      'framer-motion': path.resolve(__dirname, '../node_modules/framer-motion/dist/cjs/index.js'),
      'react-hook-form': path.resolve(__dirname, '../node_modules/react-hook-form/dist/index.cjs.js'),
      '@hookform/resolvers/zod': path.resolve(__dirname, '../node_modules/@hookform/resolvers/zod/dist/zod.module.js'),
      '@hookform/resolvers': path.resolve(__dirname, '../node_modules/@hookform/resolvers/dist/resolvers.module.js'),
    },
  },
  server: {
    port: 5173,
    host: 'localhost',
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:5000',
        changeOrigin: true,
      },
      '/uploads': {
        target: 'http://127.0.0.1:5000',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
});
