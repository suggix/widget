import { defineConfig } from 'tsup';

export default defineConfig([
  // ESM & CJS builds for npm package
  {
    entry: {
      index: 'src/index.ts',
    },
    format: ['esm', 'cjs'],
    dts: true,
    clean: true,
    sourcemap: true,
    minify: false,
    treeshake: true,
    target: 'es2020',
  },
  // Standalone IIFE bundle for CDN & <script> tag usage (dist/widget.js)
  {
    entry: {
      widget: 'src/loader.ts',
    },
    format: ['iife'],
    globalName: 'Suggix',
    sourcemap: true,
    minify: true,
    treeshake: true,
    target: 'es2020',
    outExtension() {
      return {
        js: '.js',
      };
    },
  },
]);
