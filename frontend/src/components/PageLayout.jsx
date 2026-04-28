import { useNavigate } from "react-router-dom"
import { useSession } from "../context/SessionContext"
import Footer from "./Footer"

export default function PageLayout({ title, phase, children }) {

  const navigate = useNavigate()
  const { clearSession } = useSession()

  function handleNewAnalysis() {
    clearSession()
    navigate("/upload")
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white flex flex-col relative font-sans">
      <div className="flex-1 px-10 py-8 relative z-10">

        <div className="flex justify-between items-center mb-10">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate("/")}>
            <span className="font-display text-lg font-bold tracking-tight">DataDecoder</span>
            <span className="text-[10px] bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full font-mono-custom">
              AI
            </span>
          </div>

          <div className="flex items-center">
            <button
              onClick={handleNewAnalysis}
              className="text-xs hover:text-white border border-white/10
                         hover:border-amber-500/40 px-3 py-1.5 mr-5 rounded-lg transition-all duration-200 font-display font-bold bg-amber-500 text-black"
            >
              + New Analysis
            </button>
            <div className="flex gap-2">
              {[1,2,3].map(i => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full ${
                    i <= phase ? "bg-amber-400" : "bg-white/10"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-3xl font-display font-extrabold">
            {title}
            <span className="ml-3 text-xs bg-white/5 border border-white/10 px-2 py-1 rounded font-mono-custom text-white/40">
              PHASE {phase}
            </span>
          </h2>
        </div>

        {children}
      </div>

      <Footer />
    </div>
  )
}
