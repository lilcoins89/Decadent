import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';
import { defineConfig, loadEnv, type Plugin } from 'vite';
import { getHeliusErrorMessage, getHeliusPortfolio } from './src/server/helius';

function heliusApi(): Plugin {
  return {
    name: 'decadent-helius-api',
    configureServer(server) {
      server.middlewares.use('/api/helius/portfolio', async (req, res) => {
        res.setHeader('content-type', 'application/json');
        const address = new URL(req.url ?? '/', 'http://localhost').searchParams.get('address');
        if (!address) {
          res.statusCode = 400;
          res.end(JSON.stringify({ error: 'A Solana wallet address is required' }));
          return;
        }
        try {
          const portfolio = await getHeliusPortfolio(address);
          res.statusCode = 200;
          res.end(JSON.stringify(portfolio));
        } catch (error) {
          res.statusCode = 502;
          res.end(JSON.stringify({ error: getHeliusErrorMessage(error) }));
        }
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  process.env.HELIUS_API_KEY ||= env.HELIUS_API_KEY;
  return {
    plugins: [
      react(),
      heliusApi(),
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'icon.svg'],
        manifest: {
          id: '/',
          name: 'Trust Wallet Agent Terminal',
          short_name: 'TWAgent',
          description: 'Multichain Trust Wallet & Jupiter trading agent with DexScreener charts and automated orders.',
          theme_color: '#0a0d14',
          background_color: '#0a0d14',
          display: 'standalone',
          start_url: '/',
          scope: '/',
          icons: [
            {
              src: '/pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: '/pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: '/pwa-maskable-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable',
            },
          ],
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
        },
        devOptions: {
          enabled: true,
          type: 'module',
        },
      }),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
