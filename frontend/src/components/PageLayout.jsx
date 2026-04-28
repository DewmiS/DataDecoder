import { useNavigate } from "react-router-dom"
import { useSession } from "../context/SessionContext"

export default function PageLayout({ title, phase, children }) {

  const navigate = useNavigate()
  const { clearSession } = useSession()

  function handleNewAnalysis() {
    clearSession()
    navigate("/")
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white px-10 py-8">

      <div className="flex justify-between items-center mb-10">
        <h1 className="text-lg font-semibold tracking-wide">
          DataDecoder <span className="text-yellow-500 text-xs ml-2">AI</span>
        </h1>

        <div className="flex justify-between items-center mb-10">
          <button
            onClick={handleNewAnalysis}
            className="text-xs hover:text-white/80 border border-white/10
                       hover:border-white/30 px-3 py-1.5 mr-5 rounded-lg transition bg-yellow-500 text-black font-bold"
          >
            + New Analysis
          </button>
          <div className="flex gap-2">
            {[1,2,3,4,5].map(i => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full ${
                  i <= phase ? "bg-green-400" : "bg-gray-600"
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-bold">
          {title}
          <span className="ml-3 text-xs bg-gray-700 px-2 py-1 rounded">
            PHASE {phase}
          </span>
        </h2>
      </div>

      {children}
    </div>
  )
}