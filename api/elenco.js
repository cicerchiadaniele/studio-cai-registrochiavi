// Studio CAI – Registro Chiavi: lettura rapida dell'elenco direttamente da Airtable (senza Make).
// Richiede la variabile d'ambiente AIRTABLE_TOKEN su Vercel (token in sola lettura, base "Registro Chiavi").
// Se il token manca o Airtable non risponde, restituisce errore e l'app ripiega da sola sul webhook Make.
const BASE = 'appit0KcdaUdu5WE6'
const CHIAVI = 'tblKbZ0FRbjCUCnuH'
const NOMINATIVI = 'tbliiOVAExM6nCr4e'

async function leggiTutti(token, tabella, params) {
  const out = []
  let offset
  do {
    const q = new URLSearchParams(params)
    q.set('pageSize', '100')
    if (offset) q.set('offset', offset)
    const res = await fetch(`https://api.airtable.com/v0/${BASE}/${tabella}?${q}`, {
      headers: { Authorization: `Bearer ${token}` },
      signal: AbortSignal.timeout(8000),
    })
    if (!res.ok) throw new Error(`Airtable ${res.status}`)
    const json = await res.json()
    out.push(...(json.records || []).map((r) => ({ id: r.id, fields: r.fields || {} })))
    offset = json.offset
  } while (offset)
  return out
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store')
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  const token = process.env.AIRTABLE_TOKEN
  if (!token) return res.status(503).send(JSON.stringify({ ok: false, errore: 'token mancante' }))
  try {
    const [chiavi, nominativi] = await Promise.all([
      leggiTutti(token, CHIAVI, { 'sort[0][field]': 'Condominio', 'sort[0][direction]': 'asc' }),
      leggiTutti(token, NOMINATIVI, { filterByFormula: '{Attivo}', 'sort[0][field]': 'Nome' }),
    ])
    return res.status(200).send(JSON.stringify({ ok: true, chiavi, nominativi }))
  } catch (e) {
    return res.status(502).send(JSON.stringify({ ok: false, errore: String(e.message || e) }))
  }
}
