import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSession } from '../context/SessionContext'
import { uploadCSV } from '../services/api'

export default function UploadPage() {
  const navigate = useNavigate()
  const { setSessionId, setDatasetInfo } = useSession()
  const [isDragging, setIsDragging] = useState(false)
  const [loading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  async function handleFile(file) {
    if (!file || !file.name.endsWith('.csv')) {
      setError('Please upload a CSV file')
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('File must be under 10MB')
      return
    }

    try {
      setIsLoading(true)
      setError(null)
      const data = await uploadCSV(file)
      setSessionId(data.session_id)
      setDatasetInfo({
        filename: data.filename,
        rows: data.rows,
        columns: data.columns,
        column_names: data.column_names
      })
      navigate('/setup')
    } catch (err) {
      setError(err.response?.data?.detail || 'Upload failed')
    } finally {
      setIsLoading(false)
    }
  }

  function handleDrop(e) {
    e.preventDefault()
    setIsDragging(false)
    handleFile(e.dataTransfer.files[0])
  }

  function handleInputChange(e) {
    handleFile(e.target.files[0])
  }

  return (
  <div className="min-h-screen bg-[#0f0f0f] text-white">

    <nav className="flex items-center justify-between px-8 py-5 border-b border-white/5">
      <div className="flex items-center gap-3">
        <span className="text-lg font-semibold tracking-tight">Explain My Data</span>
        <span className="text-[10px] font-mono bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-full">
          AI
        </span>
      </div>
      <div className="flex items-center gap-2">
        {[0,1,2,3,4].map(i => (
          <div
            key={i}
            className={`rounded-full transition-all ${
              i === 0
                ? 'w-6 h-2 bg-amber-400'
                : 'w-2 h-2 bg-white/20'
            }`}
          />
        ))}
      </div>
    </nav>

    <div className="flex flex-col items-center justify-center pt-24 pb-12 px-4 text-center">
      <h1 className="text-5xl font-bold tracking-tight leading-tight mb-4">
        What's inside<br />your dataset?
      </h1>
      <p className="text-white/40 font-mono text-sm max-w-md leading-relaxed">
        Drop any CSV. We'll profile it, find patterns, segment your data,
        and write you a plain-English story — in seconds.
      </p>
    </div>

    <div className="flex justify-center px-4">
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className="w-full max-w-xl border border-dashed border-white/15 rounded-2xl bg-white/0.03 hover:bg-white/0.05 hover:border-amber-500/40 transition-all duration-300 py-16 flex flex-col items-center gap-3 cursor-pointer"
        onClick={() => document.getElementById('fileInput').click()}
      >
        <p className="text-amber-400 font-mono text-sm font-medium">
          {loading ? 'Uploading...' : 'Drop your CSV here'}
        </p>
        <p className="text-white/40 text-sm">or click to browse</p>
        <p className="text-white/20 font-mono text-xs mt-2">Max 10MB · CSV files only</p>

        <input
          id="fileInput"
          type="file"
          accept=".csv"
          className="hidden"
          onChange={handleInputChange}
        />
      </div>
    </div>

  </div>
)
}