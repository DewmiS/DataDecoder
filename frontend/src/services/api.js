import axios from 'axios'

const api = axios.create({
  baseURL: "http://localhost:8000/api"
})

export async function uploadCSV(file) {
  const formData = new FormData()
  formData.append('file',file)

  const response = await api.post("/upload", formData, {
    headers: {
    "Content-Type": "multipart/form-data"
    }
  })
  return response.data
}

export async function profile(sessionId){
  const response = await api.post("/profile", { session_id: sessionId })
  return response.data
}

export async function correlation(sessionId, target){
  const response = await api.post("/correlation", {session_id: sessionId, target: target})
  return response.data
}

export async function clustering(sessionId){
  const response = await api.post("/clustering", { session_id: sessionId })
  return response.data
}

export async function explain(sessionId, target) {
  const response = await api.post("/explain", { session_id: sessionId, target: target })
  return response.data
}

export async function report(sessionId) {
  const response = await api.post("/report", { session_id: sessionId }, {responseType:'blob'})
  return response.data
}
