import { defineConfig } from 'vite';
import { resolve } from 'path';

// Get entry name from environment variable
const entryName = process.env.ENTRY_NAME || 'global';

// Define all available entries
const entries = {
  global: resolve(__dirname, 'src/global.js'),
  home: resolve(__dirname, 'src/pages/home.js'),
  works: resolve(__dirname, 'src/pages/works.js'),
  'works-detail': resolve(__dirname, 'src/pages/works-detail.js'),
  'works-category': resolve(__dirname, 'src/pages/works-category.js'),
  about: resolve(__dirname, 'src/pages/about.js'),
  insight: resolve(__dirname, 'src/pages/insight.js'),
  'insight-detail': resolve(__dirname, 'src/pages/insight-detail.js')
};

export default defineConfig({
  build: {
    outDir: 'dist',
    emptyDirBeforeWrite: false,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: false,
        drop_debugger: true
      }
    },
    rollupOptions: {
      input: entries[entryName],
      output: {
        format: 'iife',
        name: `BEAMS_${entryName.replace(/-/g, '_')}`,
        entryFileNames: `${entryName}.min.js`,
        inlineDynamicImports: true
      }
    }
  },
  base: './'
});
