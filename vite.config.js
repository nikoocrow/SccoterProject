import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    target: 'es2022',
    rolldownOptions: {
      output: {
        // Long-cached vendor chunks so app changes don't bust them. React stays separate
        // so the UI never waits on the lazy-loaded three.js chunk.
        advancedChunks: {
          groups: [
            { name: 'react', test: /node_modules[\\/](react|react-dom|scheduler)[\\/]/, priority: 2 },
            { name: 'three', test: /node_modules[\\/](three|three-stdlib|@react-three|@monogrid)[\\/]/, priority: 1 },
          ],
        },
      },
    },
    // The three.js chunk is inherently large (~0.9 MB min, ~250 KB gzip) and is lazy-loaded.
    chunkSizeWarningLimit: 1000,
  },
})
