import { useState } from 'react'
import PhoneArt from './PhoneArt.jsx'
import { Check, Plus, Eye } from './Icons.jsx'
import { fmt } from '../data.js'

export function AddButton({ onAdd, className = '', disabled = false, disabledLabel = 'Nuk ka stok' }) {
  const [done, setDone] = useState(false)
  const click = (e) => {
    e.stopPropagation()
    onAdd()
    setDone(true)
    setTimeout(() => setDone(false), 1600)
  }
  return (
    <button onClick={click} aria-live="polite"
      disabled={disabled}
      className={`relative flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-medium transition-all active:scale-95 disabled:pointer-events-none disabled:opacity-40 ${done ? 'bg-emerald-100 text-emerald-800' : 'bg-zinc-900 text-white hover:bg-zinc-700'} ${className}`}>
      {done ? <><Check className="h-4 w-4" /> U shtua në shportë</> : disabled ? disabledLabel : <><Plus className="h-4 w-4" /> Shto në shportë</>}
    </button>
  )
}

export default function ProductCard({ p, onAdd, onQuick, index = 0 }) {
  const updatedDate = p.priceUpdatedAt ? new Date(p.priceUpdatedAt.replace(' ', 'T')).toLocaleDateString('sq-XK') : ''
  const stockLabel = p.stockStatus === 'in_stock' ? 'Në stok' : p.stockStatus === 'out_of_stock' ? 'Jashtë stokut' : 'Kontakto për stok'
  return (
    <article style={{ animationDelay: `${Math.min(index, 8) * 60}ms` }}
      className="group flex h-full animate-rise flex-col overflow-hidden rounded-[1.75rem] border border-black/[0.06] bg-white p-4 shadow-[0_6px_24px_rgba(29,29,31,0.05)] transition-all duration-300 hover:-translate-y-1 hover:border-black/[0.12] hover:shadow-[0_18px_44px_rgba(29,29,31,0.12)] sm:p-5">
      <div className="flex items-center justify-between text-[11px]">
        <span className="max-w-[65%] truncate rounded-full border border-black/[0.04] bg-zinc-50 px-3 py-1 font-medium tracking-wide text-zinc-600">{p.tag || p.category || 'Produkt'}</span>
        <span className="truncate pl-2 font-medium tracking-wide text-zinc-400">{p.brand}</span>
      </div>

      <div className="relative mt-4 grid w-full aspect-square place-items-center overflow-hidden rounded-[1.4rem] border border-black/[0.035] bg-[#f3f3f5]">
        <span aria-hidden="true" className="pointer-events-none absolute inset-x-7 top-6 aspect-square rounded-full bg-white/80 blur-2xl" />
        {p.image
          ? <img src={p.image} alt={p.name} loading="lazy" className="relative z-10 h-full w-full object-contain p-5 mix-blend-multiply transition-transform duration-500 group-hover:scale-[1.04]" />
          : <PhoneArt kind={p.kind} a={p.a} b={p.b} className="relative z-10 h-[82%] max-w-full transition-transform duration-500 group-hover:scale-[1.04]" />}
        <button onClick={() => onQuick(p)} aria-label={`Shiko ${p.name}`}
          className="absolute bottom-3 right-3 z-20 grid h-10 w-10 place-items-center rounded-full border border-black/[0.06] bg-white/95 text-zinc-700 shadow-sm transition-all hover:scale-105 hover:bg-white sm:translate-y-1 sm:opacity-0 sm:group-hover:translate-y-0 sm:group-hover:opacity-100 focus-visible:translate-y-0 focus-visible:opacity-100">
          <Eye className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-4 flex flex-1 flex-col">
        <h3 className="min-h-[2.75rem] line-clamp-2 text-[17px] font-semibold leading-[1.35] tracking-tight text-zinc-900">{p.name}</h3>
        <p className="mt-1 min-h-10 line-clamp-2 text-[13px] leading-5 text-zinc-500">{p.sub}</p>
        <p className={`mt-3 flex items-center gap-2 text-xs ${p.stockStatus === 'in_stock' ? 'text-emerald-700' : 'text-amber-700'}`}>
          <span className={`h-1.5 w-1.5 rounded-full ${p.stockStatus === 'in_stock' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
          {stockLabel}
        </p>
        <div className="mt-auto border-t border-black/[0.06] pt-4">
          <div className="min-w-0">
            <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-zinc-400">Çmimi</p>
            <p className="mt-0.5 text-2xl font-semibold tracking-tight text-zinc-900">{fmt(Number(p.price) || 0)}</p>
          </div>
          <AddButton onAdd={() => onAdd(p)} disabled={p.stockStatus !== 'in_stock'} disabledLabel={p.stockStatus === 'out_of_stock' ? 'Jashtë stokut' : 'Kontakto për stok'} className="mt-3 w-full gap-2 rounded-xl py-3 text-xs" />
          {updatedDate && <p className="mt-3 text-[10px] text-zinc-400">Përditësuar më {updatedDate}</p>}
        </div>
      </div>
    </article>
  )
}
