import { WEBHOOK_URL, ELENCO_URL, TIMEOUT_MS, APP_VERSION } from './config.js'

const CHIAVE_CACHE = 'registro-chiavi:elenco'

// Invio come form-urlencoded: richiesta "semplice", nessun preflight CORS.
async function chiamaTesto(dati) {
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS)
  try {
    const res = await fetch(WEBHOOK_URL, {
      method: 'POST',
      body: new URLSearchParams({ ...dati, versione: APP_VERSION }),
      signal: ctrl.signal,
    })
    const testo = await res.text()
    if (!res.ok) throw new Error('Il registro non ha confermato l\u2019operazione.')
    return testo
  } catch (e) {
    if (e.name === 'AbortError') throw new Error('Nessuna risposta dal registro entro 25 secondi.')
    if (e instanceof TypeError) throw new Error('Connessione assente o registro non raggiungibile.')
    throw e
  } finally {
    clearTimeout(timer)
  }
}

function leggiJson(testo) {
  let json
  try { json = JSON.parse(testo) } catch { json = null }
  if (!json || json.ok !== true) throw new Error('Il registro non ha confermato l\u2019operazione.')
  return json
}

const chiama = async (dati) => leggiJson(await chiamaTesto(dati))

export const pulisciNome = (s) =>
  String(s || '').replace(/["\\]/g, '').replace(/[\u0000-\u001f]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 60)

function converti(json) {
  const chiavi = (json.chiavi || []).map((r) => ({
    id: r.id,
    condominio: r.fields?.Condominio || '(senza nome)',
    fuori: r.fields?.Stato === 'Fuori',
    detentore: r.fields?.Detentore || '',
    uscita: r.fields?.Uscita || null,
  }))
  const nominativi = (json.nominativi || []).map((r) => r.fields?.Nome).filter(Boolean)
  return { chiavi, nominativi }
}

// Precaricamento avviato da index.html prima che l'app sia scaricata: lo usa una sola volta.
function prendiPrecarico() {
  const p = typeof window !== 'undefined' ? window.__elenco : null
  if (typeof window !== 'undefined') window.__elenco = null
  if (!p) return null
  return Promise.race([p, new Promise((r) => setTimeout(() => r(null), TIMEOUT_MS))])
}

const provaJson = (testo) => { try { return testo ? leggiJson(testo) : null } catch { return null } }

// Lettura diretta da Airtable tramite la funzione Vercel (veloce, nessuna operazione Make).
async function leggiDiretto() {
  try {
    const res = await fetch(ELENCO_URL, { cache: 'no-store', signal: AbortSignal.timeout(8000) })
    return res.ok ? provaJson(await res.text()) : null
  } catch { return null }
}

export async function caricaElenco() {
  const pre = prendiPrecarico()
  let json = pre ? provaJson(await pre) : await leggiDiretto()
  // Ripiego: webhook Make (come nella 1.1.0).
  if (!json) json = await chiama({ azione: 'elenco' })
  const dati = converti(json)
  salvaCache(dati)
  return dati
}

// Ultimo elenco ricevuto, conservato sul telefono: la pagina è subito utilizzabile.
export function leggiCache() {
  try {
    const d = JSON.parse(localStorage.getItem(CHIAVE_CACHE) || 'null')
    return d && Array.isArray(d.chiavi) && d.chiavi.length ? d : null
  } catch { return null }
}

export function salvaCache(dati) {
  try { localStorage.setItem(CHIAVE_CACHE, JSON.stringify(dati)) } catch { /* facoltativo */ }
}

export const registraUscita = (recordId, nome) =>
  chiama({ azione: 'prendo', recordId, nome: pulisciNome(nome) })

export const registraRientro = (recordId) =>
  chiama({ azione: 'restituisco', recordId })

export function giorniFuori(uscita) {
  if (!uscita) return 0
  return Math.max(0, Math.floor((Date.now() - new Date(uscita).getTime()) / 86400000))
}

export const normalizza = (s) =>
  s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '')
