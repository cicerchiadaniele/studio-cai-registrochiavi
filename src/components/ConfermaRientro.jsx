import Schermata, { TASTO_PRIMARIO } from './Schermata.jsx'
import { giorniFuori } from '../api.js'

export default function ConfermaRientro({ chiave, onIndietro, onConferma }) {
  const gg = giorniFuori(chiave.uscita)
  const uscita = chiave.uscita
    ? new Date(chiave.uscita).toLocaleString('it-IT', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
    : '—'
  return (
    <Schermata titolo={chiave.condominio} sopra="Rientro in studio" onIndietro={onIndietro}>
      <dl className="grid grid-cols-[auto,1fr] gap-x-6 gap-y-3 rounded-2xl bg-neutral-50 p-5 text-base ring-1 ring-neutral-200">
        <dt className="text-neutral-500">Preso da</dt>
        <dd className="font-semibold">{chiave.detentore || '—'}</dd>
        <dt className="text-neutral-500">Uscito il</dt>
        <dd className="font-semibold">{uscita}</dd>
        <dt className="text-neutral-500">Fuori da</dt>
        <dd className="font-semibold">{gg === 1 ? '1 giorno' : `${gg} giorni`}</dd>
      </dl>

      <button onClick={onConferma} className={`mt-6 ${TASTO_PRIMARIO}`}>
        Registra rientro
      </button>
    </Schermata>
  )
}
