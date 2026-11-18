import { useEffect, useState } from 'react'
import AdminPanel from './AdminPanel.jsx'
import { fmt } from '../data.js'

const requestJson = async (response) => {
  const result = await response.json()
  if (!response.ok) throw new Error(result.error || 'Kërkesa nuk u krye.')
  return result
}

const formatDate = (value) => {
  const date = new Date(String(value).replace(' ', 'T'))
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString('sq-XK')
}

const ORDER_STATUSES = [
  { value: 'Pending', label: 'Në pritje' },
  { value: 'Confirmed', label: 'E konfirmuar' },
  { value: 'Preparing', label: 'Duke u përgatitur' },
  { value: 'Ready', label: 'Gati për dorëzim' },
  { value: 'Completed', label: 'Përfunduar' },
  { value: 'Cancelled', label: 'Anuluar' },
]

export default function AdminDashboard() {
  const [sessionState, setSessionState] = useState('checking')
  const [sessionError, setSessionError] = useState('')
  const [sessionAttempt, setSessionAttempt] = useState(0)
  const [password, setPassword] = useState('')
  const [loginBusy, setLoginBusy] = useState(false)
  const [activeTab, setActiveTab] = useState('orders')
  const [orders, setOrders] = useState([])
  const [ordersLoading, setOrdersLoading] = useState(false)
  const [ordersError, setOrdersError] = useState('')
  const [ordersReload, setOrdersReload] = useState(0)
  const [statusFilter, setStatusFilter] = useState('all')
  const [updatingOrderId, setUpdatingOrderId] = useState(null)
  const [orderStatusError, setOrderStatusError] = useState('')

  useEffect(() => {
    let active = true
    const checkSession = async () => {
      setSessionState('checking')
      setSessionError('')
      try {
        const response = await fetch('/api/admin/session')
        const result = await response.json()
        if (response.status === 503) {
          if (active) {
            setSessionState('unconfigured')
            setSessionError(result.error || 'Konfigurimi i administratorit mungon.')
          }
          return
        }
        if (!response.ok) throw new Error(result.error || 'Sesioni i administratorit nuk mund të kontrollohet.')
        if (active) setSessionState(result.authenticated ? 'authenticated' : 'anonymous')
      } catch (error) {
        if (active) {
          setSessionState('error')
          setSessionError(error instanceof Error ? error.message : 'Serveri nuk u arrit.')
        }
      }
    }
    checkSession()
    return () => { active = false }
  }, [sessionAttempt])

  useEffect(() => {
    if (sessionState !== 'authenticated' || activeTab !== 'orders') return
    let active = true
    const loadOrders = async () => {
      setOrdersLoading(true)
      setOrdersError('')
      try {
        const result = await requestJson(await fetch('/api/admin/orders'))
        if (!Array.isArray(result)) throw new Error('Serveri ktheu një listë të pavlefshme të porosive.')
        if (active) setOrders(result)
      } catch (error) {
        if (active) {
          setOrdersError(error instanceof Error ? error.message : 'Porositë nuk mund të ngarkohen.')
          if (error instanceof Error && error.message === 'Duhet të kyçeni si administrator.') setSessionState('anonymous')
        }
      } finally {
        if (active) setOrdersLoading(false)
      }
    }
    loadOrders()
    return () => { active = false }
  }, [sessionState, activeTab, ordersReload])

  const login = async (event) => {
    event.preventDefault()
    if (loginBusy) return
    setLoginBusy(true)
    setSessionError('')
    try {
      await requestJson(await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      }))
      setPassword('')
      setSessionState('authenticated')
    } catch (error) {
      setSessionError(error instanceof Error ? error.message : 'Hyrja dështoi.')
    } finally {
      setLoginBusy(false)
    }
  }

  const logout = async () => {
    setSessionError('')
    try {
      await requestJson(await fetch('/api/admin/logout', { method: 'POST' }))
      setOrders([])
      setSessionState('anonymous')
    } catch (error) {
      setSessionError(error instanceof Error ? error.message : 'Dalja dështoi.')
    }
  }

  const updateOrderStatus = async (orderId, status) => {
    setUpdatingOrderId(orderId)
    setOrderStatusError('')
    try {
      const result = await requestJson(await fetch(`/api/admin/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      }))
      setOrders((current) => current.map((order) => order.id === result.id ? { ...order, status: result.status } : order))
    } catch (error) {
      setOrderStatusError(error instanceof Error ? error.message : 'Statusi i porosisë nuk mund të përditësohet.')
    } finally {
      setUpdatingOrderId(null)
    }
  }

  const filteredOrders = statusFilter === 'all'
    ? orders
    : orders.filter((order) => (order.status || 'Pending') === statusFilter)
  const availableStatuses = [...new Set([...ORDER_STATUSES.map(({ value }) => value), ...orders.map((order) => order.status).filter(Boolean)])]

  if (sessionState === 'checking') {
    return <main className="mx-auto max-w-6xl px-5 py-32 text-center text-sm text-zinc-500">Duke kontrolluar hyrjen…</main>
  }

  if (sessionState === 'unconfigured' || sessionState === 'error') {
    return (
      <main className="mx-auto max-w-xl px-5 py-32">
        <section className="rounded-3xl border border-red-200 bg-white p-8 shadow-sm">
          <h1 className="text-2xl font-semibold">Paneli i administratorit</h1>
          <p role="alert" className="mt-4 text-sm leading-relaxed text-red-700">{sessionError}</p>
          {sessionState === 'error' && <button onClick={() => setSessionAttempt((attempt) => attempt + 1)} className="btn-ghost mt-5">Provo përsëri</button>}
        </section>
      </main>
    )
  }

  if (sessionState === 'anonymous') {
    return (
      <main className="mx-auto max-w-md px-5 py-32">
        <section className="rounded-3xl border border-black/5 bg-white p-8 shadow-[0_12px_36px_rgba(29,29,31,0.08)]">
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-blue-700">Mobil Shop Astriti</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight">Hyrje për administratorin</h1>
          <p className="mt-2 text-sm text-zinc-500">Kyçu për të parë porositë dhe për të menaxhuar katalogun.</p>
          <form onSubmit={login} className="mt-6 space-y-4">
            <label className="block text-sm font-medium text-zinc-700">
              Fjalëkalimi
              <input autoComplete="current-password" type="password" value={password} onChange={(event) => setPassword(event.target.value)}
                required className="mt-2 w-full rounded-xl border border-black/10 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
            </label>
            {sessionError && <p role="alert" className="text-sm text-red-700">{sessionError}</p>}
            <button type="submit" disabled={loginBusy} className="btn-gold w-full disabled:opacity-50">
              {loginBusy ? 'Duke hyrë…' : 'Hyr në panel'}
            </button>
          </form>
        </section>
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-6xl px-5 pb-24 pt-32 sm:px-8">
      <header className="flex flex-col justify-between gap-5 border-b border-black/10 pb-6 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-blue-700">Mobil Shop Astriti</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">Paneli i administratorit</h1>
          <p className="mt-1 text-sm text-zinc-500">Porositë dhe produktet e dyqanit</p>
        </div>
        <button onClick={logout} className="btn-ghost self-start sm:self-auto">Dil nga llogaria</button>
      </header>

      <nav className="mt-6 flex w-fit gap-1 rounded-xl bg-zinc-100 p-1" aria-label="Seksionet e panelit">
        <button onClick={() => setActiveTab('orders')} aria-current={activeTab === 'orders' ? 'page' : undefined}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition ${activeTab === 'orders' ? 'bg-white text-blue-700 shadow-sm' : 'text-zinc-600 hover:text-zinc-950'}`}>
          Porositë
        </button>
        <button onClick={() => setActiveTab('addProduct')} aria-current={activeTab === 'addProduct' ? 'page' : undefined}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition ${activeTab === 'addProduct' ? 'bg-white text-blue-700 shadow-sm' : 'text-zinc-600 hover:text-zinc-950'}`}>
          Shto produkt
        </button>
      </nav>

      {sessionError && <p role="alert" className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{sessionError}</p>}

      {activeTab === 'orders' ? (
        <section className="mt-8">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold">Porositë e fundit</h2>
              <p className="mt-1 text-sm text-zinc-500">Shfaqen deri në 100 porositë më të fundit.</p>
            </div>
            <div className="flex flex-wrap items-center justify-end gap-2">
              <label className="sr-only" htmlFor="order-status-filter">Filtro porositë sipas statusit</label>
              <select id="order-status-filter" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}
                className="rounded-xl border border-black/10 bg-white px-3 py-2.5 text-sm text-zinc-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100">
                <option value="all">Të gjitha statuset</option>
                {availableStatuses.map((status) => (
                  <option key={status} value={status}>{ORDER_STATUSES.find((item) => item.value === status)?.label || status}</option>
                ))}
              </select>
              <button onClick={() => setOrdersReload((value) => value + 1)} disabled={ordersLoading} className="btn-ghost shrink-0">
                {ordersLoading ? 'Duke ngarkuar…' : 'Rifresko'}
              </button>
            </div>
          </div>

          {ordersError && <p role="alert" className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{ordersError}</p>}
          {orderStatusError && <p role="alert" className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{orderStatusError}</p>}
          {ordersLoading && <p role="status" className="py-12 text-center text-sm text-zinc-500">Duke ngarkuar porositë…</p>}
          {!ordersLoading && !ordersError && orders.length === 0 && (
            <div className="mt-6 rounded-3xl border border-black/5 bg-white p-10 text-center text-sm text-zinc-500">Nuk ka ende porosi në databazë.</div>
          )}
          {!ordersLoading && !ordersError && orders.length > 0 && filteredOrders.length === 0 && (
            <div className="mt-6 rounded-3xl border border-black/5 bg-white p-10 text-center text-sm text-zinc-500">Nuk ka porosi me këtë status.</div>
          )}

          {!ordersLoading && filteredOrders.length > 0 && (
            <div className="mt-6 overflow-hidden rounded-2xl border border-black/5 bg-white shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] text-left text-sm">
                  <thead className="bg-zinc-50 text-xs uppercase tracking-wide text-zinc-500">
                    <tr>
                      <th className="px-5 py-4 font-medium">Porosia</th>
                      <th className="px-5 py-4 font-medium">Klienti</th>
                      <th className="px-5 py-4 font-medium">Produktet</th>
                      <th className="px-5 py-4 font-medium">Totali</th>
                      <th className="px-5 py-4 font-medium">Statusi / Data</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/5">
                    {filteredOrders.map((order) => (
                      <tr key={order.id} className="align-top">
                        <td className="px-5 py-4 font-mono text-xs text-zinc-600">{order.orderRef || `#${order.id}`}</td>
                        <td className="px-5 py-4">
                          <p className="font-medium text-zinc-900">{order.customerName || 'Klient'}</p>
                          <p className="mt-1 text-xs text-zinc-500">{order.phone}</p>
                          <p className="mt-1 max-w-52 text-xs text-zinc-500">{order.address}</p>
                        </td>
                        <td className="px-5 py-4">
                          <ul className="space-y-1 text-xs text-zinc-600">
                            {(order.items || []).map((item, index) => (
                              <li key={`${order.id}-${index}`}>{item.quantity} × {item.productName} · {fmt(item.price)}</li>
                            ))}
                          </ul>
                        </td>
                        <td className="px-5 py-4 font-semibold text-zinc-900">{fmt(order.total)}</td>
                        <td className="px-5 py-4">
                          <label className="sr-only" htmlFor={`order-status-${order.id}`}>Ndrysho statusin për porosinë {order.orderRef || order.id}</label>
                          <select id={`order-status-${order.id}`} value={order.status || 'Pending'} disabled={updatingOrderId !== null}
                            onChange={(event) => updateOrderStatus(order.id, event.target.value)}
                            className="max-w-48 rounded-lg border border-black/10 bg-white px-2.5 py-1.5 text-xs font-medium text-zinc-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:opacity-60">
                            {!availableStatuses.includes(order.status) && order.status && <option value={order.status}>{order.status}</option>}
                            {ORDER_STATUSES.map((status) => <option key={status.value} value={status.value}>{status.label}</option>)}
                          </select>
                          <p className="mt-2 text-xs text-zinc-500">{formatDate(order.createdAt)}</p>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>
      ) : <AdminPanel />}
    </main>
  )
}
