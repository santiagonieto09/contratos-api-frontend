import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from '@/context/AuthContext'
import { PrivateLayout, PublicLayout, GuestLayout } from '@/components/Layout'
import Login from '@/pages/Login'
import Register from '@/pages/Register'
import Dashboard from '@/pages/Dashboard'
import ContractList from '@/pages/ContractList'
import ContractDetail from '@/pages/ContractDetail'
import CreateContract from '@/pages/CreateContract'
import ProjectionSimulator from '@/pages/ProjectionSimulator'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route element={<GuestLayout />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Route>

          <Route element={<PrivateLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/contratos" element={<ContractList />} />
            <Route path="/contratos/nuevo" element={<CreateContract />} />
            <Route path="/contratos/:id" element={<ContractDetail />} />
            <Route path="/proyeccion" element={<ProjectionSimulator />} />
          </Route>

          <Route path="/proyeccion" element={<ProjectionSimulator />} />

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
