import { useMemo, useState } from 'react'
import Schermata, { CAMPO } from './Schermata.jsx'
import { giorniFuori, normalizza } from '../api.js'
import { GIORNI_AVVISO } from '../config.js'

export default function SceltaCondominio({ titolo, elenco, soloFuori = false, vuoto, onIndietro, onScegli }) {
  const [q, setQ] = useState('')
  const filtrati = useMemo(() => {
    const n = normalizza(q)
    return n ? elenco.filter((c) => normalizza(c.condominio).includes(n)) : elenco
  }, [q, elenco])

  return (
    <Schermata titolo={titolo} onIndietro={onIndietro}>
      <label className="block">
        <span className="sr-only">Cerca condominio</span>
        <input
          autoFocus={!soloFuori}
          type="search"
          inputMode="search"
          autoComplete="off"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Scrivi la via, es. rua"
          className={CAMPO}
        />
      </label>

      <ul className="mt-4 flex flex-col gap-2">
        {filtrati.map((c) => {
          const gg = giorniFuori(c.uscita)
          const ritardo = c.fuori && gg >= GIORNI_AVVISO
          return (
            <li key={c.id}>
              <button
                onClick={() => onScegli(c)}
                className="flex w-full items-center justify-between gap-3 rounded-2xl bg-white px-4 py-4 text-left ring-1 ring-neutral-200 transition active:bg-brand/8 active:ring-brand/40"
              >
                <span className="text-[1.05rem] font-semibold">{c.condominio}</span>
                {c.fuori && (
                  <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold ${ritardo ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-800'}`}>
                    {soloFuori ? `${c.detentore || 'fuori'} · ${gg} gg` : 'Fuori'}
                  </span>
                )}
              </button>
            </li>
          )
        })}
      </ul>
      {filtrati.length === 0 && <p className="mt-6 text-center text-neutral-500">{vuoto}</p>}
    </Schermata>
  )
}
