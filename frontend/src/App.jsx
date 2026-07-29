import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Landing from './pages/Landing'
import Dashboard from './pages/Dashboard'
import Workspace from './pages/Workspace'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/projects" element={<Dashboard />} />
        <Route path="/workspace/:sandboxId" element={<Workspace />} />
      </Routes>
    </BrowserRouter>
  )
}


