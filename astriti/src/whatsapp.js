export function whatsappLink(phone, message) {
  let number = String(phone ?? '').replace(/\D/g, '')
  if (number.startsWith('00')) number = number.slice(2)
  if (number.startsWith('0')) number = `383${number.slice(1)}`
  else if (/^4\d{7}$/.test(number)) number = `383${number}`
  if (!/^\d{8,15}$/.test(number)) return ''
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`
}
