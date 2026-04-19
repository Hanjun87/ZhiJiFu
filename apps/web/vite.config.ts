import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig(() => {
  const proxyTarget = process.env.VITE_DEV_PROXY_TARGET || 'http://localhost:8788';
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      port: 3001,
      host: '0.0.0.0',
      strictPort: true,
      hmr: {
        protocol: 'ws',
        host: 'localhost',
        port: 3001,
        clientPort: 3001,
      },
      proxy: {
        '/api': {
          target: proxyTarget,
          changeOrigin: true,
          // 支持流式响应 (SSE)
          configure: (proxy, _options) => {
            proxy.on('error', (err, _req, _res) => {
              console.log('proxy error', err);
            });
            proxy.on('proxyReq', (proxyReq, req, _res) => {
              console.log('Sending Request to the Target:', req.method, req.url);
            });
            proxy.on('proxyRes', (proxyRes, req, _res) => {
              console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
            });
          },
        },
      },
    },
  };
});
