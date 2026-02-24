import http from './http'
import type { StudySheetDto, StudySheetStatus } from '../types/dto'

type StudySheetDtoRaw = Omit<StudySheetDto, 'price'> & {
  price?: number | null
  priceCents?: number | null
}

const normalizeStudySheet = (sheet: StudySheetDtoRaw): StudySheetDto => ({
  ...sheet,
  price: sheet.price ?? sheet.priceCents ?? null,
})

export const moderationApi = {
  listStudySheets: async (status: StudySheetStatus) => {
    const response = await http.get<StudySheetDtoRaw[]>(
      '/moderation/study-sheets',
      {
        params: { status },
      }
    )
    return response.data.map(normalizeStudySheet)
  },
  approveStudySheet: async (id: number) => {
    const response = await http.post<StudySheetDtoRaw>(
      `/moderation/study-sheets/${id}/approve`
    )
    return normalizeStudySheet(response.data)
  },
  rejectStudySheet: async (id: number, reason?: string) => {
    const response = await http.post<StudySheetDtoRaw>(
      `/moderation/study-sheets/${id}/reject`,
      reason ? { reason } : undefined
    )
    return normalizeStudySheet(response.data)
  },
}
