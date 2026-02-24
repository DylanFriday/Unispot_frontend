import http from './http'
import type {
  StudySheetCreateRequest,
  StudySheetDto,
  StudySheetPurchaseResponse,
  StudySheetPurchaseResponseRaw,
  StudySheetUpdateRequest,
} from '../types/dto'

type StudySheetDtoRaw = Omit<StudySheetDto, 'price'> & {
  price?: number | null
  priceCents?: number | null
}

const normalizeStudySheet = (sheet: StudySheetDtoRaw): StudySheetDto => ({
  ...sheet,
  price: sheet.price ?? sheet.priceCents ?? null,
})

export const studySheetsApi = {
  list: async (courseCode?: string) => {
    const response = await http.get<StudySheetDtoRaw[]>('/study-sheets', {
      params: courseCode ? { courseCode } : undefined,
    })
    return response.data.map(normalizeStudySheet)
  },
  mine: async () => {
    const response = await http.get<StudySheetDtoRaw[]>('/study-sheets/mine')
    return response.data.map(normalizeStudySheet)
  },
  create: async (payload: StudySheetCreateRequest) => {
    const response = await http.post<StudySheetDtoRaw>('/study-sheets', payload)
    return normalizeStudySheet(response.data)
  },
  update: async (id: number, payload: StudySheetUpdateRequest) => {
    const response = await http.patch<StudySheetDtoRaw>(
      `/study-sheets/${id}`,
      payload
    )
    return normalizeStudySheet(response.data)
  },
  remove: async (id: number) => {
    const response = await http.delete<StudySheetDtoRaw>(`/study-sheets/${id}`)
    return normalizeStudySheet(response.data)
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
