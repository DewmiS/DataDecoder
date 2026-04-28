export default function Footer() {
  return (
    <footer className="px-10 py-6 border-t border-white/5 flex items-center justify-between relative z-10 bg-[#0f0f0f]/50 backdrop-blur-sm">
      <div className="flex items-center gap-3">
        <span className="font-display text-sm font-bold">DataDecoder</span>
        <span className="text-[10px] bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full font-mono-custom">AI</span>
      </div>
      <p className="text-white/20 text-xs font-mono-custom">Your data, your insights. © 2026</p>
    </footer>
  )
}
