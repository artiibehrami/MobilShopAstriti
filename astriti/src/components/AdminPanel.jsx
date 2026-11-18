import { useState } from 'react'

const EMPTY_FORM = {
  title: '',
  brand: '',
  category: 'Smartphones',
  price: '',
  stockQuantity: '',
  imageUrl: '',
  tag: '',
  description: '',
  details: '',
}

const inputClass = 'mt-1.5 w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm text-zinc-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100'

export default function AdminPanel() {
  const [form, setForm] = useState(EMPTY_FORM)
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState({ type: '', text: '' })

  const update = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
    setStatus({ type: '', text: '' })
  }

  const submit = async (event) => {
    event.preventDefault()
    if (loading) return
    setLoading(true)
    setStatus({ type: '', text: '' })
    try {
      const response = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Produkti nuk mund të ruhet.')
      setForm({ ...EMPTY_FORM })
      setStatus({ type: 'success', text: `Produkti u ruajt në MySQL (ID ${result.id}).` })
    } catch (error) {
      setStatus({ type: 'error', text: error instanceof Error ? error.message : 'Produkti nuk mund të ruhet në MySQL.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="mx-auto mt-8 max-w-3xl rounded-3xl border border-black/5 bg-white p-6 shadow-sm sm:p-8">
      <h2 className="text-2xl font-semibold tracking-tight">Shto produkt në katalog</h2>
      <p className="mt-1 text-sm text-zinc-500">Produkti i ri ruhet në MySQL dhe shfaqet në katalog.</p>

      {status.text && (
        <p role={status.type === 'error' ? 'alert' : 'status'}
          className={`mt-5 rounded-xl border px-4 py-3 text-sm ${status.type === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-red-200 bg-red-50 text-red-700'}`}>
          {status.text}
        </p>
      )}

      <form onSubmit={submit} className="mt-6 grid gap-5 sm:grid-cols-2">
        <label className="text-sm font-medium text-zinc-700 sm:col-span-2">
          Emri i produktit *
          <input name="title" value={form.title} onChange={update} required maxLength={150} placeholder="p.sh. iPhone 16 Pro 256GB" className={inputClass} />
        </label>

        <label className="text-sm font-medium text-zinc-700">
          Marka
          <input name="brand" value={form.brand} onChange={update} maxLength={80} placeholder="p.sh. Apple" className={inputClass} />
        </label>

        <label className="text-sm font-medium text-zinc-700">
          Kategoria *
          <select name="category" value={form.category} onChange={update} className={inputClass}>
            <option value="Smartphones">Telefona</option>
            <option value="Wearables">Ora inteligjente</option>
            <option value="Audio">Audio</option>
            <option value="Accessories">Aksesorë</option>
          </select>
        </label>

        <label className="text-sm font-medium text-zinc-700">
          Çmimi (€) *
          <input name="price" type="number" value={form.price} onChange={update} required min="0" max="99999999.99" step="0.01" placeholder="p.sh. 499" className={inputClass} />
        </label>

        <label className="text-sm font-medium text-zinc-700">
          Stoku (opsional)
          <input name="stockQuantity" type="number" value={form.stockQuantity} onChange={update} min="0" step="1" placeholder="Bosh = i panjohur" className={inputClass} />
        </label>

        <label className="text-sm font-medium text-zinc-700">
          Etiketa
          <input name="tag" value={form.tag} onChange={update} maxLength={80} placeholder="p.sh. I ri" className={inputClass} />
        </label>

        <label className="text-sm font-medium text-zinc-700">
          Linku i fotos (URL)
          <input name="imageUrl" type="url" value={form.imageUrl} onChange={update} maxLength={1000} placeholder="https://..." className={inputClass} />
        </label>

        <label className="text-sm font-medium text-zinc-700 sm:col-span-2">
          Përshkrimi i shkurtër
          <textarea name="description" value={form.description} onChange={update} maxLength={2000} rows="2" placeholder="Përmbledhje që shfaqet në kartelë" className={inputClass} />
        </label>

        <label className="text-sm font-medium text-zinc-700 sm:col-span-2">
          Detajet e produktit *
          <textarea name="details" value={form.details} onChange={update} required maxLength={5000} rows="4" placeholder="Ekrani, memoria, kamera, bateria, gjendja dhe garancia..." className={inputClass} />
        </label>

        <button type="submit" disabled={loading} className="btn-gold w-full disabled:opacity-50 sm:col-span-2">
          {loading ? 'Duke ruajtur…' : 'Ruaj produktin'}
        </button>
      </form>
    </section>
  )
}
