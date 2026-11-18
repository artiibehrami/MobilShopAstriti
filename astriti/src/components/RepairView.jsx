import { useEffect, useMemo, useState } from 'react'
import Field from './Field.jsx'
import { Check, Arrow, Whatsapp, Phone, Clock, Shield, Wrench } from './Icons.jsx'
import { fmt } from '../data.js'

const nextDays = () => {
  const out = []
  for (let i = 0; out.length < 6; i++) {
    const date = new Date()
    date.setDate(date.getDate() + i)
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
    out.push({
      key,
      label: i === 0 ? 'Sot' : i === 1 ? 'Nesër' : date.toLocaleDateString('sq-XK', { weekday: 'short' }),
      date: date.toLocaleDateString('sq-XK', { day: 'numeric', month: 'short' }),
    })
  }
  return out
}

const Choice = ({ active, onClick, children, sub }) => (
  <button type="button" onClick={onClick} aria-pressed={active}
    className={`group rounded-2xl border p-5 text-left lux hover:-translate-y-0.5 ${active ? 'border-amber-300/60 bg-amber-400/10 shadow-[0_0_30px_rgba(245,158,11,0.15)]' : 'border-white/10 bg-white/5 hover:border-white/30'}`}>
    <span className="block font-display text-2xl">{children}</span>
    {sub && <span className="mt-1 block text-xs text-white/45">{sub}</span>}
  </button>
)

const STEPS = ['Marka', 'Modeli', 'Problemi', 'Çmimi dhe rezervimi']

export default function RepairView({ store }) {
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [step, setStep] = useState(0)
  const [brand, setBrand] = useState('')
  const [model, setModel] = useState('')
  const [service, setService] = useState(null)
  const [day, setDay] = useState(null)
  const [slot, setSlot] = useState('')
  const [form, setForm] = useState({ name: '', phone: '' })
  const [busy, setBusy] = useState(false)
  const [bookingRef, setBookingRef] = useState('')
  const [bookingError, setBookingError] = useState('')
  const days = useMemo(nextDays, [])

  useEffect(() => {
    let active = true
    fetch('/api/repair-services')
      .then(async (response) => {
        const data = await response.json()
        if (!response.ok) throw new Error(data.error || 'Shërbimet nuk mund të ngarkohen.')
        if (!Array.isArray(data)) throw new Error('Përgjigjja për shërbimet nuk është e vlefshme.')
        if (active) setServices(data)
      })
      .catch((error) => {
        console.error('Nuk u ngarkuan shërbimet nga MySQL:', error)
        if (active) setLoadError(error instanceof Error ? error.message : 'Shërbimet nuk mund të ngarkohen nga MySQL.')
      })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])

  const brands = [...new Set(services.map((item) => item.brand))]
  const models = [...new Set(services.filter((item) => item.brand === brand).map((item) => item.model))]
  const issues = services.filter((item) => item.brand === brand && item.model === model)
  const slots = store?.appointmentSlots || []
  const canBook = Boolean(service && day && slot && form.name.trim().length > 1 && form.phone.replace(/\D/g, '').length >= 6)
  const set = (key) => (event) => {
    setForm((current) => ({ ...current, [key]: event.target.value }))
    setBookingError('')
  }
  const reset = () => {
    setStep(0)
    setBrand('')
    setModel('')
    setService(null)
    setDay(null)
    setSlot('')
    setBookingRef('')
    setBookingError('')
  }
  const device = service ? `${service.brand} ${service.model}` : ''
  const summary = service
    ? `Përshëndetje Astriti, dëshiroj servis për ${device} — ${service.issueLabel} (çmimi orientues ${fmt(service.quote)}).${day ? ` Preferoj: ${day.label} ${day.date}, ora ${slot}.` : ''}`
    : ''
  const whatsappUrl = store?.whatsapp && summary ? `https://wa.me/${store.whatsapp}?text=${encodeURIComponent(summary)}` : ''

  const book = async (event) => {
    event.preventDefault()
    if (!canBook || busy) return
    setBusy(true)
    setBookingError('')
    try {
      const response = await fetch('/api/repairs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: form.name, phone: form.phone, serviceId: service.id, day: day.key, slot }),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Rezervimi nuk mund të ruhet.')
      if (!result.ref) throw new Error('Serveri nuk ktheu numrin e rezervimit.')
      setBookingRef(result.ref)
    } catch (error) {
      console.error('Nuk u ruajt rezervimi në MySQL:', error)
      setBookingError(error instanceof Error ? error.message : 'Rezervimi nuk u ruajt në MySQL.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="relative isolate overflow-hidden px-5 pb-28 pt-32 sm:px-8 sm:pt-40">
      <div className="pointer-events-none absolute -right-40 top-0 -z-10 h-[34rem] w-[34rem] rounded-full bg-sky-500/15 blur-[140px]" />
      <div className="mx-auto max-w-4xl">
        <span className="glass inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs text-sky-200"><Wrench className="h-3.5 w-3.5" /> Servis profesional · {store?.city || 'Vushtrri'}</span>
        <h1 className="mt-6 animate-rise font-display text-5xl leading-[1] sm:text-6xl">Mëso çmimin para se të vish në dyqan.</h1>
        <p className="mt-4 max-w-xl animate-rise text-white/55 [animation-delay:120ms]">Zgjidh pajisjen dhe problemin. Merr një ofertë të qartë në euro, cakto termin ose na shkruaj drejtpërdrejt.</p>

        {!loading && !loadError && services.length > 0 && (
          <section aria-labelledby="repair-prices-heading" className="mt-8">
            <h2 id="repair-prices-heading" className="text-xl font-semibold tracking-tight">Çmimet orientuese</h2>
            <p className="mt-1 text-sm text-zinc-500">Zgjidh një shërbim për të parë ofertën dhe për të rezervuar termin.</p>
            <div className="mt-4 grid max-h-96 gap-3 overflow-y-auto pr-1 sm:grid-cols-2 lg:grid-cols-3">
              {services.map((item) => (
                <button key={item.id} type="button"
                  onClick={() => {
                    setBrand(item.brand)
                    setModel(item.model)
                    setService(item)
                    setDay(null)
                    setSlot('')
                    setBookingRef('')
                    setBookingError('')
                    setStep(3)
                  }}
                  className="group rounded-2xl border border-black/5 bg-white p-4 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-amber-300/60 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600">
                  <span className="block text-xs font-medium text-zinc-400">{item.brand} · {item.model}</span>
                  <span className="mt-2 block font-semibold text-zinc-900">{item.issueLabel}</span>
                  {item.estimatedTime && <span className="mt-1 block text-xs text-zinc-500">{item.estimatedTime}</span>}
                  <span className="mt-4 block text-2xl font-semibold tracking-tight text-amber-700">{fmt(item.quote)}</span>
                  <span className="mt-2 block text-xs font-medium text-zinc-500 group-hover:text-zinc-900">Zgjidh dhe rezervo →</span>
                </button>
              ))}
            </div>
          </section>
        )}

        {loading ? (
          <div className="glass-deep mt-8 rounded-[32px] p-8 text-center text-sm text-zinc-500" role="status">Duke ngarkuar shërbimet nga MySQL…</div>
        ) : loadError ? (
          <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-800" role="alert">Shërbimet nuk u ngarkuan nga MySQL: {loadError}</div>
        ) : services.length === 0 ? (
          <div className="glass-deep mt-8 rounded-[32px] p-8 text-center">
            <h2 className="text-xl font-semibold">Çmimet e servisit po përditësohen</h2>
            <p className="mt-2 text-sm text-zinc-600">Kontakto dyqanin për çmimet dhe terminet e servisit.</p>
            {store?.phone && <a href={`tel:${store.phone}`} className="btn-gold mt-5 inline-flex items-center gap-2"><Phone className="h-4 w-4" /> Telefono {store.phoneDisplay || store.phone}</a>}
          </div>
        ) : (
          <>
            <ol className="mt-10 grid grid-cols-4 gap-2" aria-label="Hapat e rezervimit">
              {STEPS.map((item, index) => (
                <li key={item}>
                  <div className={`h-1 rounded-full lux ${index <= step ? 'bg-gradient-to-r from-amber-300 to-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.6)]' : 'bg-white/10'}`} />
                  <span className={`mt-2 block text-xs lux ${index === step ? 'text-white' : 'text-white/35'}`}>{item}</span>
                </li>
              ))}
            </ol>

            <div className="glass-deep mt-8 rounded-[32px] p-6 shadow-[0_20px_50px_rgba(0,0,0,0.5)] sm:p-9">
              <div key={step + (bookingRef ? 'x' : '')} className="animate-rise">
                {step === 0 && (
                  <>
                    <h2 className="font-display text-3xl">Zgjidh markën</h2>
                    <div className="mt-6 grid gap-4 sm:grid-cols-3">
                      {brands.map((item) => <Choice key={item} active={brand === item} onClick={() => { setBrand(item); setModel(''); setService(null); setStep(1) }}>{item}</Choice>)}
                    </div>
                  </>
                )}
                {step === 1 && (
                  <>
                    <h2 className="font-display text-3xl">Zgjidh modelin {brand}</h2>
                    <div className="mt-6 grid gap-3 sm:grid-cols-2">
                      {models.map((item) => <Choice key={item} active={model === item} onClick={() => { setModel(item); setService(null); setStep(2) }}>{item}</Choice>)}
                    </div>
                    <button onClick={() => setStep(0)} className="btn-ghost mt-6">Mbrapa</button>
                  </>
                )}
                {step === 2 && (
                  <>
                    <h2 className="font-display text-3xl">Çfarë problemi ka pajisja {model}?</h2>
                    <div className="mt-6 grid gap-4 sm:grid-cols-3">
                      {issues.map((item) => (
                        <Choice key={item.id} active={service?.id === item.id} sub={item.issueNote} onClick={() => { setService(item); setStep(3) }}>
                          {item.issueLabel}<span className="mt-3 block font-sans text-sm text-amber-200">nga {fmt(item.quote)}</span>
                        </Choice>
                      ))}
                    </div>
                    <button onClick={() => setStep(1)} className="btn-ghost mt-6">Mbrapa</button>
                  </>
                )}
                {step === 3 && !bookingRef && service && (
                  <div className="grid gap-8 md:grid-cols-[0.9fr_1.1fr]">
                    <div>
                      <p className="text-xs text-white/40">Oferta e çmimit</p>
                      <p className="mt-2 font-display text-7xl leading-none tracking-tight text-amber-200">{fmt(service.quote)}</p>
                      <p className="mt-3 text-sm text-white/60">{device} · {service.issueLabel}</p>
                      <ul className="mt-6 space-y-3 text-sm text-white/60">
                        {service.estimatedTime && <li className="flex items-center gap-3"><Clock className="h-4 w-4 text-sky-300" /> Koha e zakonshme: {service.estimatedTime}</li>}
                        <li className="flex items-center gap-3"><Shield className="h-4 w-4 text-sky-300" /> Garancia konfirmohet sipas servisit</li>
                      </ul>
                      <p className="mt-6 text-xs leading-relaxed text-white/35">Çmimi është orientues dhe konfirmohet pas kontrollit të pajisjes.</p>
                      {whatsappUrl && <a href={whatsappUrl} target="_blank" rel="noreferrer" className="btn-ghost mt-6 flex items-center justify-center gap-2"><Whatsapp className="h-4 w-4" /> Na shkruaj në WhatsApp</a>}
                    </div>

                    <form onSubmit={book} className="space-y-5">
                      <h2 className="font-display text-3xl">Rezervo termin</h2>
                      <div>
                        <p className="mb-2 text-xs text-white/40">Dita</p>
                        <div className="grid grid-cols-3 gap-2 sm:grid-cols-6 md:grid-cols-3 lg:grid-cols-6">
                          {days.map((item) => (
                            <button type="button" key={item.key} onClick={() => setDay(item)} aria-pressed={day?.key === item.key}
                              className={`rounded-xl border px-2 py-3 text-center lux ${day?.key === item.key ? 'border-amber-300/60 bg-amber-400/10' : 'border-white/10 hover:border-white/30'}`}>
                              <span className="block text-xs text-white/50">{item.label}</span><span className="block text-sm">{item.date}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="mb-2 text-xs text-white/40">Ora</p>
                        <div className="flex flex-wrap gap-2">
                          {slots.map((item) => (
                            <button type="button" key={item} onClick={() => setSlot(item)} aria-pressed={slot === item}
                              className={`rounded-full border px-4 py-2 text-sm tabular-nums lux ${slot === item ? 'border-sky-300/60 bg-sky-400/10 text-sky-100' : 'border-white/10 text-white/60 hover:border-white/30'}`}>{item}</button>
                          ))}
                          {!slots.length && <p className="text-xs text-amber-700">Orari i termineve nuk është konfiguruar në databazë.</p>}
                        </div>
                      </div>
                      <Field label="Emri dhe mbiemri" value={form.name} onChange={set('name')} autoComplete="name" required />
                      <Field label="Numri i telefonit" type="tel" value={form.phone} onChange={set('phone')} autoComplete="tel" required />
                      {bookingError && <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{bookingError}</p>}
                      <div className="flex gap-3">
                        <button type="button" onClick={() => setStep(2)} className="btn-ghost">Mbrapa</button>
                        <button type="submit" disabled={!canBook || busy} className="btn-gold flex flex-1 items-center justify-center gap-2">
                          {busy ? 'Duke rezervuar…' : <>Konfirmo rezervimin <Arrow className="h-4 w-4" /></>}
                        </button>
                      </div>
                    </form>
                  </div>
                )}
                {step === 3 && bookingRef && (
                  <div className="py-6 text-center">
                    <div className="relative mx-auto grid h-24 w-24 place-items-center">
                      <span className="absolute inset-0 animate-pulseRing rounded-full bg-emerald-400/30" />
                      <span className="absolute inset-0 rounded-full border border-emerald-400/40 bg-emerald-400/10" />
                      <Check className="relative h-10 w-10 animate-pop text-emerald-300" />
                    </div>
                    <h2 className="mt-7 font-display text-4xl">Termini u rezervua, {form.name.split(' ')[0]}!</h2>
                    <p className="mx-auto mt-3 max-w-md text-sm text-white/55">{device} · {service.issueLabel} · {day.label} {day.date}, ora {slot}.</p>
                    <p className="mt-5 font-mono text-sm tracking-wider text-amber-200">{bookingRef}</p>
                    <div className="mt-8 flex flex-wrap justify-center gap-3">
                      {whatsappUrl && <a href={whatsappUrl} target="_blank" rel="noreferrer" className="btn-ghost inline-flex items-center gap-2"><Whatsapp className="h-4 w-4" /> Dërgo detajet në WhatsApp</a>}
                      <button onClick={reset} className="btn-gold">Rezervo servis tjetër</button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
