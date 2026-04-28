export default function StatCard({ label, value }) {
  return (
    <div className="bg-white/5 p-6 rounded-xl border border-white/5">
      <p className="text-xs text-white/30 tracking-widest mb-3 font-mono-custom uppercase">{label}</p>
      <p className="text-3xl font-display font-extrabold text-white">{value}</p>
    </div>
  )
}