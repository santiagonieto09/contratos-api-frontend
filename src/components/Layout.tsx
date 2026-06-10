import { Outlet, Navigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { Header } from './Header'
import { Footer } from './Footer'
import { Sidebar } from './Sidebar'
import { Logo } from './Logo'
import { Skeleton } from '@/components/ui/skeleton'

function LoadingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center gap-3 bg-surface">
      <div className="flex flex-col items-center gap-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary text-on-primary">
          <Logo className="h-6 w-6" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-3 w-32" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>
    </div>
  )
}

export function PrivateLayout() {
  const { user, loading } = useAuth()

  if (loading) return <LoadingScreen />
  if (!user) return <Navigate to="/login" replace />

  return (
    <div className="flex min-h-screen flex-col bg-surface">
      <Header />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-5 sm:p-7 lg:p-9">
          <Outlet />
        </main>
      </div>
      <Footer />
    </div>
  )
}

export function GuestLayout() {
  const { user, loading } = useAuth()

  if (loading) return <LoadingScreen />
  if (user) return <Navigate to="/dashboard" replace />

  return (
    <div className="flex min-h-screen flex-col bg-surface">
      <Header />
      <main className="flex flex-1 items-center justify-center p-4">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}

export function PublicLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-surface">
      <Header />
      <main className="flex-1 p-5 sm:p-7 lg:p-9">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
