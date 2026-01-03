import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    lib: {
      entry: 'src/index.ts',
      formats: ['cjs'],
      fileName: 'index'
    },
    outDir: 'dist',
    rollupOptions: {
      external: ['electron']
    }
  }
})
