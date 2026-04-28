import { useState } from "react"
import PageLayout from "../components/PageLayout"
import { useNavigate } from "react-router-dom"
import { useSession } from "../context/SessionContext"

function getCellColor(value) {
  if (value >= 0.7)  return "bg-red-700"
  if (value >= 0.4)  return "bg-red-900/60"
  if (value <= -0.4) return "bg-indigo-900"
  return "bg-white/5"
}

export default function PatternsPage() {
  const {results, datasetInfo} = useSession()
  const navigate = useNavigate()
  const [mode, setMode] = useState("pearson")

  const correlation = results?.correlation

  if (!correlation) {
    return <div className="text-white p-10">No correlation data found</div>
  }

  const selectedMode = correlation[mode]
  const columns = Object.keys(selectedMode)
  const featureImportance = correlation.feature_importance ?? {}
  const maxImportance = Math.max(...Object.values(featureImportance))

  return (
    <PageLayout title="Pattern Discovery" phase={3}>

      <div className="flex gap-8">

        <div className="flex-1 min-w-0">
          <p className="text-xs text-gray-400 tracking-widest mb-4">
            CORRELATION HEATMAP
          </p>

          <div className="inline-flex mb-4 rounded-full border border-white/15 bg-white/5 p-0.5">
            {["pearson", "spearman"].map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`px-4 py-1.5 text-xs rounded-full capitalize transition-all duration-200 ${
                  mode === m
                    ? "bg-white text-black font-semibold shadow"
                    : "text-white/50 hover:text-white/80"
                }`}
              >
                {m}
              </button>
            ))}
          </div>

          <div className="overflow-auto">
            <table className="text-xs border-collapse">
              <thead>
                <tr>
                  <th className="w-8" />
                  {columns.map(col => (
                    <th key={col} className="px-2 py-1 text-gray-400 font-normal text-center">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {columns.map(row => (
                  <tr key={row}>
                    <td className="pr-2 text-gray-400 text-right whitespace-nowrap">
                      {row}
                    </td>
                    {columns.map(col => {
                      const val = selectedMode[row][col]
                      return (
                        <td
                          key={col}
                          className={`w-14 h-14 text-center font-mono font-semibold ${getCellColor(val)}`}
                        >
                          {val.toFixed(2)}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
              <thead>
                <tr>
                  <th className="w-8" />
                  {columns.map(col => (
                    <th key={col} className="px-2 py-1 text-gray-400 font-normal text-center">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
            </table>
          </div> 
        </div>

        {Object.keys(featureImportance).length > 0 && ( // Feature Importance
          <div className="w-72">
            <p className="text-xs text-gray-400 tracking-widest mb-4">
              FEATURE IMPORTANCE → {datasetInfo?.target ?? "TARGET"}
            </p>

            <div className="space-y-3">
              {Object.entries(featureImportance)
                .sort((a, b) => b[1] - a[1])
                .map(([col, val]) => (
                  <div key={col}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-amber-400">{col}</span>
                      <span className="text-white/50">
                        {Math.round((val / maxImportance) * 100)}%
                      </span>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-500 rounded-full"
                        style={{ width: `${(val / maxImportance) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

      </div>

      <div className="flex justify-between mt-10">
        <button
          onClick={() => navigate("/profile")}
          className="border border-white/20 px-4 py-2 rounded text-sm hover:border-white/40"
        >
          ← Back
        </button>
        <button
          onClick={() => navigate("/clusters")}
          className="border border-white/20 px-4 py-2 rounded text-sm hover:border-white/40"
        >
          Clusters →  
        </button>
      </div>

    </PageLayout>
  )
}