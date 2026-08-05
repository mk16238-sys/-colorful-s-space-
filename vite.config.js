import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  // GitHub Pages 部署到仓库子路径；本地开发保持相对路径
  base: process.env.GITHUB_ACTIONS ? '/-colorful-s-space-/' : './',
  plugins: [react()],
  server: {
    host: true,
    port: 5180,
  },
  build: {
    target: 'es2019',
    cssCodeSplit: false,
    assetsInlineLimit: 2048,
    chunkSizeWarningLimit: 2200,
    rollupOptions: {
      output: {
        manualChunks: {
          three: ['three', '@react-three/fiber', '@react-three/drei'],
          physics: ['@react-three/rapier', 'meshline'],
        },
      },
    },
  },
  assetsInclude: ['**/*.glb'],
})
