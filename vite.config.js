import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss()],
  build: {
    outDir: 'docs',
    // В docs/ лежат спека и план. Обычная сборка Vite стёрла бы их.
    emptyOutDir: false,
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.js'],
  },
})
