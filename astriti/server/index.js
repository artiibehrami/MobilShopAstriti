import express from 'express'
import cors from 'cors'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DATA = path.join(__dirname, 'data')
fs.mkdirSync(DATA, { recursive: true })

const app = express()
app.use(cors())
app.use(express.json({ limit: '50kb' }))

const save = (file, record) => {
  const p = path.join(DATA, file)
  const list = fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, 'utf8')) : []
  list.push(record)
  fs.writeFileSync(p, JSON.stringify(list, null, 2))
}
const clean = (v, max = 200) => String(v ?? '').trim().slice(0, max)
const ref = (p) => `${p}-${Date.now().toString(36).toUpperCase().slice(-5)}${Math.floor(Math.random() * 90 + 10)}`

app.get('/api/health', (_, res) => res.json({ ok: true }))

app.post('/api/orders', (req, res) => {
  const { name, phone, address, items } = req.body || {}
  if (!clean(name) || !clean(phone) || !clean(address) || !Array.isArray(items) || !items.length)
    return res.status(400).json({ error: 'Missing required fields.' })
  const order = {
    ref: ref('AST'), createdAt: new Date().toISOString(), status: 'new', payment: 'cash-on-delivery',
    customer: { name: clean(name), phone: clean(phone, 30), address: clean(address, 300) },
    items: items.slice(0, 50).map((i) => ({ id: Number(i.id), name: clean(i.name), price: Number(i.price), qty: Math.max(1, Math.min(10, Number(i.qty) || 1)) })),
  }
  order.total = order.items.reduce((s, i) => s + i.price * i.qty, 0)
  save('orders.json', order)
  console.log('New order', order.ref, order.total)
  res.status(201).json({ ref: order.ref })
})

app.post('/api/repairs', (req, res) => {
  const { name, phone, device, issue, quote, day, slot } = req.body || {}
  if (!clean(name) || !clean(phone) || !clean(device) || !clean(issue))
    return res.status(400).json({ error: 'Missing required fields.' })
  const booking = { ref: ref('REP'), createdAt: new Date().toISOString(), name: clean(name), phone: clean(phone, 30), device: clean(device), issue: clean(issue), quote: Number(quote) || 0, day: clean(day, 40), slot: clean(slot, 20) }
  save('repairs.json', booking)
  console.log('New repair booking', booking.ref)
  res.status(201).json({ ref: booking.ref })
})

if (process.env.NODE_ENV === 'production') {
  const dist = path.join(__dirname, '..', 'dist')
  app.use(express.static(dist))
  app.get('*', (_, res) => res.sendFile(path.join(dist, 'index.html')))
}

const PORT = process.env.PORT || 4000
app.listen(PORT, () => console.log(`Astriti API on :${PORT}`))
