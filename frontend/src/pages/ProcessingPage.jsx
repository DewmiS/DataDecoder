import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useSession } from "../context/SessionContext"
import { profile, correlation, clustering } from "../services/api"

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

      // PROFILE
      setSteps(prev => ({ ...prev, profile: "loading" }))
      try {
        const res = await profile(sessionId)
        finalResults.profile = res
        setSteps(prev => ({ ...prev, profile: "done" }))
      } catch (err) {
        console.error("Profile error:", err)
        setSteps(prev => ({ ...prev, profile: "error" }))
      }

      // CORRELATION
      setSteps(prev => ({ ...prev, correlation: "loading" }))
      try {
        const res = await correlation(sessionId, target)
        finalResults.correlation = res
        setSteps(prev => ({ ...prev, correlation: "done" }))
      } catch (err) {
        console.error("Correlation error:", err)
        setSteps(prev => ({ ...prev, correlation: "error" }))
      }

      // CLUSTERING
      setSteps(prev => ({ ...prev, clustering: "loading" }))
      try {
        const res = await clustering(sessionId)
        finalResults.clustering = res
        setSteps(prev => ({ ...prev, clustering: "done" }))
      } catch (err) {
        console.error("Clustering error:", err)
        setSteps(prev => ({ ...prev, clustering: "error" }))
      }

      // EXPLAIN - Skipping call here as requested, it's done in StoryPage
      setSteps(prev => ({ ...prev, explain: "done" }))

      // Finalize
      setResults(finalResults)
      
      // Give a small delay so user can see the status
      setTimeout(() => {
        navigate("/profile")
      }, 1000)
    }

    runAnalysis()
  }, [sessionId])

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white flex flex-col items-center justify-center">

      <h1 className="text-3xl font-bold mb-8">Analyzing your data...</h1>

      <div className="w-full max-w-md space-y-4">

        {Object.entries(steps).map(([key, value]) => (
          <div key={key} className="flex justify-between items-center border-b border-white/10 pb-2">

            <span className="capitalize text-white/70">{key}</span>

            <span className={`text-sm ${
              value === "done" ? "text-green-400" :
              value === "loading" ? "text-amber-400" :
              value === "error" ? "text-red-400" :
              "text-white/30"
            }`}>
              {value}
            </span>

          </div>
        ))}

      </div>
    </div>
  )
}