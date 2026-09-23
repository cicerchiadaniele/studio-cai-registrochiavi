import { useEffect, useState } from 'react'
import QRCode from 'qrcode'

// Cartello A4 da stampare e affiggere vicino alle chiavi: /cartello
export default function Cartello() {
  const url = window.location.origin + '/'
  const [src, setSrc] = useState('')

  useEffect(() => {
    QRCode.toDataURL(url, { width: 900, margin: 1, color: { dark: '#171717', light: '#FFFFFF' }, errorCorrectionLevel: 'M' })
      .then(setSrc)
  }, [url])

  return (
    <div className="mx-auto flex min-h-full max-w-[210mm] flex-col items-center bg-white px-10 py-12 text-center text-neutral-900">
      <img src="/logo.jpg" alt="Logo Studio CAI" className="h-20 w-20 rounded-2xl object-contain ring-1 ring-neutral-200" />
      <p className="mt-4 font-display text-2xl font-semibold text-brand">Studio CAI</p>
      <h1 className="mt-2 font-display text-6xl font-semibold leading-none">Registro chiavi</h1>
      <p className="mt-6 max-w-md text-2xl leading-snug">
        Prendi o riporti un mazzo? Inquadra il codice e registralo: bastano pochi secondi.
      </p>
      {src && <img src={src} alt={`Codice QR per ${url}`} className="mt-10 w-[120mm] max-w-full" />}
      <p className="mt-6 text-lg text-neutral-600">{url.replace(/^https?:\/\//, '').replace(/\/$/, '')}</p>
      <button onClick={() => window.print()} className="mt-10 rounded-2xl bg-gradient-to-br from-brand to-brand-dark px-8 py-4 text-lg font-bold text-white shadow-[0_10px_24px_-10px_rgba(139,21,56,0.6)] print:hidden">
        Stampa il cartello
      </button>
    </div>
  )
}
