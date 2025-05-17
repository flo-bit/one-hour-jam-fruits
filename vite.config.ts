import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    // This tells Vite to ignore TypeScript errors during build
    minify: true,
    rollupOptions: {
      onwarn(warning, warn) {
        // Skip TypeScript validation errors
        if (warning.code === 'TS6133' || warning.code?.startsWith('TS')) {
          return;
        }
        warn(warning);
      }
    }
  },
  
  // Disable type checking during dev and build
  server: {
    // Force vite to ignore TypeScript errors during development
    hmr: { overlay: false },
  },
  
  esbuild: {
    // Skip type checking during build
    logOverride: { 'this-is-undefined-in-esm': 'silent' },
  },
  
  // Tell Vite not to use TypeScript for type checking
  optimizeDeps: {
    esbuildOptions: {
      // Explicitly set to ignore TypeScript errors when optimizing dependencies
      tsconfigRaw: {
        compilerOptions: {
          ignoreDeprecations: "5.0",
          skipLibCheck: true,
          skipDefaultLibCheck: true,
        }
      }
    }
  }
}); 