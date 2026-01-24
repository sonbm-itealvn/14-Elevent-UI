import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  plugins: [
    vue({
      script: {
        defineModel: true,
        propsDestructure: true
      }
    }),
    tailwindcss()
  ],
  build: {
    target: 'esnext',
    minify: 'esbuild',
  },
  optimizeDeps: {
    include: ['vue', 'vue-router', 'pinia']
  }
})
