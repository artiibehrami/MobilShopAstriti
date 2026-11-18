// ─── Boutique configuration — Mobil Shop Astriti ────────────────────────
export const SHOP = {
  name: "Mobil Shop Astriti",
  subtitle: "SHITJE, SERVISIM, DEKODIM",
  city: "Vushtrri, Kosovo",
  address: "Sheshi Hasan Prishtina, Vushtrri 42000",
  phone: "+38345678888",
  phoneDisplay: "045 678 888 / 044 777 561",
  servicePhone: "049 665 028",
  whatsapp: "38345678888",
  transport: "Kosovë, Shqipëri, Maqedoni",
  hours: [
    ["Monday – Saturday", "09:00 – 20:00"],
    ["Sunday", "10:00 – 16:00"],
  ],
};

export const fmt = (n) =>
  new Intl.NumberFormat("en-IE", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(n);
