import express from 'express'
import cors from 'cors'
import { createHash, createHmac, randomBytes, timingSafeEqual } from 'node:crypto'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { databaseError, pool, query } from './db.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const app = express()
app.use(cors())
app.use(express.json({ limit: '50kb' }))

const clean = (value, max = 200) => String(value ?? '').trim().slice(0, max)
const makeRef = (prefix) => `${prefix}-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`
const CART_COOKIE = 'astriti_cart'
const CART_MAX_AGE = 30 * 24 * 60 * 60
const ADMIN_COOKIE = 'astriti_admin'
const ADMIN_SESSION_SECONDS = 8 * 60 * 60
const ADMIN_LOGIN_LIMIT = 5
const ADMIN_LOGIN_WINDOW_MS = 15 * 60 * 1000
const ORDER_STATUSES = ['Pending', 'Confirmed', 'Preparing', 'Ready', 'Completed', 'Cancelled']
const REPAIR_STATUSES = ['Në pritje', 'Konfirmuar', 'Përfunduar', 'Anuluar']
const adminLoginAttempts = new Map()
const setting = (rows, key, fallback = '') => {
  const row = rows.find((item) => item.key === key)
  if (!row) return fallback
  if (typeof row.value !== 'string') return row.value
  try { return JSON.parse(row.value) } catch { return row.value }
}

function adminIsConfigured() {
  return Boolean(
    process.env.ADMIN_PASSWORD && process.env.ADMIN_PASSWORD.length >= 12 &&
    process.env.ADMIN_SESSION_SECRET && Buffer.byteLength(process.env.ADMIN_SESSION_SECRET) >= 32
  )
}

function adminCookieValue(expiresAt, nonce) {
  const payload = `${expiresAt}.${nonce}`
  const signature = createHmac('sha256', process.env.ADMIN_SESSION_SECRET).update(payload).digest('hex')
  return `${payload}.${signature}`
}

function hasAdminSession(req) {
  const cookie = (req.headers.cookie || '').split(';').map((part) => part.trim())
    .find((part) => part.startsWith(`${ADMIN_COOKIE}=`))
  const [expiresAt, nonce, signature, ...rest] = (cookie?.slice(ADMIN_COOKIE.length + 1) || '').split('.')
  if (rest.length || !/^\d+$/.test(expiresAt || '') || !/^[a-f0-9]{48}$/.test(nonce || '') || !/^[a-f0-9]{64}$/.test(signature || '')) return false
  if (Number(expiresAt) <= Date.now()) return false
  const expected = createHmac('sha256', process.env.ADMIN_SESSION_SECRET).update(`${expiresAt}.${nonce}`).digest()
  return timingSafeEqual(Buffer.from(signature, 'hex'), expected)
}

function adminSessionCookie(value, maxAge) {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : ''
  return `${ADMIN_COOKIE}=${value}; HttpOnly; SameSite=Strict; Path=/api/admin; Max-Age=${maxAge}${secure}`
}

function requireAdmin(req, res, next) {
  if (!adminIsConfigured()) {
    return res.status(503).json({ error: 'Konfiguroni ADMIN_PASSWORD (të paktën 12 karaktere) dhe ADMIN_SESSION_SECRET (të paktën 32 karaktere) në .env.' })
  }
  if (!hasAdminSession(req)) return res.status(401).json({ error: 'Duhet të kyçeni si administrator.' })
  next()
}

function requireAdminOrigin(req, res, next) {
  const allowedOrigin = process.env.ADMIN_ORIGIN || `${req.protocol}://${req.get('host')}`
  if (req.get('origin') !== allowedOrigin) {
    return res.status(403).json({ error: 'Kërkesa administrative u refuzua për shkak të origjinës.' })
  }
  next()
}

async function getCartId(req, res) {
  const cookie = (req.headers.cookie || '').split(';').map((part) => part.trim())
    .find((part) => part.startsWith(`${CART_COOKIE}=`))
  let token = cookie?.slice(CART_COOKIE.length + 1)
  if (!token || !/^[a-f0-9]{64}$/.test(token)) token = randomBytes(32).toString('hex')

  const tokenHash = createHash('sha256').update(token).digest('hex')
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : ''
  res.setHeader('Set-Cookie', `${CART_COOKIE}=${token}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${CART_MAX_AGE}${secure}`)

  await query('DELETE FROM carts WHERE expires_at < NOW()')
  await query(
    'INSERT INTO carts (token_hash, expires_at) VALUES (?, DATE_ADD(NOW(), INTERVAL 30 DAY)) ON DUPLICATE KEY UPDATE expires_at = DATE_ADD(NOW(), INTERVAL 30 DAY)',
    [tokenHash]
  )
  const [rows] = await query('SELECT id FROM carts WHERE token_hash = ?', [tokenHash])
  return rows[0].id
}

async function readCartItems(cartId) {
  await query(
    'DELETE ci FROM cart_items ci JOIN products p ON p.id = ci.product_id WHERE ci.cart_id = ? AND p.is_active = FALSE',
    [cartId]
  )
  const [items] = await query(
    `SELECT p.id, p.title AS name, p.brand, p.category, p.description AS sub, p.image_url AS image,
      p.price, p.stock_quantity AS stockQuantity, ci.quantity AS qty
     FROM cart_items ci JOIN products p ON p.id = ci.product_id
     WHERE ci.cart_id = ? AND p.is_active = TRUE ORDER BY p.id`,
    [cartId]
  )
  return items.map((item) => ({
    ...item,
    price: Number(item.price),
    qty: Number(item.qty),
    stockQuantity: item.stockQuantity == null ? null : Number(item.stockQuantity),
    stockStatus: item.stockQuantity == null ? 'unknown' : item.stockQuantity > 0 ? 'in_stock' : 'out_of_stock',
    kind: 'phone',
  }))
}

app.get('/api/health', async (_, res) => {
  try {
    await query('SELECT 1')
    res.json({ ok: true, database: true })
  } catch (error) {
    databaseError(res, error, 'MySQL nuk është i qasshëm. Kontrolloni konfigurimin DB_* dhe niseni bazën e të dhënave.')
  }
})

app.get('/api/admin/session', (req, res) => {
  if (!adminIsConfigured()) {
    return res.status(503).json({ error: 'Konfiguroni ADMIN_PASSWORD (të paktën 12 karaktere) dhe ADMIN_SESSION_SECRET (të paktën 32 karaktere) në .env.' })
  }
  res.json({ authenticated: hasAdminSession(req) })
})

app.post('/api/admin/login', requireAdminOrigin, (req, res) => {
  if (!adminIsConfigured()) {
    return res.status(503).json({ error: 'Konfiguroni ADMIN_PASSWORD (të paktën 12 karaktere) dhe ADMIN_SESSION_SECRET (të paktën 32 karaktere) në .env.' })
  }

  const ip = req.ip
  const now = Date.now()
  const attempts = adminLoginAttempts.get(ip)
  if (attempts && attempts.resetAt > now && attempts.count >= ADMIN_LOGIN_LIMIT) {
    return res.status(429).json({ error: 'Shumë tentativa hyrjeje. Prisni 15 minuta dhe provoni përsëri.' })
  }

  const password = typeof req.body?.password === 'string' ? req.body.password : ''
  const submittedHash = createHash('sha256').update(password).digest()
  const expectedHash = createHash('sha256').update(process.env.ADMIN_PASSWORD).digest()
  if (!timingSafeEqual(submittedHash, expectedHash)) {
    if (!attempts || attempts.resetAt <= now) adminLoginAttempts.set(ip, { count: 1, resetAt: now + ADMIN_LOGIN_WINDOW_MS })
    else attempts.count += 1
    return res.status(401).json({ error: 'Fjalëkalimi nuk është i saktë.' })
  }

  adminLoginAttempts.delete(ip)
  const expiresAt = now + ADMIN_SESSION_SECONDS * 1000
  const nonce = randomBytes(24).toString('hex')
  res.setHeader('Set-Cookie', adminSessionCookie(adminCookieValue(expiresAt, nonce), ADMIN_SESSION_SECONDS))
  res.json({ authenticated: true })
})

app.post('/api/admin/logout', requireAdminOrigin, (req, res) => {
  res.setHeader('Set-Cookie', adminSessionCookie('', 0))
  res.json({ authenticated: false })
})

app.get('/api/admin/orders', requireAdmin, async (_, res) => {
  try {
    const [orders] = await query(
      `SELECT id, order_ref AS orderRef, customer_name AS customerName, phone, address,
        total_amount AS total, status, payment_method AS paymentMethod, created_at AS createdAt
       FROM orders ORDER BY created_at DESC, id DESC LIMIT 100`
    )
    if (!orders.length) return res.json([])

    const orderIds = orders.map((order) => order.id)
    const [items] = await query(
      `SELECT order_id AS orderId, product_name AS productName, quantity, price
       FROM order_items WHERE order_id IN (${orderIds.map(() => '?').join(',')}) ORDER BY id`,
      orderIds
    )
    const itemsByOrder = new Map()
    for (const item of items) {
      const current = itemsByOrder.get(item.orderId) || []
      current.push({ ...item, quantity: Number(item.quantity), price: Number(item.price) })
      itemsByOrder.set(item.orderId, current)
    }

    res.json(orders.map((order) => ({
      ...order,
      total: Number(order.total),
      items: itemsByOrder.get(order.id) || [],
    })))
  } catch (error) {
    databaseError(res, error, 'Porositë nuk mund të ngarkohen nga MySQL.')
  }
})

app.patch('/api/admin/orders/:id/status', requireAdminOrigin, requireAdmin, async (req, res) => {
  const orderId = Number(req.params.id)
  const status = req.body?.status
  if (!Number.isSafeInteger(orderId) || orderId < 1 || !ORDER_STATUSES.includes(status)) {
    return res.status(400).json({ error: 'ID-ja ose statusi i porosisë nuk është i vlefshëm.' })
  }

  try {
    const [result] = await query('UPDATE orders SET status = ? WHERE id = ?', [status, orderId])
    if (!result.affectedRows) {
      const [orders] = await query('SELECT id FROM orders WHERE id = ?', [orderId])
      if (!orders.length) return res.status(404).json({ error: 'Porosia nuk u gjet.' })
    }
    res.json({ id: orderId, status })
  } catch (error) {
    databaseError(res, error, 'Statusi i porosisë nuk mund të përditësohet në MySQL.')
  }
})

app.get('/api/admin/appointments', requireAdmin, async (_, res) => {
  try {
    const [appointments] = await query(
      `SELECT id, booking_ref AS bookingRef, customer_name AS customerName, phone,
        device_model AS deviceModel, issue_type AS issueType, estimated_cost AS estimatedCost,
        DATE_FORMAT(appointment_date, '%Y-%m-%d') AS appointmentDate,
        appointment_slot AS appointmentSlot, status, created_at AS createdAt
       FROM repair_requests ORDER BY appointment_date DESC, appointment_slot DESC, id DESC LIMIT 100`
    )
    res.json(appointments.map((appointment) => ({
      ...appointment,
      estimatedCost: appointment.estimatedCost == null ? null : Number(appointment.estimatedCost),
    })))
  } catch (error) {
    databaseError(res, error, 'Terminet nuk mund të ngarkohen nga MySQL.')
  }
})

app.patch('/api/admin/appointments/:id/status', requireAdminOrigin, requireAdmin, async (req, res) => {
  const appointmentId = Number(req.params.id)
  const status = req.body?.status
  if (!Number.isSafeInteger(appointmentId) || appointmentId < 1 || !REPAIR_STATUSES.includes(status)) {
    return res.status(400).json({ error: 'ID-ja ose statusi i terminit nuk është i vlefshëm.' })
  }

  try {
    const [result] = await query('UPDATE repair_requests SET status = ? WHERE id = ?', [status, appointmentId])
    if (!result.affectedRows) {
      const [appointments] = await query('SELECT id FROM repair_requests WHERE id = ?', [appointmentId])
      if (!appointments.length) return res.status(404).json({ error: 'Termini nuk u gjet.' })
    }
    res.json({ id: appointmentId, status })
  } catch (error) {
    databaseError(res, error, 'Statusi i terminit nuk mund të përditësohet në MySQL.')
  }
})

app.get('/api/admin/products', requireAdmin, async (_, res) => {
  try {
    const [products] = await query(
      `SELECT id, title AS name, brand, category, description, details, price, stock_quantity AS stockQuantity,
        is_active AS isActive
       FROM products ORDER BY created_at DESC, id DESC`
    )
    res.json(products.map((product) => ({
      ...product,
      price: Number(product.price),
      stockQuantity: product.stockQuantity == null ? null : Number(product.stockQuantity),
      isActive: Boolean(product.isActive),
    })))
  } catch (error) {
    databaseError(res, error, 'Produktet nuk mund të ngarkohen për administrim.')
  }
})

app.patch('/api/admin/products/:id', requireAdminOrigin, requireAdmin, async (req, res) => {
  const productId = Number(req.params.id)
  const body = req.body
  if (!Number.isSafeInteger(productId) || productId < 1 || !body || typeof body !== 'object' || Array.isArray(body)) {
    return res.status(400).json({ error: 'ID-ja ose të dhënat e produktit nuk janë të vlefshme.' })
  }

  const updates = []
  const values = []
  if (Object.prototype.hasOwnProperty.call(body, 'price')) {
    const price = Number(body.price)
    if (!Number.isFinite(price) || price < 0 || price > 99999999.99) {
      return res.status(400).json({ error: 'Çmimi duhet të jetë numër zero ose më i madh.' })
    }
    updates.push('price = ?', 'price_updated_at = CURRENT_TIMESTAMP')
    values.push(price.toFixed(2))
  }
  if (Object.prototype.hasOwnProperty.call(body, 'stockQuantity')) {
    const stockInput = body.stockQuantity
    const stockQuantity = stockInput === null || (typeof stockInput === 'string' && stockInput.trim() === '')
      ? null
      : Number(stockInput)
    if (stockQuantity !== null &&
        (!Number.isSafeInteger(stockQuantity) || stockQuantity < 0 || stockQuantity > 4294967295)) {
      return res.status(400).json({ error: 'Stoku duhet të jetë numër i plotë zero ose më i madh.' })
    }
    updates.push('stock_quantity = ?')
    values.push(stockQuantity)
  }
  if (Object.prototype.hasOwnProperty.call(body, 'isActive')) {
    if (typeof body.isActive !== 'boolean') {
      return res.status(400).json({ error: 'Gjendja aktive e produktit nuk është e vlefshme.' })
    }
    updates.push('is_active = ?')
    values.push(body.isActive)
  }
  if (Object.prototype.hasOwnProperty.call(body, 'description')) {
    if (typeof body.description !== 'string' || body.description.length > 2000) {
      return res.status(400).json({ error: 'Përshkrimi i shkurtër duhet të jetë tekst deri në 2000 karaktere.' })
    }
    updates.push('description = ?')
    values.push(clean(body.description, 2000) || null)
  }
  if (Object.prototype.hasOwnProperty.call(body, 'details')) {
    if (typeof body.details !== 'string' || body.details.length > 5000) {
      return res.status(400).json({ error: 'Detajet duhet të jenë tekst deri në 5000 karaktere.' })
    }
    updates.push('details = ?')
    values.push(clean(body.details, 5000))
  }
  if (!updates.length || Object.keys(body).some((key) => !['price', 'stockQuantity', 'isActive', 'description', 'details'].includes(key))) {
    return res.status(400).json({ error: 'Zgjidhni fushat e vlefshme për përditësimin e produktit.' })
  }

  try {
    await query(`UPDATE products SET ${updates.join(', ')} WHERE id = ?`, [...values, productId])
    const [products] = await query(
      `SELECT id, title AS name, brand, category, description, details, price, stock_quantity AS stockQuantity,
        is_active AS isActive FROM products WHERE id = ?`,
      [productId]
    )
    if (!products.length) return res.status(404).json({ error: 'Produkti nuk u gjet.' })
    const product = products[0]
    res.json({
      ...product,
      price: Number(product.price),
      stockQuantity: product.stockQuantity == null ? null : Number(product.stockQuantity),
      isActive: Boolean(product.isActive),
    })
  } catch (error) {
    databaseError(res, error, 'Produkti nuk mund të përditësohet në MySQL.')
  }
})

app.post('/api/admin/products', requireAdminOrigin, requireAdmin, async (req, res) => {
  const title = clean(req.body?.title, 150)
  const brand = clean(req.body?.brand, 80)
  const category = clean(req.body?.category, 50)
  const description = clean(req.body?.description, 2000)
  const details = clean(req.body?.details, 5000)
  const imageUrl = clean(req.body?.imageUrl, 1000)
  const tag = clean(req.body?.tag, 80)
  const price = Number(req.body?.price)
  const allowedCategories = ['Smartphones', 'Wearables', 'Audio', 'Accessories']
  if (title.length < 2 || details.length < 2 || !allowedCategories.includes(category) ||
      !Number.isFinite(price) || price < 0 || price > 99999999.99) {
    return res.status(400).json({ error: 'Plotësoni emrin, detajet, kategorinë dhe një çmim të vlefshëm.' })
  }
  if (imageUrl) {
    try {
      const parsed = new URL(imageUrl)
      if (!['http:', 'https:'].includes(parsed.protocol)) throw new Error('Invalid image protocol')
    } catch {
      return res.status(400).json({ error: 'Linku i fotos duhet të jetë një URL e vlefshme HTTP ose HTTPS.' })
    }
  }

  const stockInput = req.body?.stockQuantity
  let stockQuantity = null
  if (stockInput !== undefined && stockInput !== null && String(stockInput).trim() !== '') {
    stockQuantity = Number(stockInput)
    if (!Number.isSafeInteger(stockQuantity) || stockQuantity < 0 || stockQuantity > 4294967295) {
      return res.status(400).json({ error: 'Stoku duhet të jetë numër i plotë zero ose më i madh.' })
    }
  }

  try {
    const [result] = await query(
      `INSERT INTO products
        (title, brand, category, description, details, image_url, tag, price, stock_quantity, popularity, is_active, price_updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, TRUE, CURRENT_TIMESTAMP)`,
      [title, brand, category, description || null, details, imageUrl || null, tag, price.toFixed(2), stockQuantity]
    )
    res.status(201).json({ id: result.insertId })
  } catch (error) {
    databaseError(res, error, 'Produkti nuk mund të ruhet në MySQL.')
  }
})

app.get('/api/products', async (_, res) => {
  try {
    const [products] = await query(
      `SELECT id, title AS name, brand, category, description AS sub, details AS blurb,
        image_url AS image, tag, price, stock_quantity AS stockQuantity, popularity,
        DATE_FORMAT(price_updated_at, '%Y-%m-%d %H:%i:%s') AS priceUpdatedAt
       FROM products WHERE is_active = TRUE ORDER BY popularity DESC, id`
    )
    res.json(products.map((product) => ({
      ...product,
      stockStatus: product.stockQuantity == null ? 'unknown' : product.stockQuantity > 0 ? 'in_stock' : 'out_of_stock',
      kind: 'phone',
    })))
  } catch (error) {
    databaseError(res, error, 'Produktet nuk mund të ngarkohen nga MySQL.')
  }
})

app.get('/api/cart', async (req, res) => {
  try {
    const cartId = await getCartId(req, res)
    res.json({ items: await readCartItems(cartId) })
  } catch (error) {
    databaseError(res, error, 'Shporta nuk mund të ngarkohet nga MySQL.')
  }
})

app.put('/api/cart', async (req, res) => {
  const items = req.body?.items
  if (!Array.isArray(items) || items.length > 50) {
    return res.status(400).json({ error: 'Përmbajtja e shportës nuk është e vlefshme.' })
  }

  const quantities = new Map()
  for (const item of items) {
    const id = Number(item?.id)
    const quantity = Number(item?.qty)
    if (!Number.isSafeInteger(id) || id < 1 || !Number.isInteger(quantity) || quantity < 1 || quantity > 10) {
      return res.status(400).json({ error: 'Produkti ose sasia në shportë nuk është e vlefshme.' })
    }
    quantities.set(id, (quantities.get(id) || 0) + quantity)
    if (quantities.get(id) > 10) {
      return res.status(400).json({ error: 'Sasia maksimale për produkt është 10.' })
    }
  }

  let connection
  try {
    const cartId = await getCartId(req, res)
    connection = await pool.getConnection()
    await connection.beginTransaction()
    await connection.execute('SELECT id FROM carts WHERE id = ? FOR UPDATE', [cartId])

    if (quantities.size) {
      const ids = [...quantities.keys()]
      const [products] = await connection.execute(
        `SELECT id FROM products WHERE is_active = TRUE AND id IN (${ids.map(() => '?').join(',')}) FOR UPDATE`,
        ids
      )
      if (products.length !== ids.length) {
        await connection.rollback()
        return res.status(409).json({ error: 'Një produkt në shportë nuk është më i disponueshëm.' })
      }
    }

    await connection.execute('DELETE FROM cart_items WHERE cart_id = ?', [cartId])
    for (const [productId, quantity] of quantities) {
      await connection.execute(
        'INSERT INTO cart_items (cart_id, product_id, quantity) VALUES (?, ?, ?)',
        [cartId, productId, quantity]
      )
    }
    await connection.commit()
    res.json({ items: await readCartItems(cartId) })
  } catch (error) {
    if (connection) {
      try {
        await connection.rollback()
      } catch (rollbackError) {
        console.error('Dështoi kthimi i transaksionit të shportës:', rollbackError.code || rollbackError.name)
      }
    }
    databaseError(res, error, 'Shporta nuk mund të ruhet në MySQL.')
  } finally {
    if (connection) connection.release()
  }
})

app.get('/api/site-content', async (_, res) => {
  try {
    const [settingResult, faqResult, reviewResult] = await Promise.all([
      query('SELECT `key`, `value` FROM site_settings'),
      query('SELECT id, question, answer FROM faqs WHERE is_published = TRUE ORDER BY sort_order, id'),
      query("SELECT id, customer_name AS name, rating, comment, created_at AS createdAt FROM reviews WHERE status = 'approved' ORDER BY created_at DESC LIMIT 20"),
    ])
    const [settings] = settingResult
    const [faqs] = faqResult
    const [reviews] = reviewResult
    res.json({
      store: {
        name: setting(settings, 'store_name'),
        address: setting(settings, 'address'),
        city: setting(settings, 'city'),
        phone: setting(settings, 'phone'),
        phoneDisplay: setting(settings, 'phone_display'),
        whatsapp: setting(settings, 'whatsapp'),
        transport: setting(settings, 'transport_coverage'),
        openingHours: setting(settings, 'opening_hours', []),
        appointmentSlots: setting(settings, 'appointment_slots', []),
        mapUrl: setting(settings, 'map_url'),
      },
      policies: {
        delivery: setting(settings, 'delivery_policy'),
        warranty: setting(settings, 'warranty_policy'),
        returns: setting(settings, 'returns_policy'),
        payment: setting(settings, 'payment_methods'),
      },
      faqs,
      reviews,
    })
  } catch (error) {
    databaseError(res, error, 'Përmbajtja e faqes nuk mund të ngarkohet nga MySQL.')
  }
})

app.post('/api/reviews', async (req, res) => {
  const name = clean(req.body?.name, 100)
  const comment = clean(req.body?.comment, 1000)
  const rating = Number(req.body?.rating)
  if (name.length < 2 || comment.length < 15 || !Number.isInteger(rating) || rating < 1 || rating > 5) {
    return res.status(400).json({ error: 'Shkruani emrin, një vlerësim nga 1 deri në 5 yje dhe të paktën 15 karaktere.' })
  }
  try {
    const [result] = await query(
      "INSERT INTO reviews (customer_name, rating, comment, status) VALUES (?, ?, ?, 'pending')",
      [name, rating, comment]
    )
    res.status(201).json({ id: result.insertId, pending: true })
  } catch (error) {
    databaseError(res, error, 'Vlerësimi nuk mund të ruhet në MySQL.')
  }
})

app.get('/api/repair-services', async (_, res) => {
  try {
    const [services] = await query(
      `SELECT id, brand, model, issue_key AS issueKey, issue_label AS issueLabel,
        issue_note AS issueNote, estimated_time AS estimatedTime, quote
       FROM repair_services WHERE is_active = TRUE ORDER BY brand, model, id`
    )
    res.json(services)
  } catch (error) {
    databaseError(res, error, 'Shërbimet e servisit nuk mund të ngarkohen nga MySQL.')
  }
})

app.post('/api/orders', async (req, res) => {
  const name = clean(req.body?.name, 100)
  const phone = clean(req.body?.phone, 30)
  const address = clean(req.body?.address, 255)
  if (name.length < 2 || phone.replace(/\D/g, '').length < 6 || address.length < 5) {
    return res.status(400).json({ error: 'Të dhënat e porosisë janë të paplota ose të pavlefshme.' })
  }

  let connection
  try {
    const cartId = await getCartId(req, res)
    connection = await pool.getConnection()
    await connection.beginTransaction()
    await connection.execute('SELECT id FROM carts WHERE id = ? FOR UPDATE', [cartId])
    const [cartRows] = await connection.execute(
      'SELECT product_id AS id, quantity FROM cart_items WHERE cart_id = ? FOR UPDATE',
      [cartId]
    )
    if (!cartRows.length) {
      await connection.rollback()
      return res.status(409).json({ error: 'Shporta është bosh. Shtoni produkte para se të porositni.' })
    }

    const itemsToSave = []
    let total = 0
    for (const cartItem of cartRows) {
      const id = Number(cartItem.id)
      const quantity = Number(cartItem.quantity)
      const [rows] = await connection.execute(
        'SELECT id, title AS name, price, stock_quantity AS stockQuantity, is_active FROM products WHERE id = ? FOR UPDATE',
        [id]
      )
      const product = rows[0]
      if (!product || !product.is_active) {
        await connection.rollback()
        return res.status(409).json({ error: 'Një produkt në shportë nuk është më i disponueshëm.' })
      }
      if (product.stockQuantity != null && product.stockQuantity < quantity) {
        await connection.rollback()
        return res.status(409).json({ error: `Stoku për ${product.name} ka ndryshuar. Përditësoni shportën dhe provoni përsëri.` })
      }
      const price = Number(product.price)
      total += price * quantity
      itemsToSave.push({ ...product, price, quantity })
    }

    const orderRef = makeRef('AST')
    const [order] = await connection.execute(
      "INSERT INTO orders (order_ref, customer_name, phone, address, total_amount, total_price, status, payment_method) VALUES (?, ?, ?, ?, ?, ?, 'Pending', 'cash-on-delivery')",
      [orderRef, name, phone, address, total.toFixed(2), total.toFixed(2)]
    )
    for (const item of itemsToSave) {
      await connection.execute(
        'INSERT INTO order_items (order_id, product_id, product_name, price, quantity) VALUES (?, ?, ?, ?, ?)',
        [order.insertId, item.id, item.name, item.price.toFixed(2), item.quantity]
      )
      if (item.stockQuantity != null) {
        await connection.execute(
          'UPDATE products SET stock_quantity = stock_quantity - ? WHERE id = ?',
          [item.quantity, item.id]
        )
      }
    }
    await connection.execute('DELETE FROM cart_items WHERE cart_id = ?', [cartId])
    await connection.commit()
    res.status(201).json({ ref: orderRef, total })
  } catch (error) {
    if (connection) {
      try {
        await connection.rollback()
      } catch (rollbackError) {
        console.error('Dështoi kthimi i transaksionit të porosisë:', rollbackError.code || rollbackError.name)
      }
    }
    databaseError(res, error, 'Porosia nuk mund të ruhet në MySQL.')
  } finally {
    if (connection) connection.release()
  }
})

app.post('/api/repairs', async (req, res) => {
  const name = clean(req.body?.name, 100)
  const phone = clean(req.body?.phone, 30)
  const serviceId = Number(req.body?.serviceId)
  const day = clean(req.body?.day, 10)
  const slot = clean(req.body?.slot, 10)
  if (name.length < 2 || phone.replace(/\D/g, '').length < 6 || !Number.isSafeInteger(serviceId) || serviceId < 1 ||
      !/^\d{4}-\d{2}-\d{2}$/.test(day) || !/^\d{2}:\d{2}$/.test(slot)) {
    return res.status(400).json({ error: 'Të dhënat e rezervimit janë të paplota ose të pavlefshme.' })
  }
  const [year, month, date] = day.split('-').map(Number)
  const appointmentDate = new Date(year, month - 1, date)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  if (appointmentDate.getFullYear() !== year || appointmentDate.getMonth() !== month - 1 ||
      appointmentDate.getDate() !== date || appointmentDate < today) {
    return res.status(400).json({ error: 'Data e terminit nuk është e vlefshme.' })
  }
  try {
    const [slotRows] = await query('SELECT `value` FROM site_settings WHERE `key` = ?', ['appointment_slots'])
    const slotsValue = slotRows[0]?.value
    const allowedSlots = typeof slotsValue === 'string' ? JSON.parse(slotsValue) : slotsValue
    if (!Array.isArray(allowedSlots) || !allowedSlots.includes(slot)) {
      return res.status(400).json({ error: 'Ora e zgjedhur nuk është në dispozicion.' })
    }

    const [services] = await query(
      'SELECT id, brand, model, issue_label AS issueLabel, quote FROM repair_services WHERE id = ? AND is_active = TRUE',
      [serviceId]
    )
    const service = services[0]
    if (!service) return res.status(409).json({ error: 'Ky shërbim nuk është më i disponueshëm.' })

    const bookingRef = makeRef('REP')
    const [result] = await query(
      `INSERT INTO repair_requests
        (booking_ref, customer_name, phone, service_id, device_model, issue_type, estimated_cost, appointment_date, appointment_slot)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [bookingRef, name, phone, service.id, `${service.brand} ${service.model}`.slice(0, 200), service.issueLabel, service.quote, day, slot]
    )
    res.status(201).json({ id: result.insertId, ref: bookingRef })
  } catch (error) {
    databaseError(res, error, 'Rezervimi i servisit nuk mund të ruhet në MySQL.')
  }
})

if (process.env.NODE_ENV === 'production') {
  const dist = path.join(__dirname, '..', 'dist')
  app.use(express.static(dist))
  app.get('*', (_, res) => res.sendFile(path.join(dist, 'index.html')))
}

const PORT = process.env.PORT || 4000
app.listen(PORT, () => console.log(`Astriti API on :${PORT}`))
