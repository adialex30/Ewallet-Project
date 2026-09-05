import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Dev server port is fixed at 5175 to match the CORS allowed-origin
// configured on the backend (SecurityConfig.corsConfigurationSource).
// If you change this, update SecurityConfig on the backend too.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5175,
  },
})
