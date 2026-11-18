import { useNavigate } from 'react-router-dom'
import { Pin, Clock, Phone, Shield, Check, Bolt } from './Icons.jsx'

export default function Footer({ store, policies }) {
  const navigate = useNavigate()
  const badges = [
    [Shield, 'Dërgesa', policies?.delivery],
    [Check, 'Garancia', policies?.warranty],
    [Bolt, 'Pagesa', policies?.payment],
  ]
  const goToShop = () => {
    navigate('/')
    window.setTimeout(() => document.getElementById('collection')?.scrollIntoView({ behavior: 'smooth' }), 80)
  }
  const goToRepair = () => {
    navigate('/repair')
    window.setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 0)
  }

  return (
    <footer className="border-t border-black/5 bg-white px-5 pb-28 pt-14 sm:px-8 md:pb-10">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-4 sm:grid-cols-3">
          {badges.filter(([, , text]) => text).map(([Ic, t, s]) => (
            <div key={t} className="flex items-center gap-4 rounded-2xl border border-black/5 bg-[#f5f5f7] p-5">
              <span className="grid h-11 w-11 place-items-center rounded-full bg-blue-50 text-blue-700"><Ic className="h-5 w-5" /></span>
              <div><p className="text-sm">{t}</p><p className="text-xs text-white/40">{s}</p></div>
            </div>
          ))}
        </div>

        <div className="mt-14 grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-3">
              <img src="/mobil-shop-logo.png" alt="" className="h-10 w-36 object-contain object-left" />
            </div>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-zinc-500">Telefona, aksesorë dhe servis profesional në {store?.city || 'Vushtrri'}.</p>
          </div>
          <div>
            <h4 className="text-sm font-semibold">Na vizito</h4>
            <p className="mt-4 flex gap-2 text-sm text-zinc-500"><Pin className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" /><span>{store?.address}<br />{store?.city}</span></p>
            {store?.mapUrl && <a href={store.mapUrl} target="_blank" rel="noreferrer" className="mt-3 inline-flex text-sm text-blue-700 underline">Merr udhëzimet</a>}
            {store?.phone && <a href={`tel:${store.phone}`} className="mt-3 flex gap-2 text-sm text-zinc-500 lux hover:text-zinc-900"><Phone className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />{store.phoneDisplay || store.phone}</a>}
          </div>
          <div>
            <h4 className="text-sm font-semibold">Orari</h4>
            <ul className="mt-4 space-y-2 text-sm text-zinc-500">
              {(store?.openingHours || []).map(({ days, hours }) => <li key={days} className="flex gap-2"><Clock className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" /><span>{days}<br /><span className="text-zinc-700">{hours}</span></span></li>)}
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold">Shfleto</h4>
            <ul className="mt-4 space-y-2 text-sm text-zinc-500">
              <li><button onClick={goToShop} className="lux hover:text-zinc-900">Katalogu</button></li>
              <li><button onClick={goToRepair} className="lux hover:text-zinc-900">Servisi</button></li>
              {store?.whatsapp && <li><a href={`https://wa.me/${store.whatsapp}`} target="_blank" rel="noreferrer" className="lux hover:text-zinc-900">WhatsApp</a></li>}
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col justify-between gap-2 border-t border-black/10 pt-6 text-xs text-zinc-400 sm:flex-row">
          <p>© {new Date().getFullYear()} Mobil Shop Astriti. Të gjitha të drejtat e rezervuara.</p>
          <p>Çmimet janë në euro.</p>
        </div>
      </div>
    </footer>
  )
}
