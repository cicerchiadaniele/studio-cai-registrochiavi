import { useState } from 'react'
import Schermata, { CAMPO, TASTO_PRIMARIO } from './Schermata.jsx'
import { giorniFuori, pulisciNome } from '../api.js'

const CHIAVE_ULTIMO = 'registro-chiavi:ultimo-nome'

function leggiUltimo() {
  try { return localStorage.getItem(CHIAVE_ULTIMO) || '' } catch { return '' }
}

export default function SceltaNome({ chiave, nominativi, onIndietro, onConferma }) {
  const ultimo = leggiUltimo()
  const inElenco = nominativi.includes(ultimo)
  const [scelto, setScelto] = useState(inElenco ? ultimo : '')
  const [altro, setAltro] = useState(!inElenco && ultimo ? ultimo : '')
  const [modoAltro, setModoAltro] = useState(!inElenco && !!ultimo)

  const nome = pulisciNome(modoAltro ? altro : scelto)
  const valido = nome.length >= 2

  const conferma = () => {
    if (!valido) return
    try { localStorage.setItem(CHIAVE_ULTIMO, nome) } catch { /* facoltativo */ }
    onConferma(nome)
  }

  return (
    <Schermata titolo="Chi prende le chiavi?" sopra={chiave.condominio} onIndietro={onIndietro}>
      {chiave.fuori && (
        <p className="mb-4 rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-800 ring-1 ring-amber-200" role="alert">
          Risulta già fuori a <strong>{chiave.detentore || 'qualcuno'}</strong> da {giorniFuori(chiave.uscita)} giorni.
          Continuando, il registro passa a te.
        </p>
      )}

      <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Nominativo">
        {nominativi.map((n) => {
          const on = !modoAltro && scelto === n
          return (
            <button
              key={n}
              role="radio"
              aria-checked={on}
              onClick={() => { setModoAltro(false); setScelto(n) }}
              className={`rounded-full border-2 px-4 py-3 text-base font-semibold transition ${on ? 'border-brand bg-brand text-white' : 'border-neutral-200 bg-white'}`}
            >
              {n}
            </button>
          )
        })}
        <button
          role="radio"
          aria-checked={modoAltro}
          onClick={() => setModoAltro(true)}
          className={`rounded-full border-2 px-4 py-3 text-base font-semibold transition ${modoAltro ? 'border-brand bg-brand text-white' : 'border-dashed border-neutral-300 bg-white'}`}
        >
          Altro nome
        </button>
      </div>

      {modoAltro && (
        <label className="mt-4 block">
          <span className="mb-1.5 block text-sm font-semibold text-neutral-700">Nome e cognome o ditta</span>
          <input
            autoFocus
            value={altro}
            maxLength={60}
            onChange={(e) => setAltro(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && conferma()}
            placeholder="es. Mario Rossi – idraulico"
            className={CAMPO}
          />
        </label>
      )}

      <button onClick={conferma} disabled={!valido} className={`mt-6 ${TASTO_PRIMARIO}`}>
        Registra uscita
      </button>
    </Schermata>
  )
}
