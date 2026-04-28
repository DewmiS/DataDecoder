import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSession } from '../context/SessionContext'
import { uploadCSV } from '../services/api'

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

    // if (file.size > 10 * 1024 * 1024) {
    //   setError('File must be under 10MB')
    //   return
    // }

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
    handleFile(e.dataTransfer.files[0]) // drag and drp the files and get the first file
  }

  function handleInputChange(e) {
    handleFile(e.target.files[0]) // upload files and get the first file
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white">
    
      <nav className="flex items-center justify-between px-8 py-5 border-b border-white/5">
        <div className="flex items-center gap-3">
          <span className="text-lg font-semibold">DataDecoder</span>
          <span className="text-[10px] bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full">
            AI
          </span>
        </div>
      </nav>

      <div className="text-center pt-5 px-4">
        <h1 className="text-4xl font-bold mb-3">
          What's inside your dataset?
        </h1>
        <p className="text-white/40 text-sm max-w-md mx-auto">
          Upload a CSV and explore patterns, clusters, and AI insights instantly.
        </p>
      </div>

      <div className="mt-5 px-4 flex justify-center">
        <div className="w-full max-w-3xl mx-auto flex flex-col gap-6">

          <div className="flex-1">

            <div
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              onClick={!datasetInfo ? () => document.getElementById('fileInput').click() : undefined}
              className={`border border-dashed border-white/15 rounded-2xl p-6 transition ${
                loading ? "opacity-50 pointer-events-none" : "hover:border-amber-500/40"
              }`}
            >

              {!datasetInfo ? (
                <div className="py-16 flex flex-col items-center gap-3 cursor-pointer">
                  <p className="text-amber-400 text-sm">
                    {loading ? 'Uploading...' : 'Drop your CSV here'}
                  </p>
                  <p className="text-white/40 text-sm">or click to browse</p>
                  <p className="text-white/20 text-xs">Max 10MB · CSV only</p>
                </div>
              ) : (
                <div className="flex flex-col gap-4">

                  <div className="flex justify-between items-center">
                    <p className="text-green-400 text-sm">
                      {datasetInfo.filename}
                    </p>

                    <button
                      onClick={() => {
                        clearSession()
                      }}
                      className="text-xs text-red-400 hover:text-red-300"
                    >
                      Remove
                    </button>
                  </div>

                  <div className="overflow-auto max-h-64 border border-white/10 rounded-lg">
                    <table className="min-w-full text-xs">
                      <thead className="bg-white/5 text-white/60 sticky top-0">
                        <tr>
                          {datasetInfo.column_names.map(col => (
                            <th key={col} className="px-3 py-2 text-left min-w-45 whitespace-normal align-top">{col}</th>
                          ))}
                        </tr>
                      </thead>

                      <tbody>
                        {datasetInfo.preview.map((row, i) => (
                          <tr key={i} className="border-t border-white/5">
                            {datasetInfo.column_names.map(col => (
                              <td key={col} className="px-3 py-2 text-white/80">
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
              <p className="text-red-400 text-sm mt-2 text-center">
                {error}
              </p>
            )}

          </div>

          {datasetInfo && (
            <div className=" border border-white/10 rounded-xl p-4 flex flex-col gap-4">

              <div>
                <p className="text-white/60 text-sm">
                  Select Target (optional)
                </p>
                <p className="text-white/30 text-xs">
                  Choose a column to unlock feature importance insights
                </p>
              </div>

              <select
                value={selectedTarget}
                onChange={(e) => setSelectedTarget(e.target.value)}
                className="w-full bg-[#1a1a1a] border border-white/10 px-3 py-2 rounded-lg focus:outline-none focus:border-amber-400"
              >
                <option value="">No target (EDA mode)</option>
                {datasetInfo.column_names.map(col => (
                  <option key={col} value={col}>{col}</option>
                ))}
              </select>

              <button
                onClick={handleAnalyze}
                disabled={loading}
                className="w-full bg-amber-500 text-black py-2 rounded-lg font-semibold hover:bg-amber-400 transition"
              >
                Analyze Data
              </button>

            </div>
          )}

        </div>
      </div>
    </div>
  )
}