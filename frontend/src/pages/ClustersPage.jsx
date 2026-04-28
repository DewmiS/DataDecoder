import PageLayout from "../components/PageLayout"
import { useNavigate } from "react-router-dom"
import { useSession } from "../context/SessionContext"

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

export default function ClustersPage() {
  const {results} = useSession()
  const navigate = useNavigate()

  const clustering = results?.clustering

  if (!clustering || clustering.status === "skipped") {
    return (
      <PageLayout title="Data-Driven Segments" phase={4}>
        <p className="text-white/40">
          {clustering?.reason ?? "No clustering data available"}
        </p>
        <div className="flex justify-between">
        <button
          onClick={() => navigate("/patterns")}
          className="border border-white/20 px-4 py-2 rounded text-sm hover:border-white/40"
        >
          ← Back
        </button>
        <button
          onClick={() => navigate("/story")}
          className="border border-white/20 px-4 py-2 rounded text-sm hover:border-white/40"
        >
          AI Story →
        </button>
      </div>
      </PageLayout>
    )
  }

  const clusterSizes   = clustering.cluster_sizes
  const clusterSummary = clustering.cluster_summary
  const bestK          = clustering["best_k"]

  const clusters = Array.from({ length: bestK }, (_, i) => ({
    id: i,
    size: clusterSizes[i],
    stats: clusterSummary[String(i)] ?? {}
  }))

  const totalRows = Object.values(clusterSizes).reduce((a, b) => a + b, 0)

  return (
    <PageLayout title="Data-Driven Segments" phase={4}>

      <p className="text-white/40 text-sm mb-8">
        K-Means · k={bestK} selected via silhouette score
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
        {clusters.map((cluster, i) => {
          const color = CLUSTER_COLORS[i] ?? CLUSTER_COLORS[0]
          const pct   = Math.round((cluster.size / totalRows) * 100)

          return (
            <div
              key={cluster.id}
              className={`bg-[#1a1a1a] rounded-xl p-5 border-t-2 ${color.border}`}
            >
              <p className={`font-bold text-lg mb-1 ${color.text}`}>
                Cluster {String.fromCharCode(65 + i)}
              </p>
              <p className="text-white/40 text-sm mb-4">
                {cluster.size} rows · {pct}%
              </p>

              <div className="space-y-1">
                {Object.entries(cluster.stats).map(([col, val]) => (
                  <div key={col} className="flex justify-between text-sm">
                    <span className="text-white/50">Avg {col}</span>
                    <span className="font-mono">
                      {typeof val === "number" ? val.toFixed(2) : val}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      <div className="flex justify-between">
        <button
          onClick={() => navigate("/patterns")}
          className="border border-white/20 px-4 py-2 rounded text-sm hover:border-white/40"
        >
          ← Back
        </button>
        <button
          onClick={() => navigate("/story")}
          className="border border-white/20 px-4 py-2 rounded text-sm hover:border-white/40"
        >
          AI Story →
        </button>
      </div>

    </PageLayout>
  )
}