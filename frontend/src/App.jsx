import { BrowserRouter, Routes, Route } from 'react-router-dom'
import UploadPage from './pages/UploadPage'
import { SessionProvider } from './context/SessionContext'
import ProcessingPage from './pages/ProcessingPage'
import ProfilePage from './pages/ProfilePage'
import PatternsPage from './pages/PatternsPage'
import ClustersPage from './pages/ClustersPage'
import StoryPage from './pages/StoryPage'

function App() {
  
  return (
    <>
      <SessionProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<UploadPage />} />
            <Route path="/processing" element={<ProcessingPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/patterns" element={<PatternsPage />} />
            <Route path="/clusters" element={<ClustersPage />} />
            <Route path="/story" element={<StoryPage />} />
          </Routes>
        </BrowserRouter>
      </SessionProvider>
    </>
  )
}

export default App
