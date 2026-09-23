import Schermata from './Schermata.jsx'

function Chiave({ className }) {
  return (
    <svg viewBox="0 0 64 64" className={className} fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round" aria-hidden="true">
      <circle cx="20" cy="32" r="11" />
      <path d="M31 32h26M49 32v9M56 32v7" />
    </svg>
  )
}

// caricamento: attesa (primo avvio, nessun elenco in memoria) | pronto | errore
// aggiornamento: in-corso | ok | errore (verifica in sottofondo, non blocca i pulsanti)
export default function Home({ caricamento, aggiornamento, nFuori, onPrendo, onRiporto, onRiprova }) {
  const pronto = caricamento === 'pronto'
  return (
    <Schermata>
      {caricamento === 'attesa' && (
        <p className="mb-4 rounded-2xl bg-neutral-50 px-4 py-3 text-sm text-neutral-600 ring-1 ring-neutral-200" role="status">
          Carico l’elenco dei condomini…
        </p>
      )}
      {caricamento === 'errore' && (
        <div className="mb-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-200" role="alert">
          Elenco non disponibile: controlla la connessione.
          <button onClick={onRiprova} className="ml-2 font-bold underline">Riprova</button>
        </div>
      )}
      {pronto && aggiornamento === 'errore' && (
        <div className="mb-4 rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-800 ring-1 ring-amber-200" role="status">
          Stato dei mazzi non aggiornato: controlla la connessione.
          <button onClick={onRiprova} className="ml-2 font-bold underline">Aggiorna</button>
        </div>
      )}

      <div className="flex flex-col gap-4">
        <button
          onClick={onPrendo}
          disabled={!pronto}
          className="group relative flex min-h-[9.5rem] flex-col justify-between overflow-hidden rounded-3xl bg-gradient-to-br from-brand via-brand-dark to-brand-deep p-6 text-left text-white shadow-[0_10px_24px_-10px_rgba(139,21,56,0.6)] transition active:scale-[0.98] disabled:opacity-50"
        >
          <Chiave className="absolute -right-4 -top-2 h-28 w-28 rotate-[-20deg] text-white/10" />
          <span className="text-sm font-medium text-white/85">Esce dallo studio</span>
          <span className="font-display text-3xl font-semibold">Prendo le chiavi</span>
        </button>

        <button
          onClick={onRiporto}
          disabled={!pronto}
          className="flex min-h-[9.5rem] flex-col justify-between rounded-3xl bg-white p-6 text-left ring-1 ring-brand/30 transition active:scale-[0.98] active:bg-brand/5 disabled:opacity-50"
        >
          <span className="text-sm font-medium text-neutral-600">
            {pronto ? (nFuori === 0 ? 'Nessun mazzo fuori' : nFuori === 1 ? '1 mazzo fuori' : `${nFuori} mazzi fuori`) : 'Rientra in studio'}
          </span>
          <span className="font-display text-3xl font-semibold text-brand">Riporto le chiavi</span>
        </button>
      </div>
    </Schermata>
  )
}
