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
  const isInStock = p.stockStatus === 'in_stock'
  return (
    <div className="fixed inset-0 z-50 grid place-items-center p-3 sm:p-5" role="dialog" aria-modal="true" aria-labelledby="quick-view-title">
      <div onClick={onClose} className="absolute inset-0 animate-rise bg-zinc-950/65 backdrop-blur-sm" />
      <div className="relative grid max-h-[calc(100dvh-1.5rem)] w-full max-w-5xl animate-pop grid-rows-[minmax(170px,30vh)_minmax(0,1fr)] overflow-hidden rounded-[28px] border border-white/70 bg-white shadow-[0_30px_90px_rgba(15,23,42,0.22)] md:grid-cols-[0.92fr_1.08fr] md:grid-rows-1">
        <button onClick={onClose} aria-label="Mbyll" className="absolute right-4 top-4 z-20 grid h-10 w-10 place-items-center rounded-full border border-black/5 bg-white/90 text-zinc-700 shadow-md backdrop-blur transition hover:scale-105 hover:bg-white">
          <Close className="h-4 w-4" />
        </button>
        <div className="relative grid min-h-0 place-items-center overflow-hidden bg-gradient-to-br from-zinc-50 via-[#f5f5f7] to-zinc-100 px-7 py-5 md:min-h-[520px] md:px-10 md:py-9">
          <span aria-hidden="true" className="pointer-events-none absolute left-1/2 top-1/2 h-52 w-52 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/80 blur-3xl md:h-80 md:w-80" />
          {p.image
            ? <img src={p.image} alt={p.name} className="relative z-10 h-full max-h-[220px] w-full object-contain p-2 md:max-h-[480px]" />
            : <PhoneArt kind={p.kind} a={p.a} b={p.b} className="relative z-10 h-[85%] max-h-[230px] drop-shadow-[0_20px_30px_rgba(29,29,31,0.18)] md:max-h-[480px]" />}
        </div>
        <div className="flex min-h-0 flex-col overflow-y-auto p-5 sm:p-7 md:p-9">
          <div className="pr-10">
            <span className="inline-flex w-fit items-center rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-zinc-500">{p.tag || p.category}</span>
            <h3 id="quick-view-title" className="mt-3 text-2xl font-semibold leading-tight tracking-tight text-zinc-950 sm:text-3xl">{p.name}</h3>
            <p className="mt-2 text-[13px] leading-5 text-zinc-500">{p.sub}</p>
            <div className={`mt-4 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium ${isInStock ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${isInStock ? 'bg-emerald-500' : 'bg-amber-500'}`} />
              {stockLabel}
            </div>
          </div>
          {p.blurb && (
            <section className="mt-5 rounded-2xl border border-zinc-100 bg-zinc-50/80 p-4">
              <h4 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500">Përshkrimi dhe specifikat</h4>
              <p className="mt-3 whitespace-pre-line break-words text-[8px] leading-[1.7] text-zinc-600">{p.blurb}</p>
            </section>
          )}
          {(policies?.warranty || policies?.payment) && (
            <ul className="mt-4 grid gap-2 text-[11px] leading-4 text-zinc-500">
              {policies?.warranty && <li className="flex items-start gap-2 rounded-xl bg-zinc-50 px-3 py-2"><Shield className="mt-0.5 h-3.5 w-3.5 shrink-0 text-blue-600" /> {policies.warranty}</li>}
              {policies?.payment && <li className="flex items-start gap-2 rounded-xl bg-zinc-50 px-3 py-2"><Bolt className="mt-0.5 h-3.5 w-3.5 shrink-0 text-blue-600" /> {policies.payment}</li>}
            </ul>
          )}
          <div className="mt-auto pt-5">
            <div className="flex items-end justify-between gap-3 border-t border-zinc-100 pt-4">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-400">Çmimi</p>
                <p className="mt-0.5 text-2xl font-semibold tracking-tight text-zinc-950">{fmt(Number(p.price) || 0)}</p>
              </div>
              {p.priceUpdatedAt && <p className="pb-1 text-right text-[10px] leading-4 text-zinc-400">Përditësuar më<br />{new Date(p.priceUpdatedAt.replace(' ', 'T')).toLocaleDateString('sq-XK')}</p>}
            </div>
            <div className="mt-4 grid gap-2.5">
              <AddButton onAdd={() => onAdd(p)} disabled={p.stockStatus !== 'in_stock'} disabledLabel="Kontakto për disponueshmërinë" className="w-full rounded-xl py-3.5 text-sm shadow-sm" />
              {wa && <a href={wa} target="_blank" rel="noreferrer" className="btn-ghost flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm"><Whatsapp className="h-4 w-4" /> Pyet në WhatsApp</a>}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
