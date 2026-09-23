# Studio CAI – Registro Chiavi (v1.3.0)

Webapp per registrare uscita e rientro dei mazzi di chiavi dei condomini.

## Novità 1.3.0 – stile di casa Studio CAI (solo grafica, 23/09/2026)
- Come Segnalazioni rev 2.0: intestazione con logo, "Studio CAI" e "Registro chiavi"; sfondo carta con velature bordeaux; schermate in card bianche con testata bordeaux e tasto Indietro; piè di pagina con versione e data.
- Bordeaux unico colore d'accento (eliminato l'ottone, anche nel contorno di messa a fuoco); cartellino di conferma bordeaux; avvisi in ambra.
- Font Fraunces e Manrope; campi a 16 px su iPhone/iPad (niente zoom al tocco).
- Logica, lettura diretta, cache, webhook e memoria locale invariati.

## Novità 1.2.0 – lettura diretta da Airtable
- L'elenco dei condomini e lo stato dei mazzi si leggono direttamente da Airtable tramite la funzione Vercel `api/elenco.js`: pagina pronta in meno di mezzo secondo anche al primo avvio su un telefono nuovo, e nessuna operazione Make per la lettura.
- Se la funzione non è disponibile (token non impostato, Airtable non raggiungibile) l'app ripiega da sola sul webhook Make, come nella 1.1.0.
- Letti tutti i condomini anche oltre 100 (superato il vecchio limite).
- Uscite e rientri passano ancora dallo scenario Make 7434486, invariato.

## Novità 1.1.0 – apertura immediata
- Elenco e stato dei mazzi restano in memoria sul telefono: alla riapertura i pulsanti sono subito attivi e lo stato si aggiorna in sottofondo.
- Dopo un'uscita o un rientro confermati l'elenco si aggiorna in locale, senza rileggerlo (6 operazioni Make risparmiate per registrazione).
- Pagina lasciata aperta: al ritorno sul telefono lo stato si ricontrolla (al massimo una volta al minuto).

## Attivare la lettura diretta (una volta sola)
1. Airtable → https://airtable.com/create/tokens → Create token.
   Nome: "Registro Chiavi – lettura". Scope: solo `data.records:read`. Access: solo la base "Registro Chiavi". Copia il token.
2. Vercel → progetto del Registro Chiavi → Settings → Environment Variables → nome `AIRTABLE_TOKEN`, valore il token, ambienti Production e Preview → Save.
3. Vercel → Deployments → ultimo deploy → Redeploy (le variabili valgono solo dal deploy successivo).
Verifica: aprendo `https://<dominio>/api/elenco` deve comparire un testo che inizia con `{"ok":true`.
Senza questi passaggi l'app funziona comunque, leggendo l'elenco da Make.

## Pubblicazione su Vercel
1. Importa la cartella come nuovo progetto (framework: Vite, build `npm run build`, output `dist`). La cartella `api` viene pubblicata automaticamente come funzione.
2. Il logo dello studio va in `public/logo.jpg` (intestazione, cartello e icona della pagina).
3. Apri `https://<dominio>/cartello`, stampa il cartello con il QR e affiggilo vicino alle chiavi.

## Collegamenti
- Lettura elenco: `api/elenco.js` → Airtable base "Registro Chiavi" (appit0KcdaUdu5WE6), tabelle Chiavi (tblKbZ0FRbjCUCnuH) e Nominativi (tbliiOVAExM6nCr4e).
- Webhook Make: `src/config.js` → scenario "Studio CAI – WebApp Registro Chiavi" (ID 7434486), per uscite/rientri e come ripiego per la lettura. Il valore viene inserito anche in index.html in fase di build.
- Sync condomini da Dropbox `/STUDIO CAI/scritti_cai`: scenario 7434508, il 1° del mese alle 6:00
- Riepilogo email a studiocai.gestioneimmobili+chiavi@gmail.com: scenario 7434525, venerdì 8:30

## Note
- Nominativi frequenti: si gestiscono dalla tabella Nominativi (campo "Attivo").
- Esclusi dalla sync: cartelle che iniziano con "-" o "z" minuscola e "Nuova cartella".
- Il cartellino di conferma compare solo se Airtable restituisce lo stato aggiornato.
- In `npm run dev` / `vite preview` la funzione `api` non gira: l'app usa il ripiego Make.
- package-lock.json non è incluso in questa copia: Vercel lo rigenera da package.json durante la build.
