import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
    build: {
      target: 'esnext',
      sourcemap: false,
      chunkSizeWarningLimit: 600,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              // 1. Core React UI Runtime
              if (
                id.includes('/react/') ||
                id.includes('/react-dom/') ||
                id.includes('/scheduler/')
              ) {
                return 'vendor-react';
              }
              // 2. Heavy Data Visualization & D3 / Recharts engines
              if (
                id.includes('/recharts/') ||
                id.includes('/d3') ||
                id.includes('/victory-vendor/')
              ) {
                return 'vendor-charts';
              }
              // 3. Iconography (Lucide)
              if (id.includes('/lucide-react/')) {
                return 'vendor-icons';
              }
              // 4. Motion / Framer Animations
              if (id.includes('/motion/') || id.includes('/framer-motion/')) {
                return 'vendor-motion';
              }
              // 5. PDF & Canvas Export Engine (isolated from initial critical path)
              if (
                id.includes('/jspdf/') ||
                id.includes('/html-to-image/') ||
                id.includes('/canvas-confetti/')
              ) {
                return 'vendor-export';
              }
              // 6. Geospatial & TopoJSON maritime maps
              if (
                id.includes('/topojson-client/') ||
                id.includes('/world-atlas/')
              ) {
                return 'vendor-geo';
              }
              // 7. Firebase Auth & Firestore client
              if (
                id.includes('/firebase/') ||
                id.includes('/@firebase/')
              ) {
                return 'vendor-firebase';
              }
            }
          },
        },
      },
    },
  };
});
