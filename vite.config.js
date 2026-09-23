import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { WEBHOOK_URL, APP_VERSION } from './src/config.js'

// Inserisce in index.html il webhook e la versione presi da src/config.js (un solo punto da modificare).
const configInHtml = () => ({
  name: 'config-in-html',
  transformIndexHtml: (html) =>
    html.replaceAll('__WEBHOOK_URL__', WEBHOOK_URL).replaceAll('__APP_VERSION__', APP_VERSION),
})

export default defineConfig({
  plugins: [react(), configInHtml()],
})
