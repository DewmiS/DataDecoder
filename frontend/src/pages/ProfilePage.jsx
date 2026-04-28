import PageLayout from "../components/PageLayout"
import StatCard from "../components/StatCard"
import { useNavigate } from "react-router-dom"


export default function ProfilePage() {
  const navigate = useNavigate()
  const {results} = useSession()

  const profile = results?.profile

  if (!profile) {
    return <div className="text-white p-10">No data found</div>
  }

  const avgMissing = (
    profile.column_details.reduce((sum, col) => sum + (col.null_percentage ?? 0), 0) / profile.column_details.length).toFixed(1)

  return (
    <PageLayout title="Dataset Profile" phase={2}>

      <div className="grid grid-cols-4 gap-4 mb-8">
        <StatCard label="ROWS"      value={profile.rows} />
        <StatCard label="COLUMNS"   value={profile.columns} />
        <StatCard label="NUMERIC"   value={profile.numeric_column_count} />
        <StatCard label="MISSING % (AVG PER COLUMN)" value={`${avgMissing}%`} />
      </div>

      <div className="bg-[#1a1a1a] rounded-xl p-5">

        <div className="grid grid-cols-6 text-xs text-gray-400 tracking-widest mb-3 px-1">
          <span>COLUMN</span>
          <span>TYPE</span>
          <span>MIN</span>
          <span>MAX</span>
          <span>MEAN</span>
          <span>NULLS</span>
        </div>

        {profile.column_details.map((col, i) => {
          const name     = Object.keys(col)[0]
          const type     = col[name]
          const badgeColor = "bg-gray-600"
          const nullPct  = col.null_percentage ?? 0

          return (
            <div
              key={i}
              className="grid grid-cols-6 py-3 border-t border-white/10
                         text-sm items-center"
            >
              <span className="text-white/80">{name}</span>

              <span>
                <span className={`${badgeColor} text-white text-xs
                                  px-2 py-0.5 rounded font-mono`}>
                  {type}
                </span>
              </span>

              <span className="text-white/60 font-mono text-xs">
                {col.min ?? "—"}
              </span>

              <span className="text-white/60 font-mono text-xs">
                {col.max ?? "—"}
              </span>

              <span className="text-white/60 font-mono text-xs">
                {col.mean != null ? Number(col.mean).toFixed(1) : "—"}
              </span>

              <div className="flex items-center gap-2">
                <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-500/60 rounded-full"
                    style={{ width: `${Math.min(nullPct, 100)}%` }}
                  />
                </div>
                <span className="text-white/40 text-xs w-8 text-right">
                  {nullPct}%
                </span>
              </div>

            </div>
          )
        })}

      </div>

      <div className="flex justify-between mt-8">
        <button
          onClick={() => navigate(-1)}
          className="border border-white/20 px-4 py-2 rounded text-sm
                     hover:border-white/40"
        >
          ← Back
        </button>
        <button
          onClick={() => navigate("/patterns")}
          className="border border-white/20 px-4 py-2 rounded text-sm
                     hover:border-white/40"
        >
          Patterns →
        </button>
      </div>

    </PageLayout>
  )
}