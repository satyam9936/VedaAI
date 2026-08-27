import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@vedaai/types': path.resolve(__dirname, '../../packages/types/src/index.ts'),
      '@vedaai/ai-engine': path.resolve(__dirname, '../../packages/ai-engine/src/index.ts'),
      '@vedaai/ui': path.resolve(__dirname, '../../packages/ui/src/index.tsx'),
    },
  },
  server: {
    port: 5173,
    host: true
  }
});
