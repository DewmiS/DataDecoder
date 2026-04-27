export default function StatCard({ label, value }) {
  return (
    <div className="bg-[#1a1a1a] p-5 rounded-xl shadow-sm">
      <p className="text-xs text-gray-400 mb-1">{label}</p>
      <p className="text-xl font-semibold">{value}</p>
    </div>
  )
}