import { useEffect, useState } from 'react'
import { fmt } from '../data.js'
import { whatsappLink } from '../whatsapp.js'

const STATUSES = ['Në pritje', 'Konfirmuar', 'Përfunduar', 'Anuluar']

const requestJson = async (response) => {
  const result = await response.json()
  if (!response.ok) throw new Error(result.error || 'Kërkesa nuk u krye.')
  return result
}

const formatDate = (value) => {
  if (!value) return 'Pa datë'
  const date = new Date(`${value}T00:00:00`)
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString('sq-XK')
}

export default function AdminAppointments() {
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [savingId, setSavingId] = useState(null)
  const [notice, setNotice] = useState('')

  const loadAppointments = async () => {
    setLoading(true)
    setError('')
    try {
      const result = await requestJson(await fetch('/api/admin/appointments'))
      if (!Array.isArray(result)) throw new Error('Serveri ktheu listë të pavlefshme të termineve.')
      setAppointments(result)
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Terminet nuk mund të ngarkohen.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAppointments()
  }, [])

  const updateStatus = async (appointmentId, status) => {
    setSavingId(appointmentId)
    setError('')
    setNotice('')
    try {
      const result = await requestJson(await fetch(`/api/admin/appointments/${appointmentId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      }))
      setAppointments((current) => current.map((appointment) =>
        appointment.id === result.id ? { ...appointment, status: result.status } : appointment
      ))
      setNotice('Statusi i terminit u përditësua.')
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : 'Statusi i terminit nuk mund të përditësohet.')
    } finally {
      setSavingId(null)
    }
  }

  return (
    <section className="mt-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold">Terminet e servisit</h2>
          <p className="mt-1 text-sm text-zinc-500">Shfaqen deri në 100 rezervimet më të fundit.</p>
        </div>
        <button onClick={loadAppointments} disabled={loading} className="btn-ghost shrink-0">
          {loading ? 'Duke ngarkuar…' : 'Rifresko'}
        </button>
      </div>

      {error && <p role="alert" className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
      {notice && <p role="status" className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{notice}</p>}
      {loading && <p role="status" className="py-12 text-center text-sm text-zinc-500">Duke ngarkuar terminet…</p>}
      {!loading && !error && appointments.length === 0 && (
        <div className="mt-6 rounded-3xl border border-black/5 bg-white p-10 text-center text-sm text-zinc-500">Nuk ka ende termine të rezervuara.</div>
      )}

      {!loading && appointments.length > 0 && (
        <div className="mt-6 overflow-hidden rounded-2xl border border-black/5 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-left text-sm">
              <thead className="bg-zinc-50 text-xs uppercase tracking-wide text-zinc-500">
                <tr>
                  <th className="px-5 py-4 font-medium">Klienti</th>
                  <th className="px-5 py-4 font-medium">Pajisja / problemi</th>
                  <th className="px-5 py-4 font-medium">Termini</th>
                  <th className="px-5 py-4 font-medium">Çmimi orientues</th>
                  <th className="px-5 py-4 font-medium">Statusi</th>
                  <th className="px-5 py-4 font-medium">Kontakt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {appointments.map((appointment) => {
                  const reference = appointment.bookingRef || `#${appointment.id}`
                  const message = `Përshëndetje ${appointment.customerName}, po ju kontaktojmë për terminin ${reference} për ${appointment.deviceModel} (${appointment.issueType}) më ${formatDate(appointment.appointmentDate)} në ${appointment.appointmentSlot || 'orë të pacaktuar'}.`
                  const link = whatsappLink(appointment.phone, message)
                  return (
                    <tr key={appointment.id} className="align-top">
                      <td className="px-5 py-4">
                        <p className="font-medium text-zinc-900">{appointment.customerName}</p>
                        <p className="mt-1 text-xs text-zinc-500">{appointment.phone}</p>
                        <p className="mt-1 font-mono text-[11px] text-zinc-400">{reference}</p>
                      </td>
                      <td className="px-5 py-4">
                        <p className="font-medium text-zinc-800">{appointment.deviceModel}</p>
                        <p className="mt-1 text-xs text-zinc-500">{appointment.issueType}</p>
                      </td>
                      <td className="px-5 py-4 text-zinc-700">
                        {formatDate(appointment.appointmentDate)}
                        {appointment.appointmentSlot && <p className="mt-1 text-xs text-zinc-500">{appointment.appointmentSlot}</p>}
                      </td>
                      <td className="px-5 py-4 text-zinc-700">
                        {appointment.estimatedCost == null ? '—' : fmt(appointment.estimatedCost)}
                      </td>
                      <td className="px-5 py-4">
                        <label className="sr-only" htmlFor={`appointment-status-${appointment.id}`}>Ndrysho statusin për terminin {reference}</label>
                        <select id={`appointment-status-${appointment.id}`} value={appointment.status || 'Në pritje'}
                          disabled={savingId !== null} onChange={(event) => updateStatus(appointment.id, event.target.value)}
                          className="rounded-lg border border-black/10 bg-white px-2.5 py-1.5 text-xs font-medium text-zinc-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:opacity-60">
                          {appointment.status && !STATUSES.includes(appointment.status) && <option value={appointment.status}>{appointment.status}</option>}
                          {STATUSES.map((status) => <option key={status} value={status}>{status}</option>)}
                        </select>
                      </td>
                      <td className="px-5 py-4">
                        {link
                          ? <a href={link} target="_blank" rel="noreferrer" className="inline-flex whitespace-nowrap rounded-lg bg-emerald-600 px-3 py-2 text-xs font-medium text-white hover:bg-emerald-700">WhatsApp</a>
                          : <span className="text-xs text-zinc-400">Numër jo i vlefshëm</span>}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  )
}
