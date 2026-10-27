import { defineConfig } from 'vite';
import preact from '@preact/preset-vite';

export default defineConfig({
  plugins: [preact()],
  // Relative asset paths: works on a custom domain, a GitHub Pages project path
  // (user.github.io/repo/) and Netlify alike.
  base: "./",
  resolve: {
    // Same "@/..." import style as the main site
    alias: { '@': '/src' },
  },
  build: {
    target: 'es2019',
  },
});
