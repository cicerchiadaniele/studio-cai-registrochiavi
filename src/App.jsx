import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { caricaElenco, leggiCache, salvaCache, registraUscita, registraRientro } from './api.js'
import { RICONTROLLO_MS } from './config.js'
import { Sfondo, Intestazione, PiePagina } from './components/Cornice.jsx'
import Home from './components/Home.jsx'
import SceltaCondominio from './components/SceltaCondominio.jsx'
import SceltaNome from './components/SceltaNome.jsx'
import ConfermaRientro from './components/ConfermaRientro.jsx'
import Esito from './components/Esito.jsx'

const cacheIniziale = leggiCache()

export default function App() {
  // Con un elenco già in memoria la pagina è pronta subito; lo stato si aggiorna in sottofondo.
  const [dati, setDati] = useState(cacheIniziale || { chiavi: [], nominativi: [] })
  const [caricamento, setCaricamento] = useState(cacheIniziale ? 'pronto' : 'attesa') // attesa | pronto | errore
  const [aggiornamento, setAggiornamento] = useState('in-corso') // in-corso | ok | errore
  const [schermata, setSchermata] = useState('home')
  const [scelta, setScelta] = useState(null)
  const [invio, setInvio] = useState(null) // { stato, tipo, esegui, messaggio, dettaglio }

  const haDati = useRef(!!cacheIniziale)
  const ultimaModifica = useRef(0) // istante dell'ultima operazione confermata su questo telefono
  const ultimoControllo = useRef(0)

  const ricarica = useCallback(async () => {
    const avvio = Date.now()
    ultimoControllo.current = avvio
    setAggiornamento('in-corso')
    if (!haDati.current) setCaricamento('attesa')
    try {
      const nuovi = await caricaElenco()
      // Una lettura partita prima di un'operazione confermata non deve sovrascriverla.
      if (avvio >= ultimaModifica.current) setDati(nuovi)
      haDati.current = true
      setCaricamento('pronto')
      setAggiornamento('ok')
    } catch {
      setAggiornamento('errore')
      if (!haDati.current) setCaricamento('errore')
    }
  }, [])

  useEffect(() => { ricarica() }, [ricarica])

  // Pagina rimasta aperta: al ritorno sul telefono ricontrolla lo stato (solo se è passato un po').
  useEffect(() => {
    const alRitorno = () => {
      if (document.visibilityState === 'visible' && Date.now() - ultimoControllo.current > RICONTROLLO_MS) ricarica()
    }
    document.addEventListener('visibilitychange', alRitorno)
    return () => document.removeEventListener('visibilitychange', alRitorno)
  }, [ricarica])

  // Dopo la conferma di Airtable aggiorna l'elenco in locale, senza rileggerlo da Make.
  const applica = (id, modifiche) => {
    ultimaModifica.current = Date.now()
    setDati((d) => {
      const nuovi = { ...d, chiavi: d.chiavi.map((c) => (c.id === id ? { ...c, ...modifiche } : c)) }
      salvaCache(nuovi)
      return nuovi
    })
  }

  const fuori = dati.chiavi.filter((c) => c.fuori)
  // Il mazzo scelto, sempre nella versione più recente dell'elenco (se arriva un aggiornamento nel frattempo).
  const corrente = scelta ? dati.chiavi.find((c) => c.id === scelta.id) || scelta : null

  const tornaHome = () => {
    setScelta(null)
    setInvio(null)
    setSchermata('home')
  }

  const esegui = async (tipo, azione, dettaglio) => {
    setSchermata('invio')
    setInvio({ stato: 'attesa', tipo, azione, dettaglio })
    try {
      await azione()
      if (tipo === 'uscita') applica(dettaglio.id, { fuori: true, detentore: dettaglio.nome, uscita: new Date().toISOString() })
      else applica(dettaglio.id, { fuori: false, detentore: '', uscita: null })
      setInvio({ stato: 'ok', tipo, azione, dettaglio })
    } catch (e) {
      setInvio({ stato: 'errore', tipo, azione, dettaglio, messaggio: e.message })
      ricarica()
    }
  }

  const confermaUscita = (nome) =>
    esegui('uscita', () => registraUscita(corrente.id, nome), { id: corrente.id, condominio: corrente.condominio, nome })

  const confermaRientro = () =>
    esegui('rientro', () => registraRientro(corrente.id), { id: corrente.id, condominio: corrente.condominio, nome: corrente.detentore })


  return (
    <div className="relative flex min-h-screen flex-col bg-paper bg-noise text-neutral-900">
      <Sfondo />
      <Intestazione />
      <div className="relative z-10 mx-auto flex w-full max-w-md flex-1 flex-col px-4 pt-4 sm:pt-6">
      <AnimatePresence mode="wait">
        {schermata === 'home' && (
          <Home
            key="home"
            caricamento={caricamento}
            aggiornamento={aggiornamento}
            nFuori={fuori.length}
            onPrendo={() => setSchermata('prendo-condominio')}
            onRiporto={() => setSchermata('riporto')}
            onRiprova={ricarica}
          />
        )}
        {schermata === 'prendo-condominio' && (
          <SceltaCondominio
            key="pc"
            titolo="Quali chiavi prendi?"
            elenco={dati.chiavi}
            vuoto="Nessun condominio trovato con questo nome."
            onIndietro={tornaHome}
            onScegli={(c) => { setScelta(c); setSchermata('prendo-nome') }}
          />
        )}
        {schermata === 'prendo-nome' && scelta && (
          <SceltaNome
            key="pn"
            chiave={corrente}
            nominativi={dati.nominativi}
            onIndietro={() => setSchermata('prendo-condominio')}
            onConferma={confermaUscita}
          />
        )}
        {schermata === 'riporto' && (
          <SceltaCondominio
            key="r"
            titolo="Quali chiavi riporti?"
            elenco={fuori}
            soloFuori
            vuoto={fuori.length ? 'Nessun mazzo fuori con questo nome.' : aggiornamento === 'in-corso' ? 'Verifico lo stato dei mazzi…' : 'Tutte le chiavi risultano in studio.'}
            onIndietro={tornaHome}
            onScegli={(c) => { setScelta(c); setSchermata('riporto-conferma') }}
          />
        )}
        {schermata === 'riporto-conferma' && scelta && (
          <ConfermaRientro
            key="rc"
            chiave={corrente}
            onIndietro={() => setSchermata('riporto')}
            onConferma={confermaRientro}
          />
        )}
        {schermata === 'invio' && invio && (
          <Esito
            key="es"
            invio={invio}
            onRiprova={() => esegui(invio.tipo, invio.azione, invio.dettaglio)}
            onFatto={tornaHome}
          />
        )}
      </AnimatePresence>
      </div>
      <PiePagina />
    </div>
  )
}
