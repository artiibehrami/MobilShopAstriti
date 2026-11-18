import { useEffect, useReducer, useRef, useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar.jsx'
import ShopView from './components/ShopView.jsx'
import RepairView from './components/RepairView.jsx'
import CartDrawer from './components/CartDrawer.jsx'
import Footer from './components/Footer.jsx'
import SiteSections from './components/SiteSections.jsx'
import AdminDashboard from './components/AdminDashboard.jsx'

function reducer(state, a) {
  switch (a.type) {
    case 'replace': return a.items
    case 'add': {
      const hit = state.find((i) => i.id === a.p.id)
      return hit ? state.map((i) => (i.id === a.p.id ? { ...i, qty: Math.min(10, i.qty + 1) } : i)) : [...state, { ...a.p, qty: 1 }]
    }
    case 'inc': return state.map((i) => (i.id === a.id ? { ...i, qty: Math.min(10, i.qty + 1) } : i))
    case 'dec': return state.map((i) => (i.id === a.id ? { ...i, qty: Math.max(1, i.qty - 1) } : i))
    case 'remove': return state.filter((i) => i.id !== a.id)
    case 'clear': return []
    default: return state
  }
}

function readLegacyCart() {
  try {
    const items = JSON.parse(localStorage.getItem('astriti-cart') || '[]')
    return Array.isArray(items)
      ? items.filter((item) => Number.isSafeInteger(Number(item?.id)) && Number(item.id) > 0 &&
        Number.isInteger(Number(item?.qty)) && Number(item.qty) >= 1 && Number(item.qty) <= 10)
        .map((item) => ({ id: Number(item.id), qty: Number(item.qty) }))
      : []
  } catch (error) {
    console.warn('Shporta e vjetër nuk mund të lexohet:', error)
    return []
  }
}

export default function App() {
  const [cartOpen, setCartOpen] = useState(false)
  const [cart, dispatch] = useReducer(reducer, [])
  const [cartReady, setCartReady] = useState(false)
  const [cartSyncStatus, setCartSyncStatus] = useState('loading')
  const [cartSyncError, setCartSyncError] = useState('')
  const [cartLoadAttempt, setCartLoadAttempt] = useState(0)
  const [cartRetry, setCartRetry] = useState(0)
  const cartSaveVersion = useRef(0)
  const cartSaveQueue = useRef(Promise.resolve())
  const [siteContent, setSiteContent] = useState(null)
  const [siteError, setSiteError] = useState('')
  const [siteLoading, setSiteLoading] = useState(true)
  const count = cart.reduce((s, i) => s + i.qty, 0)

  useEffect(() => {
    let active = true
    const loadCart = async () => {
      setCartSyncStatus('loading')
      setCartSyncError('')
      try {
        const response = await fetch('/api/cart')
        const result = await response.json()
        if (!response.ok) throw new Error(result.error || 'Shporta nuk mund të ngarkohet nga MySQL.')
        if (!Array.isArray(result.items)) throw new Error('Serveri ktheu një shportë të pavlefshme.')

        let items = result.items
        const legacyItems = readLegacyCart()
        if (!items.length && legacyItems.length) {
          const migration = await fetch('/api/cart', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ items: legacyItems }),
          })
          const migrated = await migration.json()
          if (!migration.ok) throw new Error(migrated.error || 'Shporta e vjetër nuk mund të migrohet në MySQL.')
          items = migrated.items
        }

        try { localStorage.removeItem('astriti-cart') } catch (error) {
          console.warn('Shporta e vjetër nuk mund të fshihet nga shfletuesi:', error)
        }
        if (active) {
          dispatch({ type: 'replace', items })
          setCartReady(true)
          setCartSyncStatus('saved')
        }
      } catch (error) {
        console.error('Nuk u ngarkua shporta nga MySQL:', error)
        if (active) {
          setCartSyncStatus('error')
          setCartSyncError(error instanceof Error ? error.message : 'Shporta nuk mund të ngarkohet nga MySQL.')
        }
      }
    }
    loadCart()
    return () => { active = false }
  }, [cartLoadAttempt])

  useEffect(() => {
    if (!cartReady) return
    const version = ++cartSaveVersion.current
    const items = cart.map(({ id, qty }) => ({ id, qty }))
    setCartSyncStatus('saving')
    setCartSyncError('')
    cartSaveQueue.current = cartSaveQueue.current.catch(() => {}).then(async () => {
      const response = await fetch('/api/cart', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items }),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Shporta nuk mund të ruhet në MySQL.')
      if (version === cartSaveVersion.current) setCartSyncStatus('saved')
    }).catch((error) => {
      console.error('Nuk u ruajt shporta në MySQL:', error)
      if (version === cartSaveVersion.current) {
        setCartSyncStatus('error')
        setCartSyncError(error instanceof Error ? error.message : 'Shporta nuk mund të ruhet në MySQL.')
      }
    })
  }, [cart, cartReady, cartRetry])

  const loadSiteContent = async () => {
    setSiteLoading(true)
    setSiteError('')
    try {
      const response = await fetch('/api/site-content')
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Përmbajtja e faqes nuk mund të ngarkohet.')
      setSiteContent(data)
    } catch (error) {
      console.error('Nuk u ngarkua përmbajtja nga databaza:', error)
      setSiteError(error instanceof Error ? error.message : 'Gabim gjatë lidhjes me databazën XAMPP.')
    } finally {
      setSiteLoading(false)
    }
  }

  useEffect(() => { loadSiteContent() }, [])
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && setCartOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const addToCart = (product) => {
    if (!cartReady) {
      setCartOpen(true)
      return
    }
    dispatch({ type: 'add', p: product })
  }

  return (
    <Router>
      <div className="min-h-screen bg-[#f5f5f7] font-sans text-zinc-900">
        <Navbar count={count} openCart={() => setCartOpen(true)} store={siteContent?.store} />

        <main>
          <Routes>
            {/* Faqja kryesore e dyqanit dhe riparimeve */}
            <Route path="/" element={
              <>
                <ShopView onAdd={addToCart} store={siteContent?.store} policies={siteContent?.policies} />
                {siteError && <div role="alert" className="mx-auto my-8 flex max-w-6xl items-center justify-between gap-4 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-800">
                  <span>Përmbajtja nuk u ngarkua nga MySQL: {siteError}</span>
                  <button onClick={loadSiteContent} className="shrink-0 underline cursor-pointer">Provo përsëri</button>
                </div>}
                <SiteSections content={siteContent} loading={siteLoading} />
              </>
            } />

            <Route path="/repair" element={<RepairView store={siteContent?.store} />} />

            {/* Paneli i Adminit */}
            <Route path="/admin" element={<AdminDashboard />} />
          </Routes>
        </main>

        <Footer store={siteContent?.store} policies={siteContent?.policies} />
        <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} cart={cart} dispatch={dispatch} store={siteContent?.store} policies={siteContent?.policies}
          cartSyncStatus={cartSyncStatus} cartSyncError={cartSyncError} onRetryCart={() => {
            if (!cartReady) setCartLoadAttempt((attempt) => attempt + 1)
            else setCartRetry((attempt) => attempt + 1)
          }} />
      </div>
    </Router>
  )
}