import http from './http'
import type {
  StudySheetCreateRequest,
  StudySheetDto,
  StudySheetPurchaseResponse,
  StudySheetPurchaseResponseRaw,
  StudySheetUpdateRequest,
} from '../types/dto'

export const studySheetsApi = {
  list: async (courseCode?: string) => {
    const response = await http.get<StudySheetDto[]>('/study-sheets', {
      params: courseCode ? { courseCode } : undefined,
    })
    return response.data
  },
  mine: async () => {
    const response = await http.get<StudySheetDto[]>('/study-sheets/mine')
    return response.data
  },
  create: async (payload: StudySheetCreateRequest) => {
    const response = await http.post<StudySheetDto>('/study-sheets', payload)
    return response.data
  },
  update: async (id: number, payload: StudySheetUpdateRequest) => {
    const response = await http.patch<StudySheetDto>(`/study-sheets/${id}`, payload)
    return response.data
  },
  remove: async (id: number) => {
    const response = await http.delete<StudySheetDto>(`/study-sheets/${id}`)
    return response.data
  },
  purchase: async (id: number) => {
    const response = await http.post<StudySheetPurchaseResponseRaw>(
      `/study-sheets/${id}/purchase`
    )
    const payload = response.data
    return {
      paymentId: payload.id,
      referenceCode: payload.reference_code,
      amountCents: payload.amount,
    } satisfies StudySheetPurchaseResponse
  },
}
