import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';
import { loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import svgrPlugin from 'vite-plugin-svgr';

const dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const port = Number(env.VITE_PORT) || 3000;

  return {
    plugins: [
      react(),
      svgrPlugin({ svgrOptions: { icon: true, typescript: true } }),
    ],
    resolve: {
      alias: { '@': path.resolve(dirname, './src') },
    },
    server: { port, strictPort: true },
    preview: { port, strictPort: true },
    build: {
      outDir: 'build',
      rolldownOptions: {
        output: {
          // Split rarely-changing vendors into long-cached chunks.
          // First matching group wins, so `libs` must stay last.
          codeSplitting: {
            groups: [
              {
                name: 'react',
                test: /node_modules[\\/](react|react-dom|react-router|react-router-dom|scheduler)[\\/]/,
              },
              {
                name: 'state',
                test: /node_modules[\\/](@reduxjs|react-redux|redux|redux-persist)[\\/]/,
              },
              { name: 'query', test: /node_modules[\\/]@tanstack[\\/]/ },
              {
                name: 'form',
                test: /node_modules[\\/](react-hook-form|@hookform|zod)[\\/]/,
              },
              {
                name: 'i18n',
                test: /node_modules[\\/](i18next|react-i18next|i18next-browser-languagedetector)[\\/]/,
              },
              { name: 'libs', test: /node_modules[\\/]/ },
            ],
          },
        },
      },
    },
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: './src/setupTests.ts',
      css: false,
    },
  };
});
