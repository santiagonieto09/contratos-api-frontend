import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from '@/context/AuthContext'
import { PrivateLayout, PublicLayout, GuestLayout } from '@/components/Layout'

const Login = lazy(() => import('@/pages/Login'))
const Register = lazy(() => import('@/pages/Register'))
const Dashboard = lazy(() => import('@/pages/Dashboard'))
const ContractList = lazy(() => import('@/pages/ContractList'))
const ContractDetail = lazy(() => import('@/pages/ContractDetail'))
const CreateContract = lazy(() => import('@/pages/CreateContract'))
const ProjectionSimulator = lazy(() => import('@/pages/ProjectionSimulator'))

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-surface" />}>
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
        </Suspense>
      </AuthProvider>
    </BrowserRouter>
  )
}
