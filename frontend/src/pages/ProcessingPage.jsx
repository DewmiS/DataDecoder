import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useSession } from "../context/SessionContext"
import { profile, correlation, clustering, explain } from "../services/api"

export default function ProcessingPage() {
  const navigate = useNavigate()
  const { sessionId, datasetInfo } = useSession()

  const target = datasetInfo?.target

  const [steps, setSteps] = useState({
    parsing: "done",
    profile: "pending",
    correlation: "pending",
    clustering: "pending",
    explain: "pending"
  })

  const [results, setResults] = useState({
    profile: null,
    correlation: null,
    clustering: null,
    explain: null
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
      } catch {
        setSteps(prev => ({ ...prev, profile: "error" }))
        return
      }

      // CORRELATION
      setSteps(prev => ({ ...prev, correlation: "loading" }))
      try {
        const res = await correlation(sessionId, target)
        finalResults.correlation = res
        setSteps(prev => ({ ...prev, correlation: "done" }))
      } catch {
        setSteps(prev => ({ ...prev, correlation: "error" }))
      }

      // CLUSTERING
      setSteps(prev => ({ ...prev, clustering: "loading" }))
      try {
        const res = await clustering(sessionId)
        finalResults.clustering = res
        setSteps(prev => ({ ...prev, clustering: "done" }))
        navigate("/profile", {
          state: {
            results: finalResults
          }
        })

        return // stop further execution

      } catch {
        setSteps(prev => ({ ...prev, clustering: "error" }))
      }

      // EXPLAIN
      // setSteps(prev => ({ ...prev, explain: "loading" }))
      // try {
      //   const res = await explain(sessionId, target)

      //   const finalResults = {
      //     ...results,
      //     explain: res
      //   }

      //   setResults(finalResults)
      //   setSteps(prev => ({ ...prev, explain: "done" }))

      //   navigate("/results", {
      //     state: {
      //       results: finalResults
      //     }
      //   })

      // } catch {
      //   setSteps(prev => ({ ...prev, explain: "error" }))
      // }
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