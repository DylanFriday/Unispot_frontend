import http from './http'
import type { TeacherSuggestionDto } from '../types/dto'

export const teacherSuggestionsApi = {
  suggest: async (courseId: number, teacherName: string) => {
    const response = await http.post<TeacherSuggestionDto>(
      `/courses/${courseId}/teacher-suggestions`,
      { teacherName }
    )
    return response.data
  },
  listMine: async (courseId: number) => {
    const response = await http.get<TeacherSuggestionDto[]>(
      `/courses/${courseId}/teacher-suggestions/mine`
    )
    return response.data
  },
  moderationList: async (status: 'PENDING' | 'APPROVED' | 'REJECTED') => {
    const response = await http.get<TeacherSuggestionDto[]>(
      `/moderation/teacher-suggestions?status=${status}`
    )
    return response.data
  },
  approve: async (id: number) => {
    const response = await http.post<TeacherSuggestionDto>(
      `/moderation/teacher-suggestions/${id}/approve`
    )
    return response.data
  },
  reject: async (id: number, reason?: string) => {
    const response = await http.post<TeacherSuggestionDto>(
      `/moderation/teacher-suggestions/${id}/reject`,
      reason ? { reason } : undefined
    )
    return response.data
  },
}
