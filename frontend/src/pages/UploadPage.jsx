import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSession } from '../context/SessionContext'
import { uploadCSV } from '../services/api'
import PageLayout from '../components/PageLayout'

export default function UploadPage() {
  const navigate = useNavigate()
  const { setSessionId, setDatasetInfo, datasetInfo, clearSession } = useSession()

  const [loading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [selectedTarget, setSelectedTarget] = useState("")

  async function handleFile(file) {
    if (!file || !file.name.endsWith('.csv')) {
      setError('Please upload a CSV file')
      return
    }

    if(datasetInfo){
      const confirmed = window.confirm("This will clear your current session. Continue?")
      if(!confirmed){
        return
      }
      clearSession()
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
        column_names: data.column_names,
        preview: data.preview
      })

    } catch (err) {
      setError(err.response?.data?.detail || 'Upload failed')
    } finally {
      setIsLoading(false)
    }
  }

  function handleAnalyze() {
    setDatasetInfo(prev => ({
      ...prev,
      target: selectedTarget || null
    }))

    navigate("/processing")
  }

  function handleDrop(e) {
    e.preventDefault()
    handleFile(e.dataTransfer.files[0])
  }

  function handleInputChange(e) {
    handleFile(e.target.files[0])
  }

  return (
    <PageLayout title="Dataset Upload" phase={1}>
      <div className="text-center mb-10 px-4">
        <p className="text-white/40 text-xl max-w-md mx-auto leading-relaxed">
          Upload a CSV and explore patterns, clusters, and AI insights instantly.
        </p>
      </div>

      <div className="px-4 flex justify-center">
        <div className="w-full max-w-3xl mx-auto flex flex-col gap-3">

          <div className="flex-1">
            <div
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              onClick={!datasetInfo ? () => document.getElementById('fileInput').click() : undefined}
              className={`bg-white/5 border border-dashed border-white/15 rounded-2xl p-6 transition ${
                loading ? "opacity-50 pointer-events-none" : "hover:border-amber-500/40 cursor-pointer"
              }`}
            >
              {!datasetInfo ? (
                <div className="py-5 flex flex-col items-center gap-3">
                  <p className="text-amber-400 text-sm font-display font-bold">
                    {loading ? 'Uploading...' : 'Drop your CSV here'}
                  </p>
                  <p className="text-white/40 text-sm">or click to browse</p>
                  <p className="text-white/20 text-[10px] font-mono-custom uppercase tracking-widest">Max 10MB · CSV only</p>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  <div className="flex justify-between items-center">
                    <p className="text-green-400 text-sm font-mono-custom">
                      {datasetInfo.filename}
                    </p>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        clearSession()
                      }}
                      className="text-xs text-red-400 hover:text-red-300 font-display font-bold"
                    >
                      Remove
                    </button>
                  </div>

                  <div className="overflow-auto max-h-64 border border-white/10 rounded-lg">
                    <table className="min-w-full text-[11px] font-mono-custom">
                      <thead className="bg-white/5 text-white/40 sticky top-0">
                        <tr>
                          {datasetInfo.column_names.map(col => (
                            <th key={col} className="px-3 py-2 text-left min-w-45 whitespace-normal align-top font-bold uppercase tracking-wider">{col}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {datasetInfo.preview.map((row, i) => (
                          <tr key={i} className="border-t border-white/5">
                            {datasetInfo.column_names.map(col => (
                              <td key={col} className="px-3 py-2 text-white/60">
                                {row[col]}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
              <input
                id="fileInput"
                type="file"
                accept=".csv"
                className="hidden"
                onChange={handleInputChange}
              />
            </div>

            {error && (
              <p className="text-red-400 text-sm mt-2 text-center font-mono-custom uppercase text-[10px] tracking-widest">
                {error}
              </p>
            )}
          </div>

          {datasetInfo && (
            <div className="bg-white/5 border border-white/10 rounded-xl p-6 flex flex-col gap-5">
              <div>
                <p className="text-white/60 text-sm font-display font-bold mb-1">
                  Select Target (optional)
                </p>
                <p className="text-white/30 text-xs">
                  Choose a column to unlock feature importance insights
                </p>
              </div>

              <select
                value={selectedTarget}
                onChange={(e) => setSelectedTarget(e.target.value)}
                className="w-full bg-[#0f0f0f] border border-white/10 px-3 py-2.5 rounded-lg focus:outline-none focus:border-amber-400 text-sm font-mono-custom"
              >
                <option value="">No target (EDA mode)</option>
                {datasetInfo.column_names.map(col => (
                  <option key={col} value={col}>{col}</option>
                ))}
              </select>

              <button
                onClick={handleAnalyze}
                disabled={loading}
                className="w-full bg-amber-500 text-black py-4 rounded-xl font-display font-bold hover:bg-amber-400 transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] shadow-lg shadow-amber-500/10"
              >
                Analyze Data →
              </button>
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  )
}