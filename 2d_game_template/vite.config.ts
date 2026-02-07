import { defineConfig } from 'vite';

export default defineConfig({
  base: '/dev/2d_game_template/',
  server: {
    port: 5179,
    strictPort: true,
    host: true,
  },
  publicDir: 'assets',
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
});
