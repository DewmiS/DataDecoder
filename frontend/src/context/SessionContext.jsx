import { createContext, useContext, useEffect, useState } from "react";

const SessionContext = createContext(null)

export function SessionProvider({ children }) {

  const [sessionId, setSessionId] = useState(()=>{
    return localStorage.getItem("sessionId")
  })
 
  const [datasetInfo, setDatasetInfo] = useState(()=>{
    const stored = localStorage.getItem("datasetInfo")
    return stored ? JSON.parse(stored) : null
  })

  const [results, setResults] = useState(() => {
    const stored = localStorage.getItem("results")
    return stored ? JSON.parse(stored) : null
  })
  const [analysisSteps, setAnalysisSteps] = useState([])

  useEffect(()=>{
    if(sessionId){
      localStorage.setItem("sessionId", sessionId)
    }else{
      localStorage.removeItem("sessionId")
    }
  }, [sessionId])

  useEffect(()=>{
    if(datasetInfo){
      localStorage.setItem("datasetInfo", JSON.stringify(datasetInfo))
    }else{
      localStorage.removeItem("datasetInfo")
    }
  }, [datasetInfo])

  useEffect(() => {
    if (results) {
      localStorage.setItem("results", JSON.stringify(results))
    } else {
      localStorage.removeItem("results")
    }
  }, [results])

  const clearSession = () => {
    setSessionId(null)
    setDatasetInfo(null)
    setResults(null)
    setAnalysisSteps([])
    localStorage.removeItem("sessionId")
    localStorage.removeItem("datasetInfo")
  }

  return (
    <SessionContext.Provider value={{ sessionId, setSessionId, datasetInfo, setDatasetInfo, results, setResults, analysisSteps, setAnalysisSteps, clearSession }}>
      {children}
    </SessionContext.Provider>
  )
}

export function useSession() {
  return useContext(SessionContext)
}