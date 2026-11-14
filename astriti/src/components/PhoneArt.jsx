import { useId } from 'react'

// Resolution-independent device renders: no external images, always crisp.
export default function PhoneArt({ kind = 'phone', a = '#b9b4aa', b = '#4a4741', className = '', style }) {
  const id = useId().replace(/:/g, '')
  const grad = (
    <defs>
      <linearGradient id={`g${id}`} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor={a} /><stop offset="0.55" stopColor={b} /><stop offset="1" stopColor={a} stopOpacity=".55" />
      </linearGradient>
      <linearGradient id={`s${id}`} x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor="#fff" stopOpacity="0" /><stop offset=".5" stopColor="#fff" stopOpacity=".28" /><stop offset="1" stopColor="#fff" stopOpacity="0" />
      </linearGradient>
      <radialGradient id={`l${id}`} cx=".5" cy=".5" r=".5">
        <stop offset="0" stopColor="#3b4252" /><stop offset="1" stopColor="#050507" />
      </radialGradient>
    </defs>
  )
  const lens = (cx, cy, r = 11) => (
    <g key={`${cx}${cy}`}>
      <circle cx={cx} cy={cy} r={r + 3} fill="#0c0c0f" stroke="rgba(255,255,255,.25)" />
      <circle cx={cx} cy={cy} r={r} fill={`url(#l${id})`} />
      <circle cx={cx - 3} cy={cy - 3} r="2" fill="#fff" opacity=".55" />
    </g>
  )
  const frame = { stroke: 'rgba(255,255,255,.35)', strokeWidth: 1.2 }

  if (kind === 'watch')
    return (
      <svg viewBox="0 0 200 300" className={className} style={style} role="img" aria-label="Smartwatch">
        {grad}
        <rect x="62" y="6" width="76" height="110" rx="22" fill="#1a1a1e" />
        <rect x="62" y="184" width="76" height="110" rx="22" fill="#1a1a1e" />
        <rect x="42" y="84" width="116" height="132" rx="34" fill={`url(#g${id})`} {...frame} />
        <rect x="50" y="92" width="100" height="116" rx="28" fill="#050507" />
        <circle cx="100" cy="150" r="34" fill="none" stroke="#f59e0b" strokeWidth="5" strokeDasharray="150 64" strokeLinecap="round" />
        <circle cx="100" cy="150" r="22" fill="none" stroke="#38bdf8" strokeWidth="5" strokeDasharray="90 48" strokeLinecap="round" />
        <rect x="158" y="124" width="9" height="30" rx="4" fill={b} {...frame} />
        <rect x="50" y="92" width="100" height="116" rx="28" fill={`url(#s${id})`} />
      </svg>
    )

  if (kind === 'buds')
    return (
      <svg viewBox="0 0 200 300" className={className} style={style} role="img" aria-label="Wireless earbuds and case">
        {grad}
        <rect x="40" y="130" width="120" height="130" rx="42" fill={`url(#g${id})`} {...frame} />
        <path d="M40 188h120" stroke="rgba(0,0,0,.35)" strokeWidth="2" />
        <circle cx="100" cy="226" r="5" fill="#38bdf8" opacity=".9" />
        <g fill="#f4f4f5" {...frame}>
          <ellipse cx="72" cy="86" rx="20" ry="26" transform="rotate(-12 72 86)" />
          <rect x="62" y="96" width="12" height="52" rx="6" transform="rotate(-12 68 120)" />
          <ellipse cx="128" cy="86" rx="20" ry="26" transform="rotate(12 128 86)" />
          <rect x="126" y="96" width="12" height="52" rx="6" transform="rotate(12 132 120)" />
        </g>
        <rect x="40" y="130" width="120" height="130" rx="42" fill={`url(#s${id})`} />
      </svg>
    )

  if (kind === 'charger')
    return (
      <svg viewBox="0 0 200 300" className={className} style={style} role="img" aria-label="Wireless charger">
        {grad}
        <path d="M100 215c0 50 30 55 70 55" fill="none" stroke="#e4e4e7" strokeWidth="6" strokeLinecap="round" />
        <circle cx="100" cy="150" r="70" fill={`url(#g${id})`} {...frame} />
        <circle cx="100" cy="150" r="50" fill="none" stroke="rgba(0,0,0,.28)" strokeWidth="2" />
        <circle cx="100" cy="150" r="28" fill="none" stroke="rgba(0,0,0,.2)" strokeWidth="2" />
        <circle cx="100" cy="150" r="70" fill={`url(#s${id})`} />
      </svg>
    )

  if (kind === 'case')
    return (
      <svg viewBox="0 0 200 300" className={className} style={style} role="img" aria-label="Luxury phone case">
        {grad}
        <rect x="30" y="10" width="140" height="280" rx="36" fill={`url(#g${id})`} {...frame} />
        <rect x="42" y="22" width="68" height="68" rx="18" fill="rgba(0,0,0,.45)" />
        {[[62, 42], [90, 42], [76, 70]].map(([x, y]) => lens(x, y, 8))}
        <circle cx="100" cy="190" r="36" fill="none" stroke="rgba(255,255,255,.2)" strokeWidth="2" />
        <path d="M86 190h28" stroke="rgba(255,255,255,.25)" strokeWidth="2" strokeLinecap="round" />
        <rect x="30" y="10" width="140" height="280" rx="36" fill={`url(#s${id})`} />
      </svg>
    )

  // phone (back view, titanium)
  return (
    <svg viewBox="0 0 200 300" className={className} style={style} role="img" aria-label="Flagship smartphone">
      {grad}
      <rect x="28" y="8" width="144" height="284" rx="38" fill={`url(#g${id})`} {...frame} />
      <rect x="33" y="13" width="134" height="274" rx="34" fill="none" stroke="rgba(0,0,0,.35)" />
      <rect x="44" y="24" width="70" height="70" rx="20" fill="rgba(0,0,0,.4)" stroke="rgba(255,255,255,.2)" />
      {[[65, 45], [94, 45], [79, 74]].map(([x, y]) => lens(x, y))}
      <circle cx="124" cy="36" r="4" fill="#f4f4f5" opacity=".8" />
      <circle cx="100" cy="190" r="14" fill="none" stroke="rgba(255,255,255,.22)" strokeWidth="1.5" />
      <rect x="28" y="8" width="144" height="284" rx="38" fill={`url(#s${id})`} />
      <rect x="168" y="90" width="4" height="30" rx="2" fill="rgba(255,255,255,.4)" />
    </svg>
  )
}
