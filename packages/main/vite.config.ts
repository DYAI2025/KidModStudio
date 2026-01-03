import { defineConfig } from 'vite'
import electron from 'vite-plugin-electron'
import renderer from 'vite-plugin-electron-renderer'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  root: resolve(__dirname, '../renderer'),
  plugins: [
    react(),
    electron([
      {
        entry: resolve(__dirname, 'src/index.ts'),
        vite: {
          build: {
            outDir: resolve(__dirname, 'dist-electron'),
            rollupOptions: {
              external: ['electron']
            }
          }
        }
      },
      {
        entry: resolve(__dirname, '../preload/src/index.ts'),
        vite: {
          build: {
            outDir: resolve(__dirname, '../preload/dist'),
            rollupOptions: {
              external: ['electron']
            }
          }
        },
        onstart(options) {
          options.reload()
        }
      }
    ]),
    renderer()
  ],
  build: {
    outDir: resolve(__dirname, '../renderer/dist')
  }
})
