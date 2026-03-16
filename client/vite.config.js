import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import Inspect from 'vite-plugin-inspect';
import { visualizer } from 'rollup-plugin-visualizer';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

// https://vitejs.dev/config/
export default defineConfig({
  base: '/',
  define: {
    global: 'window',
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@components': path.resolve(__dirname, 'src/components'),
      '@pages': path.resolve(__dirname, 'src/pages'),
      '@forms': path.resolve(__dirname, 'src/forms'),
      '@hooks': path.resolve(__dirname, 'src/hooks'),
      '@context': path.resolve(__dirname, 'src/context'),
      '@utils': path.resolve(__dirname, 'src/utils'),
      '@styles': path.resolve(__dirname, 'src/styles'),
      '@helper': path.resolve(__dirname, 'src/helper.js'),
      '@features': path.resolve(__dirname, 'src/features'),
    },
  },
  plugins: [
    react(),
    Inspect(),
    visualizer({ open: true }), // Visualizer opens automatically after build
  ],
  build: {
    target: 'esnext', // Target modern browsers for tree shaking
  },
  server: {
    proxy: {
      '/api': {
        target: process.env.RAILWAY_PUBLIC_DOMAIN || 'http://127.0.0.1:5555',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
