/**
 * Build script for BEAMS Creative
 * Builds each entry point as a separate IIFE bundle
 */

import { build } from 'vite';
import { rmSync, existsSync, mkdirSync, copyFileSync, readdirSync } from 'fs';
import { resolve, dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// All entry points to build
const entries = [
  { name: 'global', input: 'src/global.js' },
  { name: 'home', input: 'src/pages/home.js' },
  { name: 'works', input: 'src/pages/works.js' },
  { name: 'works-detail', input: 'src/pages/works-detail.js' },
  { name: 'works-category', input: 'src/pages/works-category.js' },
  { name: 'about', input: 'src/pages/about.js' },
  { name: 'insight', input: 'src/pages/insight.js' },
  { name: 'insight-detail', input: 'src/pages/insight-detail.js' }
];

async function buildAll() {
  console.log('🏗️  Building BEAMS Creative scripts...\n');

  const distPath = resolve(__dirname, 'dist');
  const tempPath = resolve(__dirname, '.temp-build');

  // Clear dist folder
  if (existsSync(distPath)) {
    rmSync(distPath, { recursive: true });
  }
  mkdirSync(distPath, { recursive: true });
  console.log('📁 Prepared dist/ folder\n');

  // Build each entry
  for (const entry of entries) {
    console.log(`📦 Building ${entry.name}.min.js...`);
    
    // Clear temp folder for each build
    if (existsSync(tempPath)) {
      rmSync(tempPath, { recursive: true });
    }

    try {
      await build({
        configFile: false,
        root: __dirname,
        build: {
          outDir: '.temp-build',
          emptyDirBeforeWrite: true,
          minify: 'terser',
          terserOptions: {
            compress: {
              drop_console: false,
              drop_debugger: true
            }
          },
          rollupOptions: {
            input: resolve(__dirname, entry.input),
            output: {
              format: 'iife',
              name: `BEAMS_${entry.name.replace(/-/g, '_')}`,
              entryFileNames: `${entry.name}.min.js`,
              inlineDynamicImports: true
            }
          }
        },
        logLevel: 'silent'
      });

      // Copy the built file to dist
      const builtFiles = readdirSync(tempPath).filter(f => f.endsWith('.js'));
      for (const file of builtFiles) {
        copyFileSync(join(tempPath, file), join(distPath, file));
      }

      console.log(`   ✅ ${entry.name}.min.js built successfully`);
    } catch (error) {
      console.error(`   ❌ Error building ${entry.name}:`, error.message);
      process.exit(1);
    }
  }

  // Clean up temp folder
  if (existsSync(tempPath)) {
    rmSync(tempPath, { recursive: true });
  }

  console.log('\n✨ All builds completed successfully!');
  console.log('\nOutput files in dist/:');
  entries.forEach(entry => console.log(`  - ${entry.name}.min.js`));
}

buildAll().catch(console.error);
