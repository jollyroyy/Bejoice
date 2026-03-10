import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { compression } from 'vite-plugin-compression2'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),

    // Brotli + Gzip compress all JS/CSS at build time — skip already-compressed formats
    compression({ algorithm: 'brotliCompress', exclude: [/\.(webm|mp4|webp|jpg|jpeg|png)$/] }),
    compression({ algorithm: 'gzip',           exclude: [/\.(webm|mp4|webp|jpg|jpeg|png)$/] }),
  ],

  build: {
    target: 'esnext',
    minify: 'esbuild',
    cssCodeSplit: true,
    reportCompressedSize: false,

    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/react-dom')) return 'vendor-react-dom';
          if (id.includes('node_modules/react'))     return 'vendor-react';
          if (id.includes('node_modules/gsap'))      return 'vendor-gsap';
          if (id.includes('node_modules'))           return 'vendor';
        },
      },
    },
  },

  optimizeDeps: {
    include: ['react', 'react-dom'],
  },

  server: {
    headers: {
      // Hint browser to preload video alongside HTML
      'Link': '</hero-poster.webp>; rel=preload; as=image, </hero.webm>; rel=preload; as=fetch',
    },
  },
})
