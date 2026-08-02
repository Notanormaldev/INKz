import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Landing from './pages/Landing'
import Dashboard from './pages/Dashboard'
import Workspace from './pages/Workspace'
import FreePlan from './pages/FreePlan'
import ApplyCloud from './pages/ApplyCloud'
import Admin from './pages/Admin'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/projects" element={<Dashboard />} />
        <Route path="/workspace/:sandboxId" element={<Workspace />} />
        <Route path="/free" element={<FreePlan />} />
        <Route path="/apply" element={<ApplyCloud />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </BrowserRouter>
  )
}
