import { BrowserRouter, Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import UploadPage from './pages/UploadPage'
import { SessionProvider } from './context/SessionContext'
import ProcessingPage from './pages/ProcessingPage'
import AnalysisPage from './pages/AnalysisPage'
import StoryPage from './pages/StoryPage'

function App() {
  
  return (
    <>
      <SessionProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/upload" element={<UploadPage />} />
            <Route path="/processing" element={<ProcessingPage />} />
            <Route path="/analysis" element={<AnalysisPage />} />
            <Route path="/story" element={<StoryPage />} />
          </Routes>
        </BrowserRouter>
      </SessionProvider>
    </>
  )
}

export default App
