import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(n: number): string {
  return n.toLocaleString('es-CO', { minimumFractionDigits: 2 })
}

export const MAX_MESES_PLAZO = 120

export const PASSWORD_REQUIREMENTS = [
  'Mínimo 6 caracteres',
  'No debe ser una contraseña comprometida',
]