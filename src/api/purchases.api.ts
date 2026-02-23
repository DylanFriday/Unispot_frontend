import http from './http'
import type { PurchasedStudySheetDto } from '../types/dto'

export const purchasesApi = {
  listPurchasedStudySheets: async () => {
    const response = await http.get<PurchasedStudySheetDto[]>(
      '/study-sheets/purchased'
    )
    return response.data
  },
}
