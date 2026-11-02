import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import apiPlugin from './server/dev-plugin.js'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  Object.assign(process.env, loadEnv(mode, process.cwd(), ''))
  return { plugins: [react(), apiPlugin()] }
})
