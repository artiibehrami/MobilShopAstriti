import { useEffect } from 'react'
import PhoneArt from './PhoneArt.jsx'
import { AddButton } from './ProductCard.jsx'
import { Close, Shield, Bolt, Whatsapp } from './Icons.jsx'
import { fmt } from '../data.js'

export default function QuickView({ p, onClose, onAdd, store, policies }) {
  useEffect(() => {
    if (!p) return
    const k = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', k)
    document.body.style.overflow = 'hidden'
    return () => { window.removeEventListener('keydown', k); document.body.style.overflow = '' }
  }, [p, onClose])
  if (!p) return null
  const wa = store?.whatsapp ? `https://wa.me/${store.whatsapp}?text=${encodeURIComponent(`Përshëndetje, a është në dispozicion ${p.name} (${p.sub})?`)}` : ''
  const stockLabel = p.stockStatus === 'in_stock' ? 'Në stok' : p.stockStatus === 'out_of_stock' ? 'Jashtë stokut' : 'Kontakto për disponueshmërinë'
  return (
    <div className="fixed inset-0 z-50 grid place-items-center p-4" role="dialog" aria-modal="true" aria-label={p.name}>
      <div onClick={onClose} className="absolute inset-0 animate-rise bg-black/70 backdrop-blur-md" />
      <div className="glass-deep relative grid w-full max-w-3xl animate-pop overflow-hidden rounded-3xl shadow-[0_24px_70px_rgba(29,29,31,0.18)] md:grid-cols-2">
        <button onClick={onClose} aria-label="Mbyll" className="absolute right-4 top-4 z-10 grid h-9 w-9 place-items-center rounded-full bg-white/90 text-zinc-700 shadow-sm hover:bg-white lux"><Close className="h-4 w-4" /></button>
        <div className="relative grid min-h-[280px] place-items-center bg-[#f5f5f7] p-8">
          {p.image
            ? <img src={p.image} alt={p.name} className="relative h-72 w-full object-contain" />
            : <PhoneArt kind={p.kind} a={p.a} b={p.b} className="relative h-72 drop-shadow-[0_20px_30px_rgba(29,29,31,0.18)]" />}
        </div>
        <div className="flex flex-col p-7 sm:p-9">
          <span className="w-fit rounded-full bg-zinc-100 px-3 py-1 text-[11px] text-zinc-600">{p.tag || p.category}</span>
          <h3 className="mt-4 text-3xl font-semibold leading-tight tracking-tight">{p.name}</h3>
          <p className="mt-2 text-sm text-zinc-500">{p.sub}</p>
          {p.blurb && <p className="mt-5 text-sm leading-relaxed text-zinc-600">{p.blurb}</p>}
          <p className={`mt-4 text-sm ${p.stockStatus === 'in_stock' ? 'text-emerald-700' : 'text-amber-700'}`}>{stockLabel}</p>
          <ul className="mt-5 space-y-2 text-sm text-zinc-600">
            {policies?.warranty && <li className="flex items-center gap-2"><Shield className="h-4 w-4 shrink-0 text-blue-600" /> {policies.warranty}</li>}
            {policies?.payment && <li className="flex items-center gap-2"><Bolt className="h-4 w-4 shrink-0 text-blue-600" /> {policies.payment}</li>}
          </ul>
          <p className="mt-6 text-3xl font-semibold tracking-tight">{fmt(Number(p.price) || 0)}</p>
          {p.priceUpdatedAt && <p className="mt-1 text-xs text-zinc-400">Çmimi u përditësua më {new Date(p.priceUpdatedAt.replace(' ', 'T')).toLocaleDateString('sq-XK')}</p>}
          <div className="mt-5 grid gap-3">
            <AddButton onAdd={() => onAdd(p)} disabled={p.stockStatus !== 'in_stock'} disabledLabel="Kontakto për disponueshmërinë" />
            {wa && <a href={wa} target="_blank" rel="noreferrer" className="btn-ghost flex items-center justify-center gap-2"><Whatsapp className="h-4 w-4" /> Pyet në WhatsApp</a>}
          </div>
        </div>
      </div>
    </div>
  )
}
