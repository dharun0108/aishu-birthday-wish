import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base: production build (GitHub Pages) is served from /aishu-birthday-wish/,
// local dev stays at /.
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/aishu-birthday-wish/' : '/',
  plugins: [react()],
  build: { chunkSizeWarningLimit: 1100 },
}));
