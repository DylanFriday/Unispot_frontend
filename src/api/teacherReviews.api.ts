import http from './http'
import type { TeacherReviewDto } from '../types/dto'

export const teacherReviewsApi = {
  listByCourse: async (courseId: number, status?: 'VISIBLE' | 'UNDER_REVIEW' | 'REMOVED') => {
    const search = status ? `?status=${status}` : ''
    const response = await http.get<TeacherReviewDto[]>(
      `/courses/${courseId}/teacher-reviews${search}`
    )
    return response.data
  },
  create: async (payload: {
    courseId: number
    teacherName: string
    rating: number
    text: string
  }) => {
    const response = await http.post<TeacherReviewDto>('/teacher-reviews', payload)
    return response.data
  },
  update: async (id: number, payload: { rating?: number; text?: string }) => {
    const response = await http.patch<TeacherReviewDto>(
      `/teacher-reviews/${id}`,
      payload
    )
    return response.data
  },
  remove: async (id: number) => {
    const response = await http.delete<TeacherReviewDto>(`/teacher-reviews/${id}`)
    return response.data
  },
  report: async (id: number, payload?: { reason?: string }) => {
    const response = await http.post<TeacherReviewDto>(
      `/teacher-reviews/${id}/report`,
      payload ? payload : undefined
    )
    return response.data
  },
  upvote: async (id: number) => {
    const response = await http.post(`/teacher-reviews/${id}/upvote`)
    return response.data
  },
  removeUpvote: async (id: number) => {
    const response = await http.delete(`/teacher-reviews/${id}/upvote`)
    return response.data
  },
}
