import { Pin, Clock, Phone, Shield, Check, Bolt } from './Icons.jsx'
import { SHOP } from '../data.js'

export default function Footer({ setTab }) {
  const badges = [[Shield, 'Authorized Partner', 'Genuine products only'], [Check, '24-month warranty', 'On every device'], [Bolt, 'Pay on delivery', 'No online card needed']]
  return (
    <footer className="border-t border-black/5 bg-white px-5 pb-28 pt-14 sm:px-8 md:pb-10">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-4 sm:grid-cols-3">
          {badges.map(([Ic, t, s]) => (
            <div key={t} className="flex items-center gap-4 rounded-2xl border border-black/5 bg-[#f5f5f7] p-5">
              <span className="grid h-11 w-11 place-items-center rounded-full bg-blue-50 text-blue-700"><Ic className="h-5 w-5" /></span>
              <div><p className="text-sm">{t}</p><p className="text-xs text-white/40">{s}</p></div>
            </div>
          ))}
        </div>

        <div className="mt-14 grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-full bg-zinc-900 text-xl font-semibold text-white">A</span>
              <span className="text-xl font-semibold tracking-tight">Mobil Shop Astriti</span>
            </div>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-zinc-500">Telefona, aksesorë dhe servis profesional në Vushtrri.</p>
          </div>
          <div>
            <h4 className="text-sm font-semibold">Na vizito</h4>
            <p className="mt-4 flex gap-2 text-sm text-zinc-500"><Pin className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />{SHOP.address}<br />{SHOP.city}</p>
            <a href={`tel:${SHOP.phone}`} className="mt-3 flex gap-2 text-sm text-zinc-500 lux hover:text-zinc-900"><Phone className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />{SHOP.phoneDisplay}</a>
          </div>
          <div>
            <h4 className="text-sm font-semibold">Orari</h4>
            <ul className="mt-4 space-y-2 text-sm text-zinc-500">
              {SHOP.hours.map(([d, h]) => <li key={d} className="flex gap-2"><Clock className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" /><span>{d}<br /><span className="text-zinc-700">{h}</span></span></li>)}
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold">Shfleto</h4>
            <ul className="mt-4 space-y-2 text-sm text-zinc-500">
              <li><button onClick={() => setTab('shop')} className="lux hover:text-zinc-900">Katalogu</button></li>
              <li><button onClick={() => setTab('repair')} className="lux hover:text-zinc-900">Servisi</button></li>
              <li><a href={`https://wa.me/${SHOP.whatsapp}`} target="_blank" rel="noreferrer" className="lux hover:text-zinc-900">WhatsApp</a></li>
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
