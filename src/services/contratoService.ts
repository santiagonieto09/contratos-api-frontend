import api from './api'
import type { Contrato, MetodoPago, Cuota, ResumenCuotas, Proyeccion } from '@/types'

export const contratoService = {
  async listar() {
    const { data } = await api.get<{ contratos: Contrato[]; total: number }>('/contratos')
    return data
  },

  async obtener(id: string) {
    const { data } = await api.get<{ contrato: Contrato }>(`/contratos/${id}`)
    return data.contrato
  },

  async crear(datos: {
    numeroContrato: string
    fechaContrato: string
    valorTotal: number
    metodoPago: string
    numeroMeses: number
  }) {
    const { data } = await api.post<{ mensaje: string; contrato: Contrato }>('/contratos', datos)
    return data
  },

  async obtenerCuotas(id: string) {
    const { data } = await api.get<{
      contrato: Partial<Contrato>
      cuotas: Cuota[]
      resumen: ResumenCuotas
    }>(`/contratos/${id}/cuotas`)
    return data
  },

  async proyectar(datos: {
    valorTotal: number
    numeroMeses: number
    metodoPago: string
    fechaContrato?: string
  }) {
    const { data } = await api.post<{
      proyeccion: Proyeccion
      cuotas: Cuota[]
      resumen: ResumenCuotas & { diferenciaSobreValorOriginal: number }
    }>('/contratos/proyeccion', datos)
    return data
  },

  async metodosPago() {
    const { data } = await api.get<{ metodosPago: MetodoPago[] }>('/contratos/metodos-pago')
    return data.metodosPago
  },
}
