import { useNavigate } from 'react-router-dom'
import Footer from '../components/Footer'

const FEATURES = [
  { icon: "◈", title: "Zero setup", body: "No notebooks, no installs. Upload a file and get results in under 60 seconds." },
  { icon: "◎", title: "Target-aware", body: "Set a target column to unlock ML mode: feature importance via Random Forest." },
  { icon: "⬡", title: "Smart clustering", body: "We skip clustering when data has no structure — no misleading results." },
  { icon: "✦", title: "AI narrative", body: "Powered by LLM — turns numbers into decisions, not just dashboards." },
  { icon: "↓", title: "PDF export", body: "One-click report download. Share findings without sharing your raw data." },
  { icon: "◻", title: "Session-based", body: "Your data never persists. Analyse freely, leave nothing behind." },
]

export default function LandingPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white flex flex-col relative font-sans overflow-x-hidden">

      <div className="flex-1 relative z-10">
        <nav className="flex items-center justify-between px-8 py-5 border-b border-white/5 relative z-10">
          <div className="flex items-center gap-3">
            <span className="font-display text-lg font-bold tracking-tight">DataDecoder</span>
            <span className="text-[10px] bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full font-mono-custom">
              AI
            </span>
          </div>
          <button
            onClick={() => navigate("/upload")}
            className="text-xs text-white/60 hover:text-white border border-white/10 hover:border-amber-500/40 px-4 py-2 rounded-lg transition-all duration-200"
          >
            Open App →
          </button>
        </nav>

        <section className="relative min-h-[80vh] flex flex-col items-center justify-center px-6 text-center">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-150 h-150 rounded-full bg-amber-500/3 blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 text-xs text-amber-400 border border-amber-500/30 bg-amber-500/5 px-3 py-1.5 rounded-full mb-8 font-mono-custom animate-fade-up">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse inline-block" />
              CSV → Insights
            </div>

            <h1 className="font-display text-6xl md:text-8xl font-extrabold leading-[0.95] tracking-tight mb-6 animate-fade-up-delay">
              What's hiding
              <br />
              <span className="text-amber-400">in your data?</span>
            </h1>

            <p className="text-white/40 text-lg max-w-xl mx-auto mb-4 leading-relaxed animate-fade-up-delay2">
              Upload a CSV. Get instant profiling, correlation analysis, clustering, and an AI-written narrative — no code, no setup.
            </p>

            <div className="flex items-center justify-center gap-4 animate-fade-up-delay2">
              <button
                onClick={() => navigate("/upload")}
                className="hover:bg-amber-500 bg-amber-400 text-black font-display font-bold px-8 py-3.5 rounded-xl text-base transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              >
                Analyze your data
              </button>
              <span className="text-white/20 text-sm font-mono-custom">free · no login</span>
            </div>
          </div>
        </section>

        <section className="px-6 py-24 border-t border-white/5">
          <div className="max-w-5xl mx-auto">
            <p className="text-xs text-white/20 tracking-widest font-mono-custom mb-2">FEATURES</p>
            <h2 className="font-display text-4xl font-bold mb-16">Everything, out of the box</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {FEATURES.map(f => (
                <div
                  key={f.title}
                  className="feature-card bg-[#141414]/50 backdrop-blur-sm border border-white/5 rounded-xl p-6 transition-all duration-200 cursor-default"
                >
                  <span className="feature-icon text-white/20 text-2xl block mb-4 transition-colors duration-200">{f.icon}</span>
                  <p className="font-display font-bold text-base mb-2">{f.title}</p>
                  <p className="text-white/40 text-sm leading-relaxed">{f.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  )
}