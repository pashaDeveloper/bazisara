import path from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  define: {
    'process.env': process.env
  },
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'), // تعریف alias برای src
      '@tailwindConfig': path.resolve(__dirname, 'tailwind.config.js'),

    },
  },
 
  build: {
    commonjsOptions: {
      transformMixedEsModules: true,
    }
  } 
})
