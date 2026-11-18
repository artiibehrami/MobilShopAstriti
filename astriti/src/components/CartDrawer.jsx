import { useEffect, useState } from 'react'
import PhoneArt from './PhoneArt.jsx'
import Field from './Field.jsx'
import { Bag, Close, Plus, Minus, Check, Arrow, Shield, Whatsapp } from './Icons.jsx'
import { fmt } from '../data.js'

export default function CartDrawer({ open, onClose, cart, dispatch, store, policies, cartSyncStatus, cartSyncError, onRetryCart }) {
  const [step, setStep] = useState('cart') // cart | checkout | done
  const [removing, setRemoving] = useState([])
  const [form, setForm] = useState({ name: '', phone: '', address: '' })
  const [busy, setBusy] = useState(false)
  const [orderRef, setOrderRef] = useState('')
  const [receipt, setReceipt] = useState(0)
  const [error, setError] = useState('')

  const total = cart.reduce((s, i) => s + i.price * i.qty, 0)
  const set = (k) => (e) => { setForm((current) => ({ ...current, [k]: e.target.value })); setError('') }
  const valid = form.name.trim().length > 1 && /[0-9]{6,}/.test(form.phone.replace(/\D/g, '')) && form.address.trim().length > 4
  
  const message = [
    `Përshëndetje ${store?.name || 'Mobil Shop Astriti'}, dua të bëj këtë porosi:`,
    ...cart.map((i) => `• ${i.qty} × ${i.name} — ${fmt(i.price * i.qty)}`),
    `Totali: ${fmt(total)}`,
    `Emri: ${form.name.trim()}`,
    `Telefoni: ${form.phone.trim()}`,
    `Adresa: ${form.address.trim()}`,
  ].join('\n')
  const whatsappUrl = store?.whatsapp ? `https://wa.me/${store.whatsapp}?text=${encodeURIComponent(message)}` : ''

  useEffect(() => { document.body.style.overflow = open ? 'hidden' : '' }, [open])
  useEffect(() => { if (!cart.length && step === 'checkout') setStep('cart') }, [cart.length, step])

  const remove = (id) => {
    setRemoving((r) => [...r, id])
    setTimeout(() => { dispatch({ type: 'remove', id }); setRemoving((r) => r.filter((x) => x !== id)) }, 380)
  }
  const close = () => {
    onClose()
    if (step === 'done') setTimeout(() => { setStep('cart'); setForm({ name: '', phone: '', address: '' }) }, 600)
  }

  const submit = async (e) => {
    e.preventDefault()
    if (!valid || busy || cartSyncStatus !== 'saved') return
    setBusy(true)
    try {
      const res = await fetch('/api/orders', {
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name: form.name,
          phone: form.phone,
          address: form.address,
        }),
      })
      const result = await res.json()
      if (!res.ok) throw new Error(result.error || 'Serveri nuk e pranoi porosinë.')
      if (!result.ref) throw new Error('Serveri nuk ktheu numrin e porosisë.')
      
      setOrderRef(result.ref)
      setReceipt(Number(result.total) || total)
      dispatch({ type: 'clear' })
      setStep('done')
    } catch (err) {
      console.error('Dështoi ruajtja e porosisë:', err)
      setError(err instanceof Error ? `Porosia nuk u ruajt: ${err.message}` : 'Porosia nuk u ruajt. Provo përsëri ose dërgoje në WhatsApp.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className={`fixed inset-0 z-[60] ${open ? '' : 'pointer-events-none'}`} aria-hidden={!open}>
      <div onClick={close} className={`absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity duration-700 ease-lux ${open ? 'opacity-100' : 'opacity-0'}`} />
      <aside role="dialog" aria-modal="true" aria-label="Shporta"
        className={`glass-deep absolute right-0 top-0 flex h-full w-full max-w-md flex-col shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-transform duration-700 ease-lux ${open ? 'translate-x-0' : 'translate-x-full'} rounded-l-[32px] max-sm:rounded-none`}>
        <header className="flex items-center justify-between border-b border-white/10 px-6 py-5">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">{step === 'checkout' ? 'Përfundo porosinë' : step === 'done' ? 'Porosia u ruajt' : 'Shporta jote'}</h2>
              {step === 'cart' && <p className="text-xs text-white/40">{cart.reduce((s, i) => s + i.qty, 0)} produkte</p>}
          </div>
          <button onClick={close} aria-label="Mbyll shportën" className="grid h-10 w-10 place-items-center rounded-full bg-zinc-100 text-zinc-700 lux hover:bg-zinc-200"><Close className="h-4 w-4" /></button>
        </header>

        {step === 'done' ? (
          <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
            <div className="relative grid h-28 w-28 place-items-center">
              <span className="absolute inset-0 animate-pulseRing rounded-full bg-emerald-400/30" />
              <span className="absolute inset-0 rounded-full border border-emerald-400/40 bg-emerald-400/10" />
              <svg viewBox="0 0 24 24" className="relative h-12 w-12 text-emerald-300" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="m5 12.5 4.5 4.5L19 7.5" strokeDasharray="24" strokeDashoffset="24" className="animate-draw" />
              </svg>
            </div>
            <h3 className="mt-8 animate-rise text-3xl font-semibold">Faleminderit, {form.name.split(' ')[0] || 'mik'}.</h3>
            <p className="mt-3 animate-rise text-sm leading-relaxed text-white/55 [animation-delay:150ms]">Porosia u ruajt me sukses në MySQL. Ekipi ynë do t’ju kontaktojë për dorëzimin.</p>
            <div className="glass mt-8 w-full animate-rise rounded-2xl p-5 text-left text-sm [animation-delay:300ms]">
              <div className="flex justify-between"><span className="text-white/45">Numri i porosisë</span><span className="font-mono tracking-wider text-blue-400">#{orderRef}</span></div>
              <div className="mt-2 flex justify-between"><span className="text-white/45">Totali, pagesa në dorëzim</span><span>{fmt(receipt)}</span></div>
            </div>
            <button onClick={close} className="btn-gold mt-8 w-full">Vazhdo blerjet</button>
          </div>
        ) : step === 'cart' ? (
          cart.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
              {cartSyncStatus === 'loading' ? (
                <p className="text-sm text-white/50">Duke ngarkuar shportën nga MySQL…</p>
              ) : cartSyncStatus === 'error' ? (
                <>
                  <p role="alert" className="text-sm text-red-700">{cartSyncError}</p>
                  <button onClick={onRetryCart} className="btn-ghost mt-6">Provo përsëri</button>
                </>
              ) : (
                <>
                  <div className="grid h-24 w-24 place-items-center rounded-full border border-white/10 bg-white/5 text-white/40"><Bag className="h-9 w-9" strokeWidth={1.1} /></div>
                  <h3 className="mt-6 text-2xl font-semibold">Shporta është bosh</h3>
                  <p className="mt-2 text-sm text-white/45">Shto një produkt nga katalogu për të vazhduar.</p>
                  <button onClick={close} className="btn-ghost mt-6">Shiko katalogun</button>
                </>
              )}
            </div>
          ) : (
            <>
              <ul className="flex-1 space-y-3 overflow-y-auto px-6 py-5">
                {cart.map((i) => (
                  <li key={i.id} className={`glass flex gap-4 rounded-2xl p-3 transition-all duration-[380ms] ease-lux ${removing.includes(i.id) ? 'translate-x-full opacity-0' : 'translate-x-0 opacity-100'}`}>
                    <div className="grid h-24 w-20 shrink-0 place-items-center overflow-hidden rounded-xl bg-[#f5f5f7]">
                      {i.image ? <img src={i.image} alt="" className="h-full w-full object-contain p-2" /> : <PhoneArt kind={i.kind} a={i.a} b={i.b} className="h-20" />}
                    </div>
                    <div className="flex min-w-0 flex-1 flex-col justify-between">
                      <div className="flex justify-between gap-2">
                        <div className="min-w-0"><p className="truncate font-display text-xl leading-tight">{i.name}</p><p className="truncate text-xs text-white/40">{i.sub}</p></div>
                        <button onClick={() => remove(i.id)} aria-label={`Remove ${i.name}`} className="h-7 w-7 shrink-0 text-white/30 lux hover:text-rose-300"><Close className="h-4 w-4" /></button>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center rounded-full border border-white/10 bg-black/20">
                          <button onClick={() => dispatch({ type: 'dec', id: i.id })} disabled={i.qty === 1} aria-label="Decrease quantity" className="grid h-8 w-8 place-items-center text-white/60 lux hover:text-white disabled:opacity-30"><Minus className="h-3.5 w-3.5" /></button>
                          <span className="w-6 text-center text-sm tabular-nums">{i.qty}</span>
                          <button onClick={() => dispatch({ type: 'inc', id: i.id })} aria-label="Increase quantity" className="grid h-8 w-8 place-items-center text-white/60 lux hover:text-white"><Plus className="h-3.5 w-3.5" /></button>
                        </div>
                        <p className="text-sm tabular-nums">{fmt(i.price * i.qty)}</p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
              <footer className="space-y-4 border-t border-white/10 px-6 py-5">
                {cartSyncStatus === 'saving' && <p className="text-xs text-white/45">Duke ruajtur shportën në MySQL…</p>}
                {cartSyncStatus === 'error' && <div role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
                  <p>{cartSyncError}</p>
                  <button onClick={onRetryCart} className="mt-2 font-medium underline">Provo përsëri</button>
                </div>}
                {policies?.delivery && <p className="text-xs leading-relaxed text-white/50">{policies.delivery}</p>}
                <div className="flex items-end justify-between"><span className="text-sm text-white/50">Totali</span><span className="text-3xl font-semibold">{fmt(total)}</span></div>
                <button onClick={() => setStep('checkout')} disabled={cartSyncStatus !== 'saved'} className="btn-gold flex w-full items-center justify-center gap-2">
                  {cartSyncStatus === 'saving' ? 'Duke ruajtur…' : 'Vazhdo te porosia'} {cartSyncStatus === 'saved' && <Arrow className="h-4 w-4" />}
                </button>
              </footer>
            </>
          )
        ) : (
          <form onSubmit={submit} className="flex flex-1 flex-col overflow-y-auto">
            <div className="flex-1 space-y-4 px-6 py-6">
              <p className="text-sm text-white/50">Plotëso të dhënat e dërgesës. Pagesa bëhet në dorëzim.</p>
              <Field label="Emri dhe mbiemri" value={form.name} onChange={set('name')} autoComplete="name" required />
              <Field label="Numri i telefonit" type="tel" value={form.phone} onChange={set('phone')} autoComplete="tel" required />
              <Field label="Adresa e dërgesës" textarea value={form.address} onChange={set('address')} autoComplete="street-address" required />
              <div className="glass rounded-2xl p-4 text-sm">
                {cart.map((i) => <div key={i.id} className="flex justify-between py-1 text-white/55"><span className="truncate pr-3">{i.qty} × {i.name}</span><span className="tabular-nums">{fmt(i.price * i.qty)}</span></div>)}
                <div className="mt-2 flex justify-between border-t border-white/10 pt-3"><span>Totali</span><span className="text-lg">{fmt(total)}</span></div>
              </div>
              <p className="flex items-center gap-2 text-xs text-white/40"><Shield className="h-4 w-4 text-sky-300" /> Të dhënat përdoren vetëm për organizimin e dërgesës.</p>
              {error && <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
            </div>
            <div className="flex gap-3 border-t border-white/10 px-6 py-5">
              <button type="button" onClick={() => setStep('cart')} className="btn-ghost">Kthehu</button>
              <button type="submit" disabled={!valid || busy || cartSyncStatus !== 'saved'} className="btn-gold flex flex-1 items-center justify-center gap-2">
                {busy ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-black/30 border-t-black" /> : <Check className="h-4 w-4" />} {busy ? 'Duke ruajtur…' : 'Ruaj porosinë'}
              </button>
            </div>
            {whatsappUrl && <a href={valid ? whatsappUrl : undefined} target="_blank" rel="noreferrer" aria-disabled={!valid}
              className={`mx-6 mb-5 flex items-center justify-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-5 py-3 text-sm font-medium text-emerald-800 transition-colors hover:bg-emerald-100 ${valid ? '' : 'pointer-events-none opacity-40'}`}>
              <Whatsapp className="h-4 w-4" /> Dërgo porosinë në WhatsApp
            </a>}
          </form>
        )}
      </aside>
    </div>
  )
}