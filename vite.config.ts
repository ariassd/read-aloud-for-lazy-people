import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const isProduction = mode === 'production';
  return {
    plugins: [react()],
    build: isProduction ? {
      sourcemap: false,
      minify: 'esbuild',
    } : { sourcemap: true },
    server: {
      proxy: {
        '/api': 'http://localhost:8000'
      }
    }
  };
});
