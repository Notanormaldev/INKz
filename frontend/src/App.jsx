import { BrowserRouter, Routes, Route } from 'react-router-dom'
import ScrollToTop from './components/ScrollToTop'
import Landing from './pages/Landing'
import Dashboard from './pages/Dashboard'
import Workspace from './pages/Workspace'
import FreePlan from './pages/FreePlan'
import ApplyCloud from './pages/ApplyCloud'
import Admin from './pages/Admin'
import SelfHostedDocs from './pages/SelfHostedDocs'

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/docs" element={<SelfHostedDocs />} />
        <Route path="/projects" element={<Dashboard />} />
        <Route path="/workspace/:sandboxId" element={<Workspace />} />
        <Route path="/free" element={<FreePlan />} />
        <Route path="/apply" element={<ApplyCloud />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </BrowserRouter>
  )
}

