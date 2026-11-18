import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { pool } from './db.js'

const dataDirectory = path.join(path.dirname(fileURLToPath(import.meta.url)), 'data')
const toSqlDate = (value) => {
  const date = value ? new Date(value) : new Date()
  if (Number.isNaN(date.getTime())) return new Date().toISOString().slice(0, 19).replace('T', ' ')
  return date.toISOString().slice(0, 19).replace('T', ' ')
}

async function readRecords(file) {
  try {
    const value = JSON.parse(await fs.readFile(path.join(dataDirectory, file), 'utf8'))
    if (!Array.isArray(value)) throw new Error(`${file} must contain a JSON array.`)
    return value
  } catch (error) {
    if (error.code === 'ENOENT') return []
    throw error
  }
}

async function migrateOrders(connection, orders) {
  let imported = 0
  for (const order of orders) {
    const customer = order.customer || {}
    const items = Array.isArray(order.items) ? order.items : []
    if (!order.ref || !customer.name || !customer.phone || !customer.address || !items.length) continue

    await connection.beginTransaction()
    try {
      const [result] = await connection.execute(
        "INSERT IGNORE INTO orders (order_ref, customer_name, phone, address, total_amount, total_price, status, payment_method, created_at) VALUES (?, ?, ?, ?, ?, ?, 'Pending', ?, ?)",
        [String(order.ref).slice(0, 32), String(customer.name).slice(0, 100), String(customer.phone).slice(0, 30), String(customer.address).slice(0, 255), Number(order.total) || 0, Number(order.total) || 0, String(order.payment || 'cash-on-delivery').slice(0, 40), toSqlDate(order.createdAt)]
      )
      if (result.affectedRows) {
        for (const item of items.slice(0, 50)) {
          const productId = Number(item.id)
          let validProductId = null
          if (Number.isSafeInteger(productId) && productId > 0) {
            const [products] = await connection.execute('SELECT id FROM products WHERE id = ?', [productId])
            if (products.length) validProductId = productId
          }
          await connection.execute(
            'INSERT INTO order_items (order_id, product_id, product_name, price, quantity) VALUES (?, ?, ?, ?, ?)',
            [result.insertId, validProductId, String(item.name || 'Produkt').slice(0, 200), Math.max(0, Number(item.price) || 0), Math.max(1, Math.min(10, Number(item.qty) || 1))]
          )
        }
        imported++
      }
      await connection.commit()
    } catch (error) {
      await connection.rollback()
      throw error
    }
  }
  return imported
}

async function migrateRepairs(connection, repairs) {
  let imported = 0
  for (const repair of repairs) {
    if (!repair.ref || !repair.name || !repair.phone || !repair.device || !repair.issue) continue
    const dateMatch = String(repair.day || '').match(/\d{4}-\d{2}-\d{2}/)
    const appointmentDate = dateMatch ? dateMatch[0] : null
    const [result] = await connection.execute(
      'INSERT IGNORE INTO repair_requests (booking_ref, customer_name, phone, device_model, issue_type, estimated_cost, appointment_date, appointment_slot, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [String(repair.ref).slice(0, 32), String(repair.name).slice(0, 100), String(repair.phone).slice(0, 30), String(repair.device).slice(0, 200), String(repair.issue).slice(0, 100), Math.max(0, Number(repair.quote) || 0), appointmentDate, String(repair.slot || '').slice(0, 20), toSqlDate(repair.createdAt)]
    )
    if (result.affectedRows) imported++
  }
  return imported
}

async function main() {
  const [orders, repairs] = await Promise.all([readRecords('orders.json'), readRecords('repairs.json')])
  const connection = await pool.getConnection()
  try {
    const orderCount = await migrateOrders(connection, orders)
    const repairCount = await migrateRepairs(connection, repairs)
    console.log(`Imported ${orderCount} orders and ${repairCount} repair bookings. Existing JSON files were left unchanged.`)
  } finally {
    connection.release()
  }
}

main()
  .catch((error) => {
    console.error('JSON migration failed. Check the MySQL schema and DB_* settings.', error)
    process.exitCode = 1
  })
  .finally(() => pool.end())
