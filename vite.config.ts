import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

/** Project Pages live at /chinese-culture-buds/ — local / Vercel keep `/`. */
const base = process.env.GITHUB_PAGES === 'true' ? '/chinese-culture-buds/' : '/';

export default defineConfig({
  base,
  plugins: [react()],
  build: {
    target: 'es2020',
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/react-dom') || id.includes('node_modules/react/')) {
            return 'react';
          }
          if (id.includes('node_modules/framer-motion')) {
            return 'motion';
          }
          if (id.includes('node_modules/howler')) {
            return 'howler';
          }
        },
      },
    },
  },
});
