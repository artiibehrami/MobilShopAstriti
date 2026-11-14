import { useMemo, useState } from 'react'
import Field from './Field.jsx'
import { Check, Arrow, Whatsapp, Phone, Clock, Shield, Wrench } from './Icons.jsx'
import { REPAIR, ISSUES, SHOP, fmt } from '../data.js'

const SLOTS = ['09:00', '10:30', '12:00', '14:00', '15:30', '17:00', '18:30']
const STEPS = ['Marka', 'Modeli', 'Problemi', 'Çmimi dhe rezervimi']

const nextDays = () => {
  const out = []
  for (let i = 0; out.length < 6; i++) {
    const d = new Date(); d.setDate(d.getDate() + i)
    out.push({
      key: d.toISOString().slice(0, 10),
      label: i === 0 ? 'Sot' : i === 1 ? 'Nesër' : d.toLocaleDateString('sq-XK', { weekday: 'short' }),
      date: d.toLocaleDateString('sq-XK', { day: 'numeric', month: 'short' }),
    })
  }
  return out
}

const Choice = ({ active, onClick, children, sub }) => (
  <button onClick={onClick} aria-pressed={active}
    className={`group rounded-2xl border p-5 text-left lux hover:-translate-y-0.5 ${active ? 'border-amber-300/60 bg-amber-400/10 shadow-[0_0_30px_rgba(245,158,11,0.15)]' : 'border-white/10 bg-white/5 hover:border-white/30'}`}>
    <span className="block font-display text-2xl">{children}</span>
    {sub && <span className="mt-1 block text-xs text-white/45">{sub}</span>}
  </button>
)

export default function RepairView() {
  const [step, setStep] = useState(0)
  const [brand, setBrand] = useState(null)
  const [model, setModel] = useState(null)
  const [issue, setIssue] = useState(null)
  const [day, setDay] = useState(null)
  const [slot, setSlot] = useState(null)
  const [form, setForm] = useState({ name: '', phone: '' })
  const [busy, setBusy] = useState(false)
  const [ref, setRef] = useState('')
  const days = useMemo(nextDays, [])

  const price = model && issue ? model[issue.id] : 0
  const device = model ? model.m : ''
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })
  const canBook = day && slot && form.name.trim().length > 1 && form.phone.replace(/\D/g, '').length >= 6

  const reset = () => { setStep(0); setBrand(null); setModel(null); setIssue(null); setDay(null); setSlot(null); setRef('') }
  const summary = `Përshëndetje Astriti, dëshiroj ta riparoj: ${device} — ${issue?.label} (çmimi orientues ${fmt(price)}).` + (day ? ` Preferoj: ${day.label} ${day.date}, ${slot || 'çfarëdo orari'}.` : '')
  const wa = `https://wa.me/${SHOP.whatsapp}?text=${encodeURIComponent(summary)}`

  const book = async (e) => {
    e.preventDefault()
    if (!canBook || busy) return
    setBusy(true)
    let r = `REP-${Date.now().toString(36).toUpperCase().slice(-6)}`
    try {
      const res = await fetch('/api/repairs', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, device, issue: issue.label, quote: price, day: `${day.label} ${day.date}`, slot }),
      })
      if (res.ok) r = (await res.json()).ref || r
    } catch { /* offline fallback */ }
    setRef(r); setBusy(false)
  }

  return (
    <div className="relative isolate overflow-hidden px-5 pb-28 pt-32 sm:px-8 sm:pt-40">
      <div className="pointer-events-none absolute -right-40 top-0 -z-10 h-[34rem] w-[34rem] rounded-full bg-sky-500/15 blur-[140px]" />
      <div className="mx-auto max-w-4xl">
        <span className="glass inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs text-sky-200"><Wrench className="h-3.5 w-3.5" /> Servis profesional · Vushtrri</span>
        <h1 className="mt-6 animate-rise font-display text-5xl leading-[1] sm:text-6xl">Mëso çmimin para se të vish në dyqan.</h1>
        <p className="mt-4 max-w-xl animate-rise text-white/55 [animation-delay:120ms]">Zgjidh pajisjen dhe problemin. Merr një ofertë të qartë në euro, cakto termin ose na shkruaj drejtpërdrejt.</p>

        {/* progress */}
        <ol className="mt-10 grid grid-cols-4 gap-2" aria-label="Hapat e rezervimit">
          {STEPS.map((s, i) => (
            <li key={s}>
              <div className={`h-1 rounded-full lux ${i <= step ? 'bg-gradient-to-r from-amber-300 to-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.6)]' : 'bg-white/10'}`} />
              <span className={`mt-2 block text-xs lux ${i === step ? 'text-white' : 'text-white/35'}`}>{s}</span>
            </li>
          ))}
        </ol>

        <div className="glass-deep mt-8 rounded-[32px] p-6 shadow-[0_20px_50px_rgba(0,0,0,0.5)] sm:p-9">
          <div key={step + (ref ? 'x' : '')} className="animate-rise">
            {step === 0 && (
              <>
                <h2 className="font-display text-3xl">Zgjidh markën</h2>
                <div className="mt-6 grid gap-4 sm:grid-cols-3">
                  {Object.keys(REPAIR).map((b) => (
                    <Choice key={b} active={brand === b} sub={`${REPAIR[b].length} modele`} onClick={() => { setBrand(b); setModel(null); setIssue(null); setStep(1) }}>{b}</Choice>
                  ))}
                </div>
              </>
            )}

            {step === 1 && (
              <>
                <h2 className="font-display text-3xl">Zgjidh modelin {brand}</h2>
                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  {REPAIR[brand].map((m) => <Choice key={m.m} active={model?.m === m.m} onClick={() => { setModel(m); setIssue(null); setStep(2) }}>{m.m}</Choice>)}
                </div>
                <button onClick={() => setStep(0)} className="btn-ghost mt-6">Mbrapa</button>
              </>
            )}

            {step === 2 && (
              <>
                <h2 className="font-display text-3xl">Çfarë problemi ka pajisja {model.m}?</h2>
                <div className="mt-6 grid gap-4 sm:grid-cols-3">
                  {ISSUES.map((i) => (
                    <Choice key={i.id} active={issue?.id === i.id} sub={i.note} onClick={() => { setIssue(i); setStep(3) }}>
                      {i.label}<span className="mt-3 block font-sans text-sm text-amber-200">nga {fmt(model[i.id])}</span>
                    </Choice>
                  ))}
                </div>
                <button onClick={() => setStep(1)} className="btn-ghost mt-6">Mbrapa</button>
              </>
            )}

            {step === 3 && !ref && (
              <div className="grid gap-8 md:grid-cols-[0.9fr_1.1fr]">
                <div>
                  <p className="text-xs text-white/40">Oferta e çmimit</p>
                  <p className="mt-2 font-display text-7xl leading-none tracking-tight text-amber-200">{fmt(price)}</p>
                  <p className="mt-3 text-sm text-white/60">{device} · {issue.label}</p>
                  <ul className="mt-6 space-y-3 text-sm text-white/60">
                    <li className="flex items-center gap-3"><Clock className="h-4 w-4 text-sky-300" /> Koha e zakonshme: {issue.eta}</li>
                    <li className="flex items-center gap-3"><Shield className="h-4 w-4 text-sky-300" /> Garanci 6-mujore për servisim</li>
                    <li className="flex items-center gap-3"><Check className="h-4 w-4 text-sky-300" /> Pjesë cilësore, pa kosto të fshehta</li>
                  </ul>
                  <p className="mt-6 text-xs leading-relaxed text-white/35">Çmimi është orientues. Pas kontrollit falas e konfirmojmë shumën përfundimtare dhe nuk fillojmë punën pa miratimin tuaj.</p>
                  <div className="mt-6 grid gap-3">
                    <a href={wa} target="_blank" rel="noreferrer" className="btn-ghost flex items-center justify-center gap-2 !border-emerald-400/40 !text-emerald-200 hover:!bg-emerald-400/10"><Whatsapp className="h-4 w-4" /> Na shkruaj në WhatsApp</a>
                    <a href={`tel:${SHOP.phone}`} className="btn-ghost flex items-center justify-center gap-2"><Phone className="h-4 w-4" /> Telefono {SHOP.phoneDisplay}</a>
                  </div>
                </div>

                <form onSubmit={book} className="space-y-5">
                  <h2 className="font-display text-3xl">Rezervo termin</h2>
                  <div>
                    <p className="mb-2 text-xs text-white/40">Dita</p>
                    <div className="grid grid-cols-3 gap-2 sm:grid-cols-6 md:grid-cols-3 lg:grid-cols-6">
                      {days.map((d) => (
                        <button type="button" key={d.key} onClick={() => setDay(d)} aria-pressed={day?.key === d.key}
                          className={`rounded-xl border px-2 py-3 text-center lux ${day?.key === d.key ? 'border-amber-300/60 bg-amber-400/10' : 'border-white/10 hover:border-white/30'}`}>
                          <span className="block text-xs text-white/50">{d.label}</span><span className="block text-sm">{d.date}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="mb-2 text-xs text-white/40">Ora</p>
                    <div className="flex flex-wrap gap-2">
                      {SLOTS.map((s) => (
                        <button type="button" key={s} onClick={() => setSlot(s)} aria-pressed={slot === s}
                          className={`rounded-full border px-4 py-2 text-sm tabular-nums lux ${slot === s ? 'border-sky-300/60 bg-sky-400/10 text-sky-100' : 'border-white/10 text-white/60 hover:border-white/30'}`}>{s}</button>
                      ))}
                    </div>
                  </div>
                  <Field label="Emri dhe mbiemri" value={form.name} onChange={set('name')} autoComplete="name" required />
                  <Field label="Numri i telefonit" type="tel" value={form.phone} onChange={set('phone')} autoComplete="tel" required />
                  <div className="flex gap-3">
                    <button type="button" onClick={() => setStep(2)} className="btn-ghost">Mbrapa</button>
                    <button type="submit" disabled={!canBook || busy} className="btn-gold flex flex-1 items-center justify-center gap-2">
                      {busy ? 'Duke rezervuar…' : <>Konfirmo rezervimin <Arrow className="h-4 w-4" /></>}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {step === 3 && ref && (
              <div className="py-6 text-center">
                <div className="relative mx-auto grid h-24 w-24 place-items-center">
                  <span className="absolute inset-0 animate-pulseRing rounded-full bg-emerald-400/30" />
                  <span className="absolute inset-0 rounded-full border border-emerald-400/40 bg-emerald-400/10" />
                  <Check className="relative h-10 w-10 animate-pop text-emerald-300" />
                </div>
                <h2 className="mt-7 font-display text-4xl">Termini u rezervua, {form.name.split(' ')[0]}!</h2>
                <p className="mx-auto mt-3 max-w-md text-sm text-white/55">{device} · {issue.label} · {day.label} {day.date}, ora {slot}. Silleni pajisjen në dyqanin tonë në Vushtrri. Do t'ju telefonojmë nëse ndryshon diçka.</p>
                <p className="mt-5 font-mono text-sm tracking-wider text-amber-200">{ref}</p>
                <div className="mt-8 flex flex-wrap justify-center gap-3">
                  <a href={wa} target="_blank" rel="noreferrer" className="btn-ghost inline-flex items-center gap-2"><Whatsapp className="h-4 w-4" /> Dërgo detajet në WhatsApp</a>
                  <button onClick={reset} className="btn-gold">Kërko ofertë tjetër</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
