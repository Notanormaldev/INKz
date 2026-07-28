import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import Workspace from './pages/Workspace'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/workspace/:sandboxId" element={<Workspace />} />
      </Routes>
    </BrowserRouter>
  )
}


