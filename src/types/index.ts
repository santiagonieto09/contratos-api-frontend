export interface Usuario {
  id: string
  email: string
  roles: string[]
  creadoEn: string
}

export interface MetodoPago {
  id: string
  nombre: string
  tasaInteres: string
  tasaTarifa: string
  descripcion: string
}

export interface Cuota {
  numeroCuota: number
  valorBase: number
  interes: number
  tarifaPago: number
  total: number
  fechaPago: string
}

export interface Contrato {
  id: string
  numeroContrato: string
  fechaContrato: string
  valorTotal: number
  metodoPago: string
  numeroMeses: number
  creadoEn: string
  cuotas?: Cuota[]
}

export interface ResumenCuotas {
  totalCuotas: number
  totalInteres: number
  totalTarifa: number
  totalAPagar: number
}

export interface Proyeccion {
  valorTotal: number
  numeroMeses: number
  metodoPago: string
  fechaContrato: string
  tasaInteres: string
  tasaTarifa: string
}

export interface AuthResponse {
  mensaje: string
  token: string
  usuario: {
    id: string
    email: string
    creadoEn: string
  }
}

export interface LoginResponse {
  token: string
}

export interface ApiError {
  error: string
  detalles?: Record<string, string>
  mensaje?: string
}
