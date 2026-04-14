import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  define: {
    global: 'globalThis',
  },
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'https://localhost:7070',
        changeOrigin: true,
        secure: false, // bỏ qua lỗi chứng chỉ SSL localhost
      }
    }
  },
  build: {
    chunkSizeWarningLimit: 800,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('antd') || id.includes('@ant-design')) return 'vendor-antd';
            if (id.includes('@fortawesome')) return 'vendor-icons';

            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) return 'vendor-react';
            return 'vendor';
          }
        }
      }
    }
  }
});
