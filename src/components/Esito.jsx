import { motion } from 'framer-motion'
import Schermata, { TASTO_PRIMARIO } from './Schermata.jsx'

function Cartellino({ titolo, riga1, riga2 }) {
  // Il cartellino portachiavi: l'elemento che conferma, oscilla una volta appeso all'anello.
  return (
    <motion.div
      initial={{ rotate: -14, y: -20, opacity: 0 }}
      animate={{ rotate: [-14, 8, -4, 0], y: 0, opacity: 1 }}
      transition={{ duration: 0.9, ease: 'easeOut' }}
      style={{ transformOrigin: '50% 0%' }}
      className="mx-auto mt-2 flex w-64 flex-col items-center"
    >
      <div className="h-9 w-9 rounded-full border-[5px] border-brand-dark" />
      <div className="-mt-1 h-5 w-[3px] bg-brand-dark" />
      <div className="relative w-full rounded-[1.5rem] rounded-t-[3rem] bg-gradient-to-br from-brand/8 to-white px-6 pb-7 pt-10 text-center shadow-soft ring-2 ring-brand/30">
        <div className="absolute left-1/2 top-4 h-4 w-4 -translate-x-1/2 rounded-full bg-white ring-2 ring-brand/30" />
        <svg viewBox="0 0 24 24" className="mx-auto h-12 w-12 text-brand-dark" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="10" />
          <path d="M7.5 12.5l3 3 6-6.5" />
        </svg>
        <p className="mt-3 font-display text-2xl font-semibold leading-tight text-brand-deep">{titolo}</p>
        <p className="mt-2 text-base font-semibold text-neutral-900">{riga1}</p>
        {riga2 && <p className="mt-1 text-sm text-neutral-600">{riga2}</p>}
      </div>
    </motion.div>
  )
}

export default function Esito({ invio, onRiprova, onFatto }) {
  const { stato, tipo, dettaglio, messaggio } = invio
  const ora = new Date().toLocaleString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })

  if (stato === 'attesa') {
    return (
      <Schermata className="min-h-[50vh] items-center justify-center text-center">
        <div className="h-14 w-14 animate-spin rounded-full border-[5px] border-brand/20 border-t-brand" aria-hidden="true" />
        <p className="mt-6 font-display text-2xl font-semibold" role="status">Registrazione in corso</p>
        <p className="mt-2 text-neutral-600">{dettaglio.condominio} – attendi la conferma, non chiudere la pagina.</p>
      </Schermata>
    )
  }

  if (stato === 'errore') {
    return (
      <Schermata>
        <div className="rounded-2xl bg-red-50 p-5 ring-1 ring-red-200" role="alert">
          <p className="font-display text-2xl font-semibold text-red-700">Operazione non registrata</p>
          <p className="mt-2 text-neutral-900">{messaggio}</p>
          <p className="mt-2 text-sm text-neutral-600">
            {tipo === 'uscita' ? 'L’uscita' : 'Il rientro'} di <strong>{dettaglio.condominio}</strong> non risulta nel registro. Riprova; se l’errore continua, avvisa lo studio.
          </p>
        </div>
        <button onClick={onRiprova} className={`mt-6 ${TASTO_PRIMARIO}`}>
          Riprova
        </button>
        <button onClick={onFatto} className="mt-3 w-full rounded-2xl py-4 font-semibold text-neutral-600">
          Annulla
        </button>
      </Schermata>
    )
  }

  return (
    <Schermata>
      {tipo === 'uscita' ? (
        <Cartellino titolo="Uscita registrata" riga1={dettaglio.condominio} riga2={`${dettaglio.nome} · ${ora}`} />
      ) : (
        <Cartellino titolo="Chiavi rientrate" riga1={dettaglio.condominio} riga2={`Registrato il ${ora}`} />
      )}
      <button onClick={onFatto} className={`mt-8 ${TASTO_PRIMARIO}`}>
        Fatto
      </button>
    </Schermata>
  )
}
