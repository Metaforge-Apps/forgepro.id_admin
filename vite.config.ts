import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://forgepro-625134443444.asia-southeast1.run.app',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
