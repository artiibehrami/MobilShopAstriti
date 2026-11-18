import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { pool, query } from './db.js'
import { SHOP } from '../src/data.js'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

const settings = {
  store_name: SHOP.name,
  address: SHOP.address,
  city: SHOP.city,
  phone: SHOP.phone,
  phone_display: SHOP.phoneDisplay,
  whatsapp: SHOP.whatsapp,
  transport_coverage: SHOP.transport,
  opening_hours: [
    { days: 'E hënë – E shtunë', hours: '09:00 – 20:00' },
    { days: 'E diel', hours: '10:00 – 16:00' },
  ],
  appointment_slots: ['09:00', '10:30', '12:00', '14:00', '15:30', '17:00', '18:30'],
  map_url: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${SHOP.address}, ${SHOP.city}`)}`,
  delivery_policy: 'Dërgesa është falas brenda Vushtrrisë. Për qytetet tjera, tarifa dhe afati konfirmohen me telefon para se të dërgohet porosia.',
  warranty_policy: 'Kohëzgjatja dhe kushtet e garancisë varen nga produkti. Ju lutemi kontrolloni përshkrimin ose kontaktoni dyqanin para porosisë.',
  returns_policy: 'Për pyetje rreth ndërrimit ose kthimit të produktit, kontaktoni dyqanin me faturën dhe të dhënat e porosisë. Kushtet konfirmohen sipas produktit dhe rregullave në fuqi.',
  payment_methods: 'Pagesa bëhet në dorëzim.',
}

const faqs = [
  ['Si mund të bëj porosi?', 'Shtoni produktin në shportë, plotësoni të dhënat e kontaktit dhe të dërgesës, pastaj konfirmoni porosinë. Ekipi ynë do t’ju kontaktojë.'],
  ['Si bëhet pagesa?', 'Pagesa bëhet në dorëzim.'],
  ['Sa kushton dërgesa?', 'Dërgesa brenda Vushtrrisë është falas. Për qytetet tjera, tarifa dhe afati konfirmohen me telefon para dërgesës.'],
  ['Sa zgjat garancia?', 'Kushtet dhe kohëzgjatja e garancisë varen nga produkti dhe shfaqen te përshkrimi ose konfirmohen nga ekipi ynë.'],
  ['Si mund të rezervoj servis?', 'Zgjidhni markën, modelin dhe problemin te faqja e servisit, pastaj caktoni termin. Terminet dhe çmimet shfaqen pasi të jenë konfiguruar në sistem.'],
  ['A mund ta kthej ose ndërroj produktin?', 'Na kontaktoni me faturën dhe të dhënat e porosisë që t’ju konfirmojmë kushtet për produktin tuaj.'],
]

async function main() {
  const schema = await fs.readFile(path.join(root, 'server', 'schema.sql'), 'utf8')
  for (const statement of schema.split(';').map((part) => part.trim()).filter(Boolean)) {
    await query(statement)
  }

  const upgrades = {
    products: {
      brand: "VARCHAR(80) NOT NULL DEFAULT ''",
      details: 'TEXT NULL',
      tag: "VARCHAR(80) NOT NULL DEFAULT ''",
      popularity: 'INT NOT NULL DEFAULT 0',
      is_active: 'BOOLEAN NOT NULL DEFAULT TRUE',
      price_updated_at: 'DATETIME NULL DEFAULT NULL',
    },
    orders: {
      order_ref: 'VARCHAR(32) NULL',
      payment_method: "VARCHAR(40) NOT NULL DEFAULT 'cash-on-delivery'",
    },
    repair_requests: {
      booking_ref: 'VARCHAR(32) NULL',
      service_id: 'BIGINT UNSIGNED NULL',
      appointment_date: 'DATE NULL',
      appointment_slot: "VARCHAR(20) NOT NULL DEFAULT ''",
    },
  }
  for (const [table, columns] of Object.entries(upgrades)) {
    for (const [column, definition] of Object.entries(columns)) {
      const [existing] = await query(
        'SELECT 1 FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = ? AND column_name = ?',
        [table, column]
      )
      if (!existing.length) await query(`ALTER TABLE \`${table}\` ADD COLUMN \`${column}\` ${definition}`)
    }
  }

  await query("ALTER TABLE orders MODIFY status VARCHAR(32) NULL DEFAULT 'Pending'")
  await query('ALTER TABLE products MODIFY image_url VARCHAR(1000) NULL')
  await query('ALTER TABLE order_items MODIFY product_id INT NULL')
  await query('ALTER TABLE repair_requests MODIFY device_model VARCHAR(200) NOT NULL')
  for (const [table, index, column] of [
    ['orders', 'uq_orders_order_ref', 'order_ref'],
    ['repair_requests', 'uq_repair_booking_ref', 'booking_ref'],
  ]) {
    const [existing] = await query(
      'SELECT 1 FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = ? AND index_name = ?',
      [table, index]
    )
    if (!existing.length) await query(`ALTER TABLE \`${table}\` ADD UNIQUE INDEX \`${index}\` (\`${column}\`)`)
  }

  for (const [key, value] of Object.entries(settings)) {
    await query('INSERT IGNORE INTO site_settings (`key`, `value`) VALUES (?, ?)', [key, JSON.stringify(value)])
  }
  for (const [index, [question, answer]] of faqs.entries()) {
    await query('INSERT IGNORE INTO faqs (question, answer, sort_order) VALUES (?, ?, ?)', [question, answer, index + 1])
  }

  console.log('MySQL schema is ready. Store details and FAQs were added only when missing.')
  console.log('Products, repair prices, and customer reviews were not seeded.')
}

main()
  .catch((error) => {
    console.error('MySQL setup failed. Check the database exists and DB_* settings are correct.', error)
    process.exitCode = 1
  })
  .finally(() => pool.end())
