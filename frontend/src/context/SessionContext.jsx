import { createContext, useContext, useState } from "react";

const SessionContext = createContext(null)

export function SessionProvider({ children }) {
  const [sessionId, setSessionId] = useState(null)
  const [datasetInfo, setDatasetInfo] = useState(null)

  return (
    <SessionContext.Provider value={{ sessionId, setSessionId, datasetInfo, setDatasetInfo }}>
      {children}
    </SessionContext.Provider>
  )
}

export function useSession() {
  return useContext(SessionContext)
}