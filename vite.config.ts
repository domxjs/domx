import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    lib: {
      entry: 'src/pm-web.ts',
      formats: ['es']
    }
  }
})
