import { FileText, PlusCircle, BarChart3, LayoutDashboard } from 'lucide-react'

export const navLinks = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/contratos/nuevo', label: 'Nuevo Contrato', icon: PlusCircle },
  { to: '/proyeccion', label: 'Proyección', icon: BarChart3 },
  { to: '/contratos', label: 'Mis Contratos', icon: FileText },
]
