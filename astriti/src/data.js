// ─── Boutique configuration — Mobil Shop Astriti ────────────────────────
export const SHOP = {
  name: 'Mobil Shop Astriti',
  subtitle: 'SHITJE, SERVISIM, DEKODIM',
  city: 'Vushtrri, Kosovo',
  address: 'Sheshi Hasan Prishtina, Vushtrri 42000',
  phone: '+38345678888',
  phoneDisplay: '045 678 888 / 044 777 561',
  servicePhone: '049 665 028',
  whatsapp: '38345678888',
  transport: 'Kosovë, Shqipëri, Maqedoni',
  hours: [['Monday – Saturday', '09:00 – 20:00'], ['Sunday', '10:00 – 16:00']],
}

export const fmt = (n) =>
  new Intl.NumberFormat('en-IE', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(n)

export const IPHONE_11_IMAGE = 'https://tse2.mm.bing.net/th/id/OIP.VQbXq67lJfYELTIGLfyuEAEsEs?r=0&rs=1&pid=ImgDetMain&o=7&rm=3'

// ─── Katalogu i plotë i pajisjeve me imazhe reale dhe çmime zyrtare ───
export const PRODUCTS = [
  // --- APPLE iPHONE SERIA ---
  {
    id: 101,
    name: 'iPhone 11',
    sub: '64 GB / 128 GB · Liquid Retina',
    brand: 'Apple',
    category: 'Smartphones',
    price: 320,
    popularity: 80,
    tag: 'Classic',
    kind: 'phone',
    image: IPHONE_11_IMAGE,
    blurb: 'A dual-camera system, all-day battery life, and high durability glass.'
  },
  {
    id: 102,
    name: 'iPhone 12',
    sub: '64 GB / 128 GB · OLED Display',
    brand: 'Apple',
    category: 'Smartphones',
    price: 390,
    popularity: 85,
    tag: 'Bestseller',
    kind: 'phone',
    image: IPHONE_11_IMAGE,
    blurb: 'Super Retina XDR display with Ceramic Shield and 5G connectivity.'
  },
  {
    id: 103,
    name: 'iPhone 13',
    sub: '128 GB · Cinematic Mode',
    brand: 'Apple',
    category: 'Smartphones',
    price: 480,
    popularity: 92,
    tag: 'Popular',
    kind: 'phone',
    image: 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-13-midnight-select-2021?wid=940&hei=1112&fmt=png-alpha&qlt=80&.v=1645717445744',
    blurb: 'Advanced dual-camera system with Sensor-shift optical image stabilization.'
  },
  {
    id: 104,
    name: 'iPhone 14',
    sub: '128 GB · Crash Detection',
    brand: 'Apple',
    category: 'Smartphones',
    price: 580,
    popularity: 88,
    tag: 'Reliable',
    kind: 'phone',
    image: 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-14-purple-select-202209?wid=940&hei=1112&fmt=png-alpha&qlt=80&.v=1660753619949',
    blurb: 'Impressive all-day battery life and upgraded low-light photography.'
  },
  {
    id: 105,
    name: 'iPhone 14 Pro Max',
    sub: '256 GB · Dynamic Island',
    brand: 'Apple',
    category: 'Smartphones',
    price: 890,
    popularity: 95,
    tag: 'Flagship',
    kind: 'phone',
    image: 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-14-pro-max-gold-select?wid=940&hei=1112&fmt=png-alpha&qlt=80&.v=1663673053424',
    blurb: '48MP Main camera, Always-On display, and Dynamic Island interface.'
  },
  {
    id: 1,
    name: 'iPhone 15 Pro Max',
    sub: '256 GB · Natural Titanium',
    brand: 'Apple',
    category: 'Smartphones',
    price: 1399,
    popularity: 98,
    tag: 'Flagship',
    kind: 'phone',
    image: 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-15-pro-max-natural-titanium-select?wid=940&hei=1112&fmt=png-alpha&qlt=80&.v=1692875658999',
    blurb: 'Grade 5 titanium, A17 Pro and a 5× telephoto optical zoom.'
  },
  {
    id: 2,
    name: 'iPhone 15 Pro',
    sub: '128 GB · Blue Titanium',
    brand: 'Apple',
    category: 'Smartphones',
    price: 1149,
    popularity: 94,
    tag: 'Bestseller',
    kind: 'phone',
    image: 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-15-pro-blue-titanium-select?wid=940&hei=1112&fmt=png-alpha&qlt=80&.v=1692875658972',
    blurb: 'Pro performance in a lighter frame with the custom Action button.'
  },

  // --- SAMSUNG GALAXY SERIA ---
  {
    id: 10,
    name: 'Galaxy Z Fold 6',
    sub: '512 GB · AI Foldable',
    brand: 'Samsung',
    category: 'Smartphones',
    price: 1550,
    popularity: 88,
    tag: 'Foldable',
    kind: 'phone',
    image: 'https://images.samsung.com/is/image/samsung/p6pim/levant/2407/gallery/levant-galaxy-z-fold6-f956-sm-f956bzwamea-542159116?$684_547_PNG$',
    blurb: 'Ultimate productivity on a massive foldable screen enhanced with Galaxy AI.'
  },
  {
    id: 11,
    name: 'Galaxy Z Flip 6',
    sub: '256 GB · FlexWindow',
    brand: 'Samsung',
    category: 'Smartphones',
    price: 950,
    popularity: 90,
    tag: 'Compact',
    kind: 'phone',
    image: 'https://images.samsung.com/is/image/samsung/p6pim/levant/2407/gallery/levant-galaxy-z-flip6-f741-sm-f741blbamea-542177309?$684_547_PNG$',
    blurb: 'Iconic pocket-sized foldable design with an advanced 50MP camera.'
  },
  {
    id: 3,
    name: 'Galaxy S24 Ultra',
    sub: '512 GB · Titanium Black',
    brand: 'Samsung',
    category: 'Smartphones',
    price: 1349,
    popularity: 90,
    tag: 'Flagship',
    kind: 'phone',
    image: 'https://images.samsung.com/is/image/samsung/p6pim/levant/2401/gallery/levant-galaxy-s24-ultra-s928-sm-s928bzkueMEA-539305175?$684_547_PNG$',
    blurb: 'Galaxy AI, integrated S Pen and flat titanium frame anti-glare screen.'
  },
  {
    id: 12,
    name: 'Galaxy S24+',
    sub: '256 GB · Onyx Black',
    brand: 'Samsung',
    category: 'Smartphones',
    price: 820,
    popularity: 87,
    tag: 'High-End',
    kind: 'phone',
    image: 'https://images.samsung.com/is/image/samsung/p6pim/levant/2401/gallery/levant-galaxy-s24-s921-sm-s921bzaeMEA-539295551?$684_547_PNG$',
    blurb: 'Larger QHD+ display and powerful processing for seamless daily tasks.'
  },
  {
    id: 13,
    name: 'Galaxy S23 Ultra',
    sub: '256 GB · Phantom Black',
    brand: 'Samsung',
    category: 'Smartphones',
    price: 850,
    popularity: 89,
    tag: 'Flagship',
    kind: 'phone',
    image: 'https://images.samsung.com/is/image/samsung/p6pim/levant/2301/gallery/levant-galaxy-s23-ultra-s918-sm-s918bzadmea-534850917?$684_547_PNG$',
    blurb: '200MP sensor resolution and legendary nightography capabilities.'
  },
  {
    id: 14,
    name: 'Galaxy A55 5G',
    sub: '128 GB · Awesome Iceblue',
    brand: 'Samsung',
    category: 'Smartphones',
    price: 380,
    popularity: 91,
    tag: 'Bestseller',
    kind: 'phone',
    image: 'https://images.samsung.com/is/image/samsung/p6pim/levant/sm-a556elbxmea/gallery/levant-galaxy-a55-5g-sm-a556-sm-a556elbxmea-540552718?$684_547_PNG$',
    blurb: 'Premium metal frame, stunning Super AMOLED display and robust security.'
  },
  {
    id: 15,
    name: 'Galaxy A35 5G',
    sub: '128 GB · Awesome Navy',
    brand: 'Samsung',
    category: 'Smartphones',
    price: 300,
    popularity: 84,
    tag: 'Value',
    kind: 'phone',
    image: 'https://images.samsung.com/is/image/samsung/p6pim/levant/sm-a356elbxmea/gallery/levant-galaxy-a35-5g-sm-a356-sm-a356elbxmea-540621213?$684_547_PNG$',
    blurb: 'Bright, smooth display and reliable multi-day battery life.'
  },
  {
    id: 16,
    name: 'Galaxy A16 5G',
    sub: '128 GB · Light Green',
    brand: 'Samsung',
    category: 'Smartphones',
    price: 175,
    popularity: 82,
    tag: 'Essential',
    kind: 'phone',
    image: 'https://images.samsung.com/is/image/samsung/p6pim/levant/sm-a166pzkdmea/gallery/levant-galaxy-a16-5g-sm-a166-sm-a166pzkdmea-543789012?$684_547_PNG$',
    blurb: 'Extended software updates and dependable daily performance.'
  },

  // --- XIAOMI & ACCESSORIES ---
  {
    id: 4,
    name: 'Xiaomi 14 Ultra',
    sub: '512 GB · Black',
    brand: 'Xiaomi',
    category: 'Smartphones',
    price: 1199,
    popularity: 76,
    tag: 'Leica Optics',
    kind: 'phone',
    image: 'https://i01.appmifile.com/v1/MI_18455B3E4DA706266cf70358a078fcab484/pms_1708422791.95450849!800x800!85.jpg',
    blurb: 'Leica Summilux quad camera system with a variable aperture main lens.'
  },
  {
    id: 6,
    name: 'AirPods Pro (2nd gen)',
    sub: 'USB-C · MagSafe Case',
    brand: 'Apple',
    category: 'Audio',
    price: 279,
    popularity: 92,
    tag: 'Bestseller',
    kind: 'buds',
    image: 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/MTJV3?wid=940&hei=1112&fmt=p-jpg&qlt=95&.v=1694014871985',
    blurb: 'Adaptive Audio, Active Noise Cancellation and Personalized Spatial Audio.'
  }
]

export const CATEGORIES = ['All', 'Smartphones', 'Audio']

// ─── Repair concierge pricing (Vushtrri Boutique) ────
export const ISSUES = [
  { id: 'glass', label: 'Ekrani dhe xhami', note: 'Ndërrim i panelit OLED ose xhamit të përparmë', eta: '45–90 min' },
  { id: 'battery', label: 'Bateria', note: 'Bateri e re, me kapacitet deri në 100%', eta: '30–45 min' },
  { id: 'board', label: 'Pllaka amë', note: 'Riparim me mikrosaldim dhe në nivel të komponentëve', eta: '1–3 ditë' },
]

export const REPAIR = {
  Apple: [
    { m: 'iPhone 15 Pro Max', glass: 289, battery: 99, board: 249 },
    { m: 'iPhone 14 Pro Max', glass: 220, battery: 85, board: 220 },
    { m: 'iPhone 13', glass: 149, battery: 69, board: 189 },
    { m: 'iPhone 11', glass: 99, battery: 49, board: 130 },
  ],
  Samsung: [
    { m: 'Galaxy Z Fold 6', glass: 350, battery: 120, board: 290 },
    { m: 'Galaxy S24 Ultra', glass: 249, battery: 109, board: 229 },
    { m: 'Galaxy A55 5G', glass: 110, battery: 50, board: 130 },
  ],
  Xiaomi: [
    { m: 'Xiaomi 14 Ultra', glass: 199, battery: 69, board: 179 },
  ],
}