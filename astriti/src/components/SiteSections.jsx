import { useState } from 'react'
import Field from './Field.jsx'

export default function SiteSections({ content, loading }) {
  const [name, setName] = useState('')
  const [rating, setRating] = useState('5')
  const [comment, setComment] = useState('')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  if (!content) {
    if (!loading) return null
    return <div className="mx-auto max-w-6xl px-5 pb-12 text-sm text-zinc-500 sm:px-8" role="status">Duke ngarkuar informacionin e dyqanit…</div>
  }

  const submitReview = async (event) => {
    event.preventDefault()
    if (busy) return
    setBusy(true)
    setMessage('')
    setError('')
    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, rating: Number(rating), comment }),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Vlerësimi nuk u dërgua.')
      setName('')
      setComment('')
      setRating('5')
      setMessage('Faleminderit! Vlerësimi u ruajt dhe do të shfaqet pas shqyrtimit.')
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Vlerësimi nuk u ruajt në databazë.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mx-auto max-w-6xl space-y-20 px-5 pb-24 sm:px-8">
      <section aria-labelledby="policies-heading">
        <h2 id="policies-heading" className="text-3xl font-semibold tracking-tight sm:text-4xl">Dërgesa, garancia dhe kthimet</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {[
            ['Dërgesa dhe zonat', content.policies?.delivery],
            ['Garancia', content.policies?.warranty],
            ['Ndërrimi dhe kthimi', content.policies?.returns],
            ['Mënyra e pagesës', content.policies?.payment],
          ].filter(([, text]) => text).map(([title, text]) => (
            <article key={title} className="glass rounded-3xl p-6">
              <h3 className="font-semibold">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-zinc-600">{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section aria-labelledby="reviews-heading">
        <h2 id="reviews-heading" className="text-3xl font-semibold tracking-tight sm:text-4xl">Vlerësimet e klientëve</h2>
        {content.reviews?.length ? (
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {content.reviews.map((review) => (
              <article key={review.id} className="glass rounded-3xl p-6">
                <p className="text-amber-600" aria-label={`${review.rating} nga 5 yje`}>{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</p>
                <p className="mt-3 text-sm leading-relaxed text-zinc-700">{review.comment}</p>
                <p className="mt-4 text-sm font-semibold">{review.name}</p>
              </article>
            ))}
          </div>
        ) : <p className="mt-3 text-sm text-zinc-500">Nuk ka ende vlerësime të publikuara. Bëhu i pari që ndan përvojën.</p>}

        <form onSubmit={submitReview} className="glass mt-6 grid gap-4 rounded-3xl p-6 md:grid-cols-2">
          <Field label="Emri" value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" minLength={2} maxLength={100} required />
          <label className="flex items-center justify-between gap-4 rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-zinc-600">
            Vlerësimi
            <select value={rating} onChange={(event) => setRating(event.target.value)} className="bg-transparent text-zinc-900 outline-none" aria-label="Vlerësimi nga 1 deri në 5 yje">
              {[5, 4, 3, 2, 1].map((value) => <option key={value} value={value}>{value} / 5</option>)}
            </select>
          </label>
          <div className="md:col-span-2">
            <Field label="Shkruaj përvojën tënde" value={comment} onChange={(event) => setComment(event.target.value)} textarea minLength={15} maxLength={1000} required />
          </div>
          {message && <p role="status" className="text-sm text-emerald-700 md:col-span-2">{message}</p>}
          {error && <p role="alert" className="text-sm text-red-700 md:col-span-2">{error}</p>}
          <button type="submit" disabled={busy} className="btn-gold w-fit disabled:opacity-50 md:col-span-2">
            {busy ? 'Duke dërguar…' : 'Dërgo vlerësimin'}
          </button>
        </form>
      </section>

      <section aria-labelledby="faq-heading">
        <h2 id="faq-heading" className="text-3xl font-semibold tracking-tight sm:text-4xl">Pyetje të shpeshta</h2>
        {content.faqs?.length ? (
          <div className="mt-6 divide-y divide-black/10 rounded-3xl border border-black/5 bg-white px-6">
            {content.faqs.map((faq) => (
              <details key={faq.id} className="group py-5">
                <summary className="cursor-pointer list-none pr-6 font-medium marker:hidden">
                  {faq.question}
                </summary>
                <p className="mt-3 max-w-3xl text-sm leading-relaxed text-zinc-600">{faq.answer}</p>
              </details>
            ))}
          </div>
        ) : <p className="mt-3 text-sm text-zinc-500">Pyetjet e shpeshta do të shfaqen këtu.</p>}
      </section>
    </div>
  )
}
