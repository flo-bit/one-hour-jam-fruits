import { defineConfig } from 'vite';

export default defineConfig({
  // Set base path for GitHub Pages
  base: '/one-hour-jam-fruits/',
  
  // Disable type checking during build
  build: {
    // These settings help make Vite ignore TypeScript errors during build
    minify: true,
    sourcemap: false,
    reportCompressedSize: false
  },
  
  // Disable type checking overlay during development
  server: {
    hmr: { overlay: false }
  }
}); 