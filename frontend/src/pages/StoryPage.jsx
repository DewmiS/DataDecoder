import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useSession } from "../context/SessionContext"
import { explain } from "../services/api"
import { report } from "../services/api"
import PageLayout from "../components/PageLayout"
import ReactMarkdown from "react-markdown"

export default function StoryPage() {
  const navigate = useNavigate()
  const { sessionId, datasetInfo, results } = useSession()

  const [story, setStory]     = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  const target = datasetInfo?.target
  const correlation = results?.correlation ?? {}
  const cluster = results?.clustering ?? {}
  const featureImportance = correlation?.feature_importance ?? {}
  const maxFeature   = Math.max(...Object.values(featureImportance))
  const clusterSizes = cluster?.cluster_sizes ?? {}

  const downloadReport = async () => {
    try {
      const blob = await report(sessionId)

      const url = window.URL.createObjectURL(new Blob([blob]))

      const link = document.createElement("a")
      link.href = url
      link.setAttribute("download", "AI_Report.pdf")

      document.body.appendChild(link)
      link.click()
      link.remove()

      window.URL.revokeObjectURL(url)

    } catch (err) {
      console.error("Download failed", err)
    }
  }

  useEffect(() => {
    if (!sessionId) return

    const fetchStory = async () => {
      try {
        const res = await explain(sessionId, target)
        setStory(res)
      } catch (err) {
        setError("Failed to generate AI story")
      } finally {
        setLoading(false)
      }
    }

    fetchStory()
  }, [sessionId])

  if (loading) {
    return (
      <PageLayout title="Your Data Story" phase={5}>
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent
                          rounded-full animate-spin" />
          <p className="text-white/40 text-sm">LLM is reading your data...</p>
        </div>
      </PageLayout>
    )
  }

  if (error) {
    return (
      <PageLayout title="Your Data Story" phase={5}>
        <p className="text-red-400">{error}</p>
        <div className="grid grid-cols-2 gap-4 mb-10">

          <div className="bg-[#1a1a1a] rounded-xl p-4">
            <p className="text-[10px] text-white/30 tracking-widest mb-3 font-mono-custom">TOP FEATURES</p>
            <div className="space-y-2">
              {Object.entries(featureImportance)
              .sort((a, b) => b[1] - a[1])
              .map(([col, val]) => (
                <div key={col}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-amber-400 font-display font-bold">{col}</span>
                    <span className="text-white/40 font-mono-custom">
                      {val.toFixed(3)}
                    </span>
                  </div>
                  <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-500 rounded-full"
                      style={{ width: `${(val / maxFeature) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
          </div>
        </div>

        <div className="bg-[#1a1a1a] rounded-xl p-4">
          <p className="text-white/30 text-xs mb-3">CLUSTER SIZES</p>
          <div className="space-y-3">
            {Object.entries(clusterSizes).map(([k, v], i) => {
              const total = Object.values(clusterSizes).reduce((a, b) => a + b, 0)
              const pct   = Math.round((v / total) * 100)
              const colors = ["text-blue-400", "text-amber-400", "text-green-400"]

              return (
                <div key={k} className="flex justify-between items-center text-sm">
                  <span className={colors[i] ?? colors[0]}>
                    Cluster {String.fromCharCode(65 + i)}
                  </span>
                  <span className="text-white/60 font-mono">
                    {v} rows · {pct}%
                  </span>
                </div>
              )
            })}
          </div>
        </div>

      </div>
      </PageLayout>
    )
  }


  if (!featureImportance) {
    return <div className="text-white p-10">No Top features found</div>
  }

  if (!clusterSizes) {
    return <div className="text-white p-10">No Clusters found</div>
  }

  return (
    <PageLayout title="Your Data Story" phase={3}>

      <div className="inline-flex items-center gap-2 text-[10px] text-amber-400 font-mono-custom
                      border border-amber-500/30 px-3 py-1 rounded-full mb-6">
        ✦ DATA STORY
      </div>

      <div className="bg-[#1a1a1a] rounded-xl p-6 mb-6 prose prose-invert
                      prose-headings:text-white prose-p:text-white/70
                      prose-strong:text-amber-400 max-w-none">
        <ReactMarkdown>{story?.explanation}</ReactMarkdown>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-10">

        {featureImportance && Object.keys(featureImportance).length > 0 && 
          <div className="bg-[#1a1a1a] rounded-xl p-4">
          <p className="text-[10px] text-white/30 tracking-widest mb-3 font-mono-custom uppercase">TOP FEATURES</p>
          <div className="space-y-2">
            {Object.entries(featureImportance)
              .sort((a, b) => b[1] - a[1])
              .map(([col, val]) => (
                <div key={col}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-amber-400 font-display font-bold">{col}</span>
                    <span className="text-white/40 font-mono-custom">
                      {val.toFixed(3)}
                    </span>
                  </div>
                  <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-500 rounded-full"
                      style={{ width: `${(val / maxFeature) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
          </div>
        </div>}

        <div className="bg-[#1a1a1a] rounded-xl p-4">
          <p className="text-white/30 text-xs mb-3">CLUSTER SIZES</p>
          <div className="space-y-3">
            {Object.entries(clusterSizes).map(([k, v], i) => {
              const total = Object.values(clusterSizes).reduce((a, b) => a + b, 0)
              const pct   = Math.round((v / total) * 100)
              const colors = ["text-blue-400", "text-amber-400", "text-green-400"]

              return (
                <div key={k} className="flex justify-between items-center text-sm">
                  <span className={colors[i] ?? colors[0]}>
                    Cluster {String.fromCharCode(65 + i)}
                  </span>
                  <span className="text-white/60 font-mono">
                    {v} rows · {pct}%
                  </span>
                </div>
              )
            })}
          </div>
        </div>

      </div>

      <div className="flex justify-between">
        <button
          onClick={() => navigate("/analysis")}
          className="border border-white/10 px-5 py-2.5 rounded-xl text-sm font-display
                     hover:border-white/30 transition-all duration-200"
        >
          ← Back
        </button>
        <button
          className="bg-amber-500 text-black px-8 py-2.5 rounded-xl text-sm font-display
                     font-bold hover:bg-amber-400 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
          onClick={downloadReport}
        >
          Export AI Report (PDF) →
        </button>
      </div>

    </PageLayout>
  )
}