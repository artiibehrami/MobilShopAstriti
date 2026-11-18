import { useEffect, useState } from 'react'

const requestJson = async (response) => {
  const result = await response.json()
  if (!response.ok) throw new Error(result.error || 'Kërkesa nuk u krye.')
  return result
}

const inputClass = 'w-28 rounded-lg border border-black/10 px-2.5 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100'

export default function AdminProductManager() {
  const [products, setProducts] = useState([])
  const [drafts, setDrafts] = useState({})
  const [loading, setLoading] = useState(true)
  const [savingId, setSavingId] = useState(null)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  const loadProducts = async () => {
    setLoading(true)
    setError('')
    try {
      const result = await requestJson(await fetch('/api/admin/products'))
      if (!Array.isArray(result)) throw new Error('Serveri ktheu listë të pavlefshme të produkteve.')
      setProducts(result)
      setDrafts(Object.fromEntries(result.map((product) => [product.id, {
        price: String(product.price),
        stockQuantity: product.stockQuantity == null ? '' : String(product.stockQuantity),
        description: product.description || '',
        details: product.details || '',
      }])))
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Produktet nuk mund të ngarkohen.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProducts()
  }, [])

  const updateDraft = (productId, field, value) => {
    setDrafts((current) => ({ ...current, [productId]: { ...current[productId], [field]: value } }))
  }

  const saveProduct = async (product) => {
    const draft = drafts[product.id]
    const price = Number(draft?.price)
    const stockText = draft?.stockQuantity.trim() ?? ''
    const stockQuantity = stockText === '' ? null : Number(stockText)
    if (!Number.isFinite(price) || price < 0 || (stockQuantity !== null && (!Number.isSafeInteger(stockQuantity) || stockQuantity < 0))) {
      setError('Kontrolloni çmimin dhe stokun para ruajtjes.')
      return
    }

    setSavingId(product.id)
    setError('')
    setNotice('')
    try {
      const updated = await requestJson(await fetch(`/api/admin/products/${product.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          price,
          stockQuantity,
          description: draft.description,
          details: draft.details,
        }),
      }))
      setProducts((current) => current.map((item) => item.id === updated.id ? updated : item))
      setDrafts((current) => ({
        ...current,
        [updated.id]: {
          price: String(updated.price),
          stockQuantity: updated.stockQuantity == null ? '' : String(updated.stockQuantity),
          description: updated.description || '',
          details: updated.details || '',
        },
      }))
      setNotice(`Ndryshimet për “${updated.name}” u ruajtën.`)
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Produkti nuk mund të përditësohet.')
    } finally {
      setSavingId(null)
    }
  }

  const toggleProduct = async (product) => {
    setSavingId(product.id)
    setError('')
    setNotice('')
    try {
      const updated = await requestJson(await fetch(`/api/admin/products/${product.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !product.isActive }),
      }))
      setProducts((current) => current.map((item) => item.id === updated.id ? updated : item))
      setNotice(updated.isActive ? `“${updated.name}” u aktivizua.` : `“${updated.name}” u çaktivizua dhe nuk shfaqet në katalog.`)
    } catch (toggleError) {
      setError(toggleError instanceof Error ? toggleError.message : 'Gjendja e produktit nuk mund të ndryshohet.')
    } finally {
      setSavingId(null)
    }
  }

  return (
    <section className="mt-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold">Menaxho produktet</h2>
          <p className="mt-1 text-sm text-zinc-500">Përditëso përshkrimin, specifikat, çmimin dhe stokun, ose fshihe produktin nga katalogu.</p>
        </div>
        <button onClick={loadProducts} disabled={loading} className="btn-ghost shrink-0">
          {loading ? 'Duke ngarkuar…' : 'Rifresko'}
        </button>
      </div>

      {error && <p role="alert" className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
      {notice && <p role="status" className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{notice}</p>}
      {loading && <p role="status" className="py-12 text-center text-sm text-zinc-500">Duke ngarkuar produktet…</p>}
      {!loading && !error && products.length === 0 && (
        <div className="mt-6 rounded-3xl border border-black/5 bg-white p-10 text-center text-sm text-zinc-500">Nuk ka produkte në databazë.</div>
      )}

      {!loading && products.length > 0 && (
        <div className="mt-6 overflow-hidden rounded-2xl border border-black/5 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="bg-zinc-50 text-xs uppercase tracking-wide text-zinc-500">
                <tr>
                  <th className="px-4 py-4 font-medium">Produkti</th>
                  <th className="px-4 py-4 font-medium">Çmimi (€)</th>
                  <th className="px-4 py-4 font-medium">Stoku</th>
                  <th className="px-4 py-4 font-medium">Gjendja</th>
                  <th className="px-4 py-4 font-medium">Veprimet</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {products.map((product) => (
                  <tr key={product.id}>
                    <td className="px-4 py-4">
                      <p className="font-medium text-zinc-900">{product.name}</p>
                      <p className="mt-1 text-xs text-zinc-500">{[product.brand, product.category].filter(Boolean).join(' · ')}</p>
                      <details className="mt-2 max-w-sm">
                        <summary className="cursor-pointer text-xs font-medium text-blue-700">Redakto përshkrimin dhe specifikat</summary>
                        <div className="mt-3 space-y-3">
                          <label className="block text-xs font-medium text-zinc-600">
                            Përshkrimi i shkurtër
                            <textarea rows="2" maxLength={2000} value={drafts[product.id]?.description ?? ''}
                              onChange={(event) => updateDraft(product.id, 'description', event.target.value)}
                              className="mt-1.5 w-full rounded-lg border border-black/10 px-2.5 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
                          </label>
                          <label className="block text-xs font-medium text-zinc-600">
                            Specifikat / përshkrimi i plotë
                            <textarea rows="4" maxLength={5000} value={drafts[product.id]?.details ?? ''}
                              onChange={(event) => updateDraft(product.id, 'details', event.target.value)}
                              placeholder="Ekrani, memoria, kamera, bateria, gjendja dhe garancia…"
                              className="mt-1.5 w-full rounded-lg border border-black/10 px-2.5 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
                          </label>
                        </div>
                      </details>
                    </td>
                    <td className="px-4 py-4">
                      <label className="sr-only" htmlFor={`product-price-${product.id}`}>Çmimi për {product.name}</label>
                      <input id={`product-price-${product.id}`} type="number" min="0" max="99999999.99" step="0.01"
                        value={drafts[product.id]?.price ?? ''} onChange={(event) => updateDraft(product.id, 'price', event.target.value)}
                        className={inputClass} />
                    </td>
                    <td className="px-4 py-4">
                      <label className="sr-only" htmlFor={`product-stock-${product.id}`}>Stoku për {product.name}</label>
                      <input id={`product-stock-${product.id}`} type="number" min="0" step="1"
                        value={drafts[product.id]?.stockQuantity ?? ''} onChange={(event) => updateDraft(product.id, 'stockQuantity', event.target.value)}
                        placeholder="I panjohur" className={inputClass} />
                    </td>
                    <td className="px-4 py-4 text-xs">
                      <span className={`rounded-full px-2.5 py-1 font-medium ${product.isActive ? 'bg-emerald-50 text-emerald-800' : 'bg-zinc-100 text-zinc-600'}`}>
                        {product.isActive ? 'Aktiv' : 'I çaktivizuar'}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <button onClick={() => saveProduct(product)} disabled={savingId !== null}
                          className="rounded-lg bg-zinc-900 px-3 py-2 text-xs font-medium text-white hover:bg-zinc-700 disabled:opacity-50">
                          {savingId === product.id ? 'Duke ruajtur…' : 'Ruaj'}
                        </button>
                        <button onClick={() => toggleProduct(product)} disabled={savingId !== null}
                          className="rounded-lg border border-black/10 px-3 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-50">
                          {product.isActive ? 'Çaktivizo' : 'Aktivizo'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  )
}
