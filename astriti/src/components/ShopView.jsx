import { useMemo, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import ProductCard from './ProductCard.jsx'
import QuickView from './QuickView.jsx'
import { Search, Arrow, Shield, Wrench, Bolt, Close } from './Icons.jsx'

const SORTS = [['featured', 'Featured'], ['popular', 'Most coveted'], ['low', 'Price: low to high'], ['high', 'Price: high to low']]
const HERO_IMAGE = 'https://cdn.beebom.com/content/2026/06/iphone-18-pro-beebom_jpg(1).jpg'

export default function ShopView({ onAdd, store, policies }) {
  const navigate = useNavigate()
  const [q, setQ] = useState('')
  const [cat, setCat] = useState('All')
  const [sort, setSort] = useState('featured')
  const [quick, setQuick] = useState(null)
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [catalogError, setCatalogError] = useState('')
  const [reload, setReload] = useState(0)
  const goToRepair = () => {
    navigate('/repair')
    window.setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 0)
  }

  useEffect(() => {
    let active = true
    fetch('/api/products')
      .then((res) => {
        if (!res.ok) throw new Error(`Product API returned ${res.status}`)
        return res.json()
      })
      .then((data) => {
        if (!Array.isArray(data)) throw new Error('Product API returned an invalid response')
        if (active) setProducts(data)
      })
      .catch((err) => {
        console.error('Nuk u ngarkua katalogu nga API:', err)
        if (active) setCatalogError(err instanceof Error ? err.message : 'Produktet nuk mund të ngarkohen nga MySQL.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => { active = false }
  }, [reload])

  const categories = ['All', ...new Set(products.map((product) => product.category).filter(Boolean))]
  const list = useMemo(() => {
    let r = products.filter((p) =>
      (cat === 'All' || p.category === cat) &&
      `${p.name} ${p.brand || ''} ${p.sub || ''} ${p.category}`.toLowerCase().includes(q.trim().toLowerCase())
    )
    if (sort === 'popular') r = [...r].sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
    if (sort === 'low') r = [...r].sort((a, b) => Number(a.price) - Number(b.price))
    if (sort === 'high') r = [...r].sort((a, b) => Number(b.price) - Number(a.price))
    return r
  }, [products, q, cat, sort])

  return (
    <>
      {/* ───────── Hero ───────── */}
      <section className="relative isolate overflow-hidden px-5 pb-16 pt-32 sm:px-8 sm:pb-24 sm:pt-40">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -right-20 top-12 h-80 w-80 rounded-full bg-blue-100/70 blur-[100px]" />
        </div>

        <div className="mx-auto grid max-w-6xl items-center gap-8 lg:grid-cols-[1.1fr_1fr]">
          <div>
            <span className="inline-flex animate-rise items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-medium text-zinc-600 shadow-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Mobil Shop Astriti · Vushtrri
            </span>
            <h1 className="mt-7 animate-rise text-5xl font-semibold leading-[1.02] tracking-tight [animation-delay:120ms] sm:text-7xl">
              Teknologjia jote, <br />
              <span className="text-zinc-400">një hap më afër.</span>
            </h1>
            <p className="mt-6 max-w-md animate-rise text-base leading-relaxed text-white/55 [animation-delay:240ms]">
              Telefona, aksesorë dhe servis profesional. Zgjidh produktin tënd ose na vizito në dyqan.
            </p>
            <div className="mt-9 flex animate-rise flex-wrap gap-3 [animation-delay:360ms]">
              <a href="#collection" className="btn-gold inline-flex items-center gap-2">Shiko produktet <Arrow className="h-4 w-4" /></a>
              <button onClick={goToRepair} className="btn-ghost inline-flex items-center gap-2"><Wrench className="h-4 w-4" /> Rezervo servis</button>
            </div>
            <dl className="mt-10 grid max-w-md animate-rise grid-cols-3 gap-4 border-t border-black/10 pt-6 text-sm [animation-delay:480ms]">
              {[[Shield, 'Garanci', 'Për produktet'], [Bolt, 'Shpejt', 'Servis profesional'], [Wrench, 'Cilësi', 'Pjesë të besueshme']].map(([Ic, t, s]) => (
                <div key={t}><Ic className="h-4 w-4 text-sky-300" /><dt className="mt-2 text-white">{t}</dt><dd className="text-xs text-white/40">{s}</dd></div>
              ))}
            </dl>
          </div>

          <div className="mx-auto w-full max-w-md overflow-hidden rounded-[2rem] bg-white shadow-[0_20px_60px_rgba(29,29,31,0.08)]">
            <img src={HERO_IMAGE} alt="iPhone 18 Pro" className="h-[20rem] w-full object-contain sm:h-[28rem]" />
            <a href="#collection" className="flex items-center justify-center gap-2 border-t border-black/5 py-5 text-sm font-semibold text-zinc-900 transition-colors hover:bg-zinc-50">
              Get yours <Arrow className="h-4 w-4" />
            </a>
          </div>
        </div>
      </section>

      {/* ───────── Collection ───────── */}
      <section id="collection" className="mx-auto max-w-6xl scroll-mt-28 px-5 pb-28 sm:px-8">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Produktet</h2>
            <p className="mt-2 text-sm text-white/45">{list.length} produkte në katalog</p>
          </div>
          <div className="flex w-full flex-col gap-3 sm:flex-row md:w-auto">
            <label className="glass group relative flex items-center gap-3 rounded-full px-5 py-3 lux focus-within:border-sky-400/50 focus-within:shadow-[0_0_0_4px_rgba(56,189,248,0.08)] sm:w-72">
              <Search className="h-4 w-4 text-white/40" />
              <input id="product-search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Kërko produkte…" aria-label="Kërko produkte"
                className="w-full bg-transparent text-sm outline-none placeholder:text-white/30" />
              {q && <button onClick={() => setQ('')} aria-label="Clear search" className="text-white/40 hover:text-white"><Close className="h-4 w-4" /></button>}
            </label>
            <select value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Rendit produktet"
              className="glass cursor-pointer rounded-full px-5 py-3 text-sm outline-none lux hover:border-white/25">
              {SORTS.map(([v], i) => <option key={v} value={v}>{['Të rekomanduara', 'Më të kërkuarat', 'Çmimi: nga i ulëti', 'Çmimi: nga i larti'][i]}</option>)}
            </select>
          </div>
        </div>

        <div className="mt-8 flex gap-2 overflow-x-auto pb-2 [scrollbar-width:none]">
          {categories.map((c) => (
            <button key={c} onClick={() => setCat(c)} aria-pressed={cat === c}
              className={`shrink-0 rounded-full border px-5 py-2 text-sm lux ${cat === c ? 'border-amber-300/60 bg-amber-400/10 text-amber-100 shadow-[0_0_24px_rgba(245,158,11,0.12)]' : 'border-white/10 text-white/55 hover:border-white/30 hover:text-white'}`}>{({ All: 'Të gjitha', Smartphones: 'Telefona', Wearables: 'Ora inteligjente', Audio: 'Audio', Accessories: 'Aksesorë' })[c] || c}</button>
          ))}
        </div>

        {loading ? (
          <div className="glass mt-8 rounded-3xl py-20 text-center text-zinc-500">Duke ngarkuar produktet…</div>
        ) : catalogError ? (
          <div className="mt-8 rounded-3xl border border-red-200 bg-red-50 p-6 text-sm text-red-800" role="alert">
            <p>Produktet nuk u ngarkuan nga MySQL: {catalogError}</p>
            <button onClick={() => { setCatalogError(''); setLoading(true); setReload((value) => value + 1) }} className="mt-3 underline">Provo përsëri</button>
          </div>
        ) : list.length ? (
          <>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {list.map((p, i) => <ProductCard key={p.id ?? i} p={p} index={i} onAdd={onAdd} onQuick={setQuick} />)}
            </div>
          </>
        ) : (
          <div className="glass mt-8 rounded-3xl py-20 text-center">
            <p className="text-2xl font-semibold">{q || cat !== 'All' ? `Nuk u gjet asnjë produkt për “${q}”` : 'Katalogu është duke u përditësuar'}</p>
            <p className="mt-2 text-sm text-white/45">{q || cat !== 'All' ? 'Provo një kërkim ose kategori tjetër.' : 'Produktet do të shfaqen sapo të shtohen në databazë.'}</p>
            <button onClick={() => { setQ(''); setCat('All') }} className="btn-ghost mt-6">Pastro filtrat</button>
          </div>
        )}
      </section>
      <QuickView p={quick} onClose={() => setQuick(null)} onAdd={onAdd} store={store} policies={policies} />
    </>
  )
}