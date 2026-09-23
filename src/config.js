// Webhook Make: scenario "Studio CAI – WebApp Registro Chiavi" (ID 7434486)
// Usato anche da index.html (precaricamento dell'elenco), tramite vite.config.js.
// Lettura veloce dell'elenco: funzione Vercel /api/elenco (Airtable diretto). Se non disponibile si usa il webhook.
export const ELENCO_URL = '/api/elenco'
export const WEBHOOK_URL = 'https://hook.eu1.make.com/bxtcwfhdeqixkixygyh8m4u59xfmlcxo'
export const APP_VERSION = '1.3.0'
export const BUILD_DATE = '23/09/2026'
export const GIORNI_AVVISO = 5
export const TIMEOUT_MS = 25000
// Se la pagina resta aperta sul telefono, al ritorno ricontrolla lo stato dopo questo intervallo.
export const RICONTROLLO_MS = 60000
