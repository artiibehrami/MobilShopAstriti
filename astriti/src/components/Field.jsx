export default function Field({ label, textarea, ...p }) {
  const cls = 'peer w-full rounded-2xl border border-black/10 bg-white px-4 pb-2 pt-6 text-sm text-zinc-900 outline-none lux focus:border-blue-500 focus:shadow-[0_0_0_4px_rgba(0,113,227,0.1)]'
  const Tag = textarea ? 'textarea' : 'input'
  return (
    <div className="relative">
      <Tag {...p} placeholder=" " rows={textarea ? 2 : undefined} className={cls + (textarea ? ' resize-none' : '')} />
      <label className="pointer-events-none absolute left-4 top-4 origin-left text-sm text-zinc-500 lux peer-focus:top-2 peer-focus:scale-75 peer-focus:text-blue-600 peer-[:not(:placeholder-shown)]:top-2 peer-[:not(:placeholder-shown)]:scale-75">
        {label}
      </label>
    </div>
  )
}
