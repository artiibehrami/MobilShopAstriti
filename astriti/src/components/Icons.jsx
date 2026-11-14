const base = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round', strokeLinejoin: 'round' }
const I = (d, extra) => ({ className = 'h-5 w-5', ...p }) => (
  <svg viewBox="0 0 24 24" className={className} {...base} {...p}>{d}{extra}</svg>
)
export const Bag = I(<><path d="M5 8h14l-1 12H6L5 8Z" /><path d="M9 8V6a3 3 0 0 1 6 0v2" /></>)
export const Search = I(<><circle cx="11" cy="11" r="6.5" /><path d="m20 20-4-4" /></>)
export const Phone = I(<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z" />)
export const Close = I(<path d="M6 6l12 12M18 6 6 18" />)
export const Plus = I(<path d="M12 5v14M5 12h14" />)
export const Minus = I(<path d="M5 12h14" />)
export const Check = I(<path d="m5 12.5 4.5 4.5L19 7.5" />)
export const Eye = I(<><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" /><circle cx="12" cy="12" r="3" /></>)
export const Shield = I(<><path d="M12 3 4.5 6v5.5c0 4.5 3 8 7.5 9.5 4.5-1.5 7.5-5 7.5-9.5V6L12 3Z" /><path d="m9 12 2 2 4-4" /></>)
export const Pin = I(<><path d="M12 21s7-6 7-11a7 7 0 0 0-14 0c0 5 7 11 7 11Z" /><circle cx="12" cy="10" r="2.5" /></>)
export const Clock = I(<><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>)
export const Wrench = I(<path d="M14.5 6.5a4 4 0 0 0 5 5L21 13l-8 8-3-3 8-8M3 21l4-4M7 17l-1-1 7-7" />)
export const Arrow = I(<path d="M5 12h14m-5-5 5 5-5 5" />)
export const Whatsapp = I(<><path d="M4 20l1.3-4.2A8 8 0 1 1 8.4 18.8L4 20Z" /><path d="M9 9c0 3 3 6 6 6l1-1.5-2-1-1 .7c-.8-.4-1.6-1.2-2-2l.7-1-1-2L9 9Z" /></>)
export const Bolt = I(<path d="M13 3 5 14h6l-1 7 8-11h-6l1-7Z" />)
