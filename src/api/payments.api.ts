import http from './http'
import type { AdminPaymentDto, PaymentStatus } from '../types/dto'

export const paymentsApi = {
  listPayments: async (status: PaymentStatus) => {
    const response = await http.get<AdminPaymentDto[]>('/admin/payments', {
      params: { status },
    })
    return response.data
  },
  confirmPayment: async (id: number) => {
    const response = await http.post<AdminPaymentDto | void>(
      `/admin/payments/${id}/confirm`
    )
    return response.data
  },
  releasePayment: async (id: number) => {
    const response = await http.post<AdminPaymentDto | void>(
      `/admin/payments/${id}/release`
    )
    return response.data
  },
}
