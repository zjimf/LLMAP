import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  // Make sure all projects you build are at this address
  base: './',
  plugins: [react()],
})
