import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    // Exclude lucide-react from optimization (if needed)
    exclude: ['lucide-react'],
  },
  build: {
    rollupOptions: {
      // Ensure your custom icon component is not treated as external
      external: [
        // Add any truly external dependencies here
        // Don't include local components like NepaliRupeeIcon
      ],
    },
  },
  resolve: {
    alias: {
      // Set up path aliases for cleaner imports
      '@': '/src',
      '@components': '/src/components',
    },
  },
});
