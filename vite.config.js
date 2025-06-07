import { defineConfig } from 'vite'

export default defineConfig({
  base: process.env.NODE_ENV === 'production' ? '/plane_shooting_cursor/' : '/',
  root: '.',
  server: {
    port: 3000,
    open: true,
    host: true
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      input: {
        main: './index.html'
      }
    }
  },
  assetsInclude: ['**/*.mp3', '**/*.wav', '**/*.ogg'],
  optimizeDeps: {
    include: ['three']
  }
}) 