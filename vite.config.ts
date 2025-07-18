import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import * as path from 'path';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const frontendPort = parseInt(env.VITE_PORT || '5182', 10);
  
  return {
    plugins: [react()],
    server: {
      host: true,
      port: frontendPort,
      ...(mode === 'development' && {
        proxy: {
          '/api': {
            target: process.env.VITE_API_URL || 'http://localhost:5050',
            changeOrigin: true,
            secure: false,
          }
        }
      })
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
  };
});