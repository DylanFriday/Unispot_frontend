import http from './http'
import type { TeacherReviewDto } from '../types/dto'

export const teacherReviewModerationApi = {
  list: async (status?: string) => {
    const response = await http.get<TeacherReviewDto[]>('/moderation/teacher-reviews', {
      params: status ? { status } : undefined,
    })
    return response.data
  },
  approve: async (id: number) => {
    const response = await http.post<TeacherReviewDto>(
      `/moderation/teacher-reviews/${id}/approve`
    )
    return response.data
  },
  remove: async (id: number) => {
    const token = localStorage.getItem('access_token')
    const response = await http.post<TeacherReviewDto>(
      `/moderation/teacher-reviews/${id}/remove`,
      {},
      {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      }
    )
    return response.data
  },
}
