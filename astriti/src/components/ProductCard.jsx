import { useState } from 'react'
import PhoneArt from './PhoneArt.jsx'
import { Check, Plus, Eye } from './Icons.jsx'
import { fmt } from '../data.js'

export function AddButton({ onAdd, className = '' }) {
  const [done, setDone] = useState(false)
  const click = (e) => {
    e.stopPropagation()
    onAdd()
    setDone(true)
    setTimeout(() => setDone(false), 1600)
  }
  return (
    <button onClick={click} aria-live="polite"
      className={`relative flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-medium transition-all active:scale-95 disabled:pointer-events-none disabled:opacity-40 ${done ? 'bg-emerald-100 text-emerald-800' : 'bg-zinc-900 text-white hover:bg-zinc-700'} ${className}`}>
      {done ? <><Check className="h-4 w-4" /> U shtua në shportë</> : <><Plus className="h-4 w-4" /> Shto në shportë</>}
    </button>
  )
}

export default function ProductCard({ p, onAdd, onQuick, index = 0 }) {
  return (
    <article style={{ animationDelay: `${Math.min(index, 8) * 60}ms` }}
      className="group animate-rise overflow-hidden rounded-3xl border border-black/[0.06] bg-white p-4 shadow-[0_4px_20px_rgba(29,29,31,0.04)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_14px_36px_rgba(29,29,31,0.1)] sm:p-5">
      <div className="flex items-center justify-between text-[11px]">
        <span className="rounded-full bg-zinc-100 px-3 py-1 text-zinc-600">{p.tag || p.category || 'Produkt'}</span>
        <span className="text-zinc-400">{p.brand}</span>
      </div>

      <div className="relative mx-auto mt-3 grid h-60 place-items-center overflow-hidden rounded-2xl bg-[#f5f5f7] sm:h-64">
        {p.image
          ? <img src={p.image} alt={p.name} loading="lazy" className="relative h-full w-full object-contain p-5 transition-transform duration-500 group-hover:scale-105" />
          : <PhoneArt kind={p.kind} a={p.a} b={p.b} className="relative h-52 transition-transform duration-500 group-hover:scale-105" />}
        <button onClick={() => onQuick(p)} aria-label={`Shiko ${p.name}`}
          className="absolute bottom-3 right-3 grid h-10 w-10 translate-y-1 place-items-center rounded-full bg-white/90 text-zinc-700 opacity-0 shadow-md transition-all hover:bg-white group-hover:translate-y-0 group-hover:opacity-100 focus-visible:translate-y-0 focus-visible:opacity-100">
          <Eye className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-4">
        <h3 className="text-xl font-semibold leading-tight tracking-tight">{p.name}</h3>
        <p className="mt-1 min-h-5 text-sm text-zinc-500">{p.sub}</p>
        <div className="mt-5 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[11px] text-zinc-400">Çmimi</p>
            <p className="text-xl font-semibold tracking-tight">{fmt(Number(p.price) || 0)}</p>
          </div>
          <AddButton onAdd={() => onAdd(p)} className="shrink-0 gap-1.5 px-3 py-2 text-xs" />
        </div>
      </div>
    </article>
  )
}
