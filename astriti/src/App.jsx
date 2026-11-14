import { useEffect, useReducer, useState } from 'react'
import Navbar from './components/Navbar.jsx'
import ShopView from './components/ShopView.jsx'
import RepairView from './components/RepairView.jsx'
import CartDrawer from './components/CartDrawer.jsx'
import Footer from './components/Footer.jsx'

function reducer(state, a) {
  switch (a.type) {
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
const load = () => { try { return JSON.parse(localStorage.getItem('astriti-cart')) || [] } catch { return [] } }

export default function App() {
  const [tab, setTab] = useState('shop')
  const [cartOpen, setCartOpen] = useState(false)
  const [cart, dispatch] = useReducer(reducer, [], load)
  const count = cart.reduce((s, i) => s + i.qty, 0)

  useEffect(() => { try { localStorage.setItem('astriti-cart', JSON.stringify(cart)) } catch {} }, [cart])
  useEffect(() => { window.scrollTo({ top: 0 }) }, [tab])
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && setCartOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <div className="min-h-screen bg-[#f5f5f7] font-sans text-zinc-900">
      <Navbar tab={tab} setTab={setTab} count={count} openCart={() => setCartOpen(true)} />
      <main>
        {tab === 'shop'
          ? <ShopView onAdd={(p) => dispatch({ type: 'add', p })} setTab={setTab} />
          : <RepairView />}
      </main>
      <Footer setTab={setTab} />
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} cart={cart} dispatch={dispatch} />
    </div>
  )
}
