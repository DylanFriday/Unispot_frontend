import http from './http'
import type { WalletSummaryDto } from '../types/dto'

export const walletApi = {
  getWalletSummary: async () => {
    const response = await http.get<WalletSummaryDto>('/me/wallet')
    return response.data
  },
}
