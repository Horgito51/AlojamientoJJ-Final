import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const middlewareTarget = 'https://middlewarebusapi-b4dxgnfkfvbwa9ge.brazilsouth-01.azurewebsites.net'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    historyApiFallback: true,
    proxy: {
      '/api': {
        target: middlewareTarget,
        changeOrigin: true,
        secure: true,
      },
    },
  }
})
