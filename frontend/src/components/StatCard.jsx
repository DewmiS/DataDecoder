export default function StatCard({ label, value }) {
  return (
    <div className="bg-[#1a1a1a] p-5 rounded-xl border border-white/5">
      <p className="text-[10px] text-white/30 tracking-widest mb-2 font-mono-custom uppercase">{label}</p>
      <p className="text-2xl font-display font-bold text-white">{value}</p>
    </div>
  )
}