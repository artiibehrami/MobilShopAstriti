import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Bag, Search, Phone, Wrench } from './Icons.jsx'

export default function Navbar({ count, openCart, store }) {
  const navigate = useNavigate()
  const location = useLocation()
  const tab = location.pathname === '/repair' ? 'repair' : 'shop'
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const goToShop = (target = 'collection') => {
    if (location.pathname !== '/') navigate('/')
    setTimeout(() => {
      const el = document.getElementById(target === 'search' ? 'product-search' : 'collection')
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      if (target === 'search') el?.focus({ preventScroll: true })
    }, 80)
  }
  const goToRepair = () => {
    if (location.pathname !== '/repair') navigate('/repair')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  const goHome = () => {
    if (location.pathname !== '/') navigate('/')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <header className="fixed inset-x-0 top-0 z-40 flex justify-center px-3 pt-3 sm:px-6 sm:pt-4">
      <nav className={`glass-deep flex w-full max-w-6xl items-center justify-between gap-2 rounded-full px-3 py-2 transition-all sm:px-5 ${scrolled ? 'shadow-[0_12px_36px_rgba(29,29,31,0.12)]' : 'shadow-[0_6px_24px_rgba(29,29,31,0.07)]'}`}>
        <button onClick={goHome} className="flex min-w-0 items-center gap-3 rounded-full pl-1 text-left" aria-label="Mobil Shop Astriti - ballina">
          <img src="/mobil-shop-logo.png" alt="Mobil Shop Astriti" className="h-9 w-32 shrink-0 object-contain" />
        </button>

        <div className="hidden items-center gap-1 md:flex">
          <button onClick={() => goToShop()} aria-current={tab === 'shop' ? 'page' : undefined} className={`rounded-full px-4 py-2 text-sm transition-colors ${tab === 'shop' ? 'bg-zinc-100 text-zinc-950' : 'text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900'}`}>Katalogu</button>
          <button onClick={goToRepair} aria-current={tab === 'repair' ? 'page' : undefined} className={`rounded-full px-4 py-2 text-sm transition-colors ${tab === 'repair' ? 'bg-zinc-100 text-zinc-950' : 'text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900'}`}>Servisi</button>
        </div>

        <div className="flex items-center gap-1 sm:gap-2">
          <button onClick={() => goToShop('search')} aria-label="Kërko produkte" className="grid h-10 w-10 place-items-center rounded-full text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-950"><Search /></button>
          {store?.phone && <a href={`tel:${store.phone}`} aria-label="Telefono Astriti" className="hidden items-center gap-2 rounded-full px-3 py-2 text-sm text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-950 lg:flex">
            <Phone className="h-4 w-4" /> {store.phoneDisplay?.split(' / ')[0] || store.phone}
          </a>}
          <button onClick={openCart} aria-label={`Hap shportën, ${count} produkte`} className="relative grid h-10 w-10 place-items-center rounded-full bg-zinc-900 text-white transition-colors hover:bg-zinc-700">
            <Bag />
            {count > 0 && <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-blue-600 px-1 text-[11px] font-semibold text-white">{count}</span>}
          </button>
        </div>
      </nav>

      <div className="glass-deep fixed inset-x-3 bottom-3 z-40 flex gap-1 rounded-full p-1 shadow-[0_12px_36px_rgba(29,29,31,0.16)] md:hidden">
        <button onClick={() => goToShop()} aria-current={tab === 'shop' ? 'page' : undefined} className={`flex flex-1 items-center justify-center gap-2 rounded-full py-3 text-sm transition-colors ${tab === 'shop' ? 'bg-zinc-900 text-white' : 'text-zinc-600'}`}><Search className="h-4 w-4" /> Katalogu</button>
        <button onClick={goToRepair} aria-current={tab === 'repair' ? 'page' : undefined} className={`flex flex-1 items-center justify-center gap-2 rounded-full py-3 text-sm transition-colors ${tab === 'repair' ? 'bg-zinc-900 text-white' : 'text-zinc-600'}`}><Wrench className="h-4 w-4" /> Servisi</button>
        <button onClick={openCart} className="relative flex flex-1 items-center justify-center gap-2 rounded-full py-3 text-sm text-zinc-600 transition-colors hover:bg-zinc-100"><Bag className="h-4 w-4" /> Shporta{count > 0 && <span className="font-semibold text-blue-700">{count}</span>}</button>
      </div>
    </header>
  )
}
