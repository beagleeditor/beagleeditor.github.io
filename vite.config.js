import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/',
  plugins: [
    react(),
    {
      name: 'legacy-html-spa-fallback',
      configureServer(server) {
        const appRoutes = new Set([
          '/index.html',
          '/features.html',
          '/download.html',
          '/screenshots.html',
          '/roadmap.html',
          '/docs.html',
          '/test.html',
          '/404.html',
        ])
        server.middlewares.use((req, _res, next) => {
          if (req.method === 'GET' && appRoutes.has(new URL(req.url, 'http://localhost').pathname)) {
            req.url = '/index.html'
          }
          next()
        })
      },
    },
  ],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    assetsDir: 'static',
  },
})
