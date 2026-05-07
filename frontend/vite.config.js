import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: [
      '@radix-ui/react-select',
      '@radix-ui/react-slot',
      '@radix-ui/react-label',
    ],
  },
})
