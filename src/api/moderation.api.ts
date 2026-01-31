import http from './http'
import type { StudySheetDto } from '../types/dto'

export const moderationApi = {
  listPendingStudySheets: async () => {
    const response = await http.get<StudySheetDto[]>(
      '/moderation/study-sheets',
      {
        params: { status: 'PENDING' },
      }
    )
    return response.data
  },
  approveStudySheet: async (id: number) => {
    const response = await http.post<StudySheetDto>(
      `/moderation/study-sheets/${id}/approve`
    )
    return response.data
  },
  rejectStudySheet: async (id: number, reason?: string) => {
    const response = await http.post<StudySheetDto>(
      `/moderation/study-sheets/${id}/reject`,
      reason ? { reason } : undefined
    )
    return response.data
  },
}
