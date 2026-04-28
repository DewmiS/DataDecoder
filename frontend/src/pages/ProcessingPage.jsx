import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useSession } from "../context/SessionContext"
import { profile, correlation, clustering } from "../services/api"
import PageLayout from "../components/PageLayout"

export default function ProcessingPage() {
  const navigate = useNavigate()
  const { sessionId, datasetInfo, setResults } = useSession()

  const target = datasetInfo?.target

  const [steps, setSteps] = useState({
    parsing: "done",
    profile: "pending",
    correlation: "pending",
    clustering: "pending",
    explain: "pending"
  })

  useEffect(() => {
    if (!sessionId) return

    const runAnalysis = async () => {
      const finalResults = {}

      setSteps(prev => ({ ...prev, profile: "loading" }))
      try {
        const res = await profile(sessionId)
        finalResults.profile = res
        setSteps(prev => ({ ...prev, profile: "done" }))
      } catch (err) {
        console.error("Profile error:", err)
        setSteps(prev => ({ ...prev, profile: "error" }))
      }

      setSteps(prev => ({ ...prev, correlation: "loading" }))
      try {
        const res = await correlation(sessionId, target)
        finalResults.correlation = res
        setSteps(prev => ({ ...prev, correlation: "done" }))
      } catch (err) {
        console.error("Correlation error:", err)
        setSteps(prev => ({ ...prev, correlation: "error" }))
      }

      setSteps(prev => ({ ...prev, clustering: "loading" }))
      try {
        const res = await clustering(sessionId)
        finalResults.clustering = res
        setSteps(prev => ({ ...prev, clustering: "done" }))
      } catch (err) {
        console.error("Clustering error:", err)
        setSteps(prev => ({ ...prev, clustering: "error" }))
      }

      setResults(finalResults)
      
      setTimeout(() => {
        navigate("/analysis")
      }, 1000)
    }

    runAnalysis()
  }, [sessionId])

  return (
    <PageLayout title="Analyzing Dataset" phase={1}>
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-12 h-12 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mb-8" />

        <h1 className="text-4xl font-display font-extrabold mb-10 tracking-tight text-center">
          Decoding <span className="text-amber-400">your dataset...</span>
        </h1>

        <div className="w-full max-w-sm space-y-3">
          {Object.entries(steps).map(([key, value]) => (
            <div key={key} className="flex justify-between items-center bg-white/5 border border-white/5 px-4 py-3 rounded-xl transition-all duration-300">
              <span className="capitalize text-white/50 text-sm font-display font-bold tracking-wide">{key}</span>
              <div className="flex items-center gap-3">
                <span className={`text-[10px] font-mono-custom uppercase tracking-widest ${
                  value === "done" ? "text-green-400" :
                  value === "loading" ? "text-amber-400" :
                  value === "error" ? "text-red-400" :
                  "text-white/20"
                }`}>
                  {value}
                </span>
                {value === "loading" && <div className="w-1 h-1 rounded-full bg-amber-400 animate-ping" />}
              </div>
            </div>
          ))}
        </div>
      </div>
    </PageLayout>
  )
}