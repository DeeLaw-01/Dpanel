import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  build: {
    // Hackathon-friendly build settings
    minify: 'esbuild', // Use esbuild instead of terser (faster and no extra deps)
    // Reduce build time
    sourcemap: false,
    // Allow larger chunks for faster builds
    chunkSizeWarningLimit: 1000
  },
  // Faster dev server
  server: {
    hmr: {
      overlay: false // Disable error overlay for minor issues
    }
  }
})
