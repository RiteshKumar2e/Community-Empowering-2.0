import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Same COOP value vercel.json sends in production, so the Google Sign-In popup
// can post its credential back to this window during local development too.
const headers = { 'Cross-Origin-Opener-Policy': 'same-origin-allow-popups' }

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    headers,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      }
    }
  },
  preview: {
    headers,
  },
  build: {
    outDir: 'dist',
    // Public source maps would publish the full original source code
    sourcemap: false,
    // Read by scripts/prerender.mjs to link each page's CSS; deleted afterwards.
    manifest: true,
  }
})
