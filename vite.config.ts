import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// Tạo timestamp một lần duy nhất khi load config
const BUILD_TIMESTAMP = Date.now().toString();

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
    tailwindcss(),
    // Plugin để tạo version.json sau khi build
    {
      name: 'generate-version',
      generateBundle() {
        this.emitFile({
          type: 'asset',
          fileName: 'version.json',
          source: JSON.stringify({
            timestamp: BUILD_TIMESTAMP,
            buildTime: new Date().toISOString(),
            version: process.env.npm_package_version || '1.0.0'
          }, null, 2)
        });
      }
    }
  ],
  define: {
    'import.meta.env.VITE_BUILD_TIMESTAMP': JSON.stringify(BUILD_TIMESTAMP)
  },
  build: {
    target: 'esnext',
    minify: 'esbuild',
  },
  optimizeDeps: {
    include: ['vue', 'vue-router', 'pinia']
  }
})
