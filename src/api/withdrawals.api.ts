import http from './http'
import type { WithdrawalDto, WithdrawalStatus } from '../types/dto'

export const withdrawalsApi = {
  listMyWithdrawals: async () => {
    const response = await http.get<WithdrawalDto[]>('/withdrawals/mine')
    return response.data
  },
  createWithdrawal: async (payload: { amountCents: number }) => {
    const response = await http.post<WithdrawalDto>('/withdrawals', payload)
    return response.data
  },
  listWithdrawals: async (status?: WithdrawalStatus) => {
    const response = await http.get<WithdrawalDto[]>('/withdrawals', {
      params: status ? { status } : undefined,
    })
    return response.data
  },
  approveWithdrawal: async (id: number) => {
    const response = await http.post<WithdrawalDto>(`/withdrawals/${id}/approve`)
    return response.data
  },
  rejectWithdrawal: async (id: number) => {
    const response = await http.post<WithdrawalDto>(`/withdrawals/${id}/reject`)
    return response.data
  },
}
