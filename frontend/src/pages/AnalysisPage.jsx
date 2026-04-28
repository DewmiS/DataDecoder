import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useSession } from "../context/SessionContext"
import PageLayout from "../components/PageLayout"
import StatCard from "../components/StatCard"

const CLUSTER_COLORS = [
  { border: "border-blue-500",   text: "text-blue-400",   bg: "bg-blue-500" },
  { border: "border-amber-500",  text: "text-amber-400",  bg: "bg-amber-500" },
  { border: "border-green-500",  text: "text-green-400",  bg: "bg-green-500" },
  { border: "border-purple-500", text: "text-purple-400", bg: "bg-purple-500" },
  { border: "border-rose-500",   text: "text-rose-400",   bg: "bg-rose-500" },
  { border: "border-cyan-500",   text: "text-cyan-400",   bg: "bg-cyan-500" },
  { border: "border-orange-500", text: "text-orange-400", bg: "bg-orange-500" },
  { border: "border-teal-500",   text: "text-teal-400",   bg: "bg-teal-500" },
  { border: "border-pink-500",   text: "text-pink-400",   bg: "bg-pink-500" },
  { border: "border-indigo-500", text: "text-indigo-400", bg: "bg-indigo-500" },
]

function getCellColor(value) {
  if (value >= 0.7)  return "bg-red-700"
  if (value >= 0.4)  return "bg-red-900/60"
  if (value <= -0.4) return "bg-indigo-900"
  return "bg-white/5"
}

export default function AnalysisPage() {
  const { results, datasetInfo } = useSession()
  const navigate = useNavigate()
  const [corrMode, setCorrMode] = useState("pearson")

  if (!results) {
    return <div className="text-white p-10 font-display">No analysis results found. Please upload data first.</div>
  }

  const profile = results.profile
  const correlation = results.correlation
  const clustering = results.clustering

  // --- TAB CONTENT COMPONENTS ---

  const renderProfile = () => {
    if (!profile) return <p className="text-white/40 italic">Profile data unavailable</p>
    const avgMissing = (profile.column_details.reduce((sum, col) => sum + (col.null_percentage ?? 0), 0) / profile.column_details.length).toFixed(1)
    
    return (
      <div className="animate-fade-up">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard label="ROWS"      value={profile.rows} />
          <StatCard label="COLUMNS"   value={profile.columns} />
          <StatCard label="NUMERIC"   value={profile.numeric_column_count} />
          <StatCard label="MISSING %" value={`${avgMissing}%`} />
        </div>

        <div className="bg-white/5 border border-white/5 rounded-2xl p-6 overflow-hidden">
          <div className="grid grid-cols-7 text-xs text-white/30 tracking-widest mb-4 px-1 font-mono-custom uppercase">
            <span>COLUMN</span>
            <span>TYPE</span>
            <span>MIN</span>
            <span>MAX</span>
            <span>MODE</span>
            <span>MEAN</span>
            <span>NULLS</span>
          </div>
          <div className="space-y-1">
            {profile.column_details.map((col, i) => {
              const name = Object.keys(col)[0]
              const type = col[name]
              const nullPct = col.null_percentage ?? 0
              return (
                <div key={i} className="grid grid-cols-7 py-4 border-t border-white/5 text-base items-center hover:bg-white/[0.02] transition-colors">
                  <span className="text-white/90 font-display font-bold">{name}</span>
                  <span>
                    <span className="bg-white/10 text-white/70 text-xs px-2.5 py-1 rounded font-mono-custom uppercase border border-white/5">
                      {type}
                    </span>
                  </span>
                  <span className="text-white/50 font-mono-custom text-sm">{col.min ?? "—"}</span>
                  <span className="text-white/50 font-mono-custom text-sm">{col.max ?? "—"}</span>
                  <span className="text-white/50 font-mono-custom text-sm">{col.mode ?? "—"}</span>
                  <span className="text-white/50 font-mono-custom text-sm">{col.mean != null ? Number(col.mean).toFixed(1) : "—"}</span>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-500/60" style={{ width: `${Math.min(nullPct, 100)}%` }} />
                    </div>
                    <span className="text-white/40 text-xs font-mono-custom w-10 text-right">{nullPct}%</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  const renderPatterns = () => {
    if (!correlation) return <p className="text-white/40 italic">Correlation data unavailable</p>
    const selectedMode = correlation[corrMode]
    const columns = Object.keys(selectedMode)
    const featureImportance = correlation.feature_importance ?? {}
    const maxImportance = Math.max(...Object.values(featureImportance), 1)

    return (
      <div className="animate-fade-up space-y-12">
        {Object.keys(featureImportance).length > 0 && (
          <div className="bg-white/5 border border-white/5 rounded-2xl p-8">
            <p className="text-xs text-white/30 tracking-widest mb-6 font-mono-custom uppercase">
              FEATURE IMPORTANCE → <span className="text-amber-400">{datasetInfo?.target}</span>
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {Object.entries(featureImportance)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 8)
                .map(([col, val]) => (
                  <div key={col} className="bg-white/5 p-4 rounded-xl border border-white/5">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-white/90 font-display font-bold truncate pr-2">{col}</span>
                      <span className="text-amber-500 font-mono-custom font-bold">{Math.round((val / maxImportance) * 100)}%</span>
                    </div>
                    <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-500" style={{ width: `${(val / maxImportance) * 100}%` }} />
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        <div className="bg-white/5 border border-white/5 rounded-2xl p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <p className="text-xs text-white/30 tracking-widest font-mono-custom uppercase mb-1">CORRELATION MATRIX</p>
              <p className="text-white/60 text-sm font-display">Discovery of relationships between numeric features</p>
            </div>
            <div className="inline-flex rounded-full border border-white/15 bg-[#0f0f0f] p-1">
              {["pearson", "spearman"].map((m) => (
                <button
                  key={m}
                  onClick={() => setCorrMode(m)}
                  className={`px-8 py-2.5 text-xs rounded-full capitalize transition-all font-display font-bold ${
                    corrMode === m ? "bg-amber-500 text-black shadow-lg" : "text-white/40 hover:text-white/70"
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto pb-4 custom-scrollbar">
            <table className="text-xs border-separate border-spacing-1 mx-auto">
              <thead>
                <tr>
                  <th className="sticky left-0 bg-[#161616] z-10 p-2" />
                  {columns.map(col => (
                    <th key={col} className="px-2 py-4 text-white/30 font-mono-custom font-normal whitespace-nowrap min-w-[72px] max-w-[72px] overflow-hidden text-ellipsis" title={col}>
                      <div className="rotate-[-45deg] translate-y-2">{col.length > 10 ? col.substring(0, 8) + ".." : col}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {columns.map(row => (
                  <tr key={row}>
                    <td className="sticky left-0 bg-[#161616] z-10 pr-6 py-3 text-white/50 text-right whitespace-nowrap font-mono-custom text-sm font-bold" title={row}>
                      {row}
                    </td>
                    {columns.map(col => {
                      const val = selectedMode[row][col]
                      const isSelf = row === col
                      return (
                        <td
                          key={col}
                          className={`w-16 h-16 text-center font-mono-custom text-xs font-bold rounded-lg transition-all hover:scale-110 cursor-default shadow-inner ${getCellColor(val)} ${isSelf ? "opacity-20" : "opacity-100"}`}
                        >
                          {val.toFixed(2)}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    )
  }

  const renderSegments = () => {
    if (!clustering || clustering.status === "skipped") {
      return (
        <div className="animate-fade-up bg-white/5 border border-white/5 rounded-2xl p-10 text-center">
          <p className="text-white/40 font-display">{clustering?.reason ?? "Segments skipped: data lacks clear separation structure."}</p>
        </div>
      )
    }
    const bestK = clustering["best_k"]
    const totalRows = Object.values(clustering.cluster_sizes).reduce((a, b) => a + b, 0)
    const clusters = Array.from({ length: bestK }, (_, i) => ({
      id: i,
      size: clustering.cluster_sizes[i],
      stats: clustering.cluster_summary[String(i)] ?? {}
    }))

    return (
      <div className="animate-fade-up">
        <p className="text-white/40 text-xs mb-8 font-mono-custom uppercase tracking-widest">K-Means · k={bestK} · Automated Selection</p>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {clusters.map((cluster, i) => {
            const color = CLUSTER_COLORS[i] ?? CLUSTER_COLORS[0]
            const pct = Math.round((cluster.size / totalRows) * 100)
            return (
              <div key={cluster.id} className={`bg-white/5 rounded-2xl p-8 border-l-4 ${color.border} hover:bg-white/[0.08] transition-colors shadow-xl`}>
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <h3 className={`font-display font-black text-3xl ${color.text}`}>Segment {String.fromCharCode(65 + i)}</h3>
                    <p className="text-white/40 text-sm font-mono-custom mt-1">{cluster.size} rows · {pct}% of dataset</p>
                  </div>
                </div>
                <div className="space-y-6">
                  {cluster.stats.numeric && (
                    <div>
                      <p className="text-xs text-white/20 tracking-widest font-mono-custom uppercase mb-3">Averages</p>
                      <div className="space-y-2">
                        {Object.entries(cluster.stats.numeric).map(([col, val]) => (
                          <div key={col} className="flex justify-between text-sm">
                            <span className="text-white/50">{col}</span>
                            <span className="font-mono-custom text-amber-400 font-bold">{val?.toFixed ? val.toFixed(2) : val}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {cluster.stats.categorical && (
                    <div>
                      <p className="text-xs text-white/20 tracking-widest font-mono-custom uppercase mb-3">Dominant</p>
                      <div className="space-y-2">
                        {Object.entries(cluster.stats.categorical).map(([col, val]) => (
                          <div key={col} className="flex justify-between text-sm">
                            <span className="text-white/50">{col}</span>
                            <span className="font-mono-custom text-green-400 font-bold">{val}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <PageLayout title="Analysis Dashboard" phase={2}>
      
      <div className="space-y-24">
        
        {/* SECTION: PROFILE */}
        <section id="profile">
          <div className="flex items-center gap-3 mb-8">
            <span className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-display font-bold">◈</span>
            <h3 className="text-2xl font-display font-extrabold tracking-tight">Dataset Profile</h3>
          </div>
          {renderProfile()}
        </section>

        {/* SECTION: PATTERNS */}
        <section id="patterns" className="pt-12 border-t border-white/5">
          <div className="flex items-center gap-3 mb-8">
            <span className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-display font-bold">◎</span>
            <h3 className="text-2xl font-display font-extrabold tracking-tight">Pattern Discovery</h3>
          </div>
          {renderPatterns()}
        </section>

        {/* SECTION: SEGMENTS */}
        <section id="segments" className="pt-12 border-t border-white/5">
          <div className="flex items-center gap-3 mb-8">
            <span className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-display font-bold">⬡</span>
            <h3 className="text-2xl font-display font-extrabold tracking-tight">Data Segments</h3>
          </div>
          {renderSegments()}
        </section>

      </div>

      <div className="flex justify-between mt-24 border-t border-white/5 pt-10">
        <button
          onClick={() => navigate("/upload")}
          className="border border-white/10 px-6 py-3 rounded-xl text-sm font-display font-bold
                     hover:border-white/30 transition-all hover:bg-white/5"
        >
          ← New Analysis
        </button>
        <button
          onClick={() => navigate("/story")}
          className="bg-amber-500 text-black px-10 py-3 rounded-xl text-sm font-display font-bold
                     hover:bg-amber-400 transition-all hover:scale-[1.05] shadow-lg shadow-amber-500/20"
        >
          Next: AI Story →
        </button>
      </div>

    </PageLayout>
  )
}
