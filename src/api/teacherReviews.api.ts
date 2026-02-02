import http from './http'
import type { TeacherReviewDto } from '../types/dto'

export const teacherReviewsApi = {
  listCourseTeacherReviews: async (
    courseId: number,
    mode: 'public' | 'me'
  ) => {
    const response = await http.get<TeacherReviewDto[]>(
      `/courses/${courseId}/teacher-reviews?mode=${mode}`
    )
    return response.data
  },
  createTeacherReview: async (payload: {
    courseId: number
    teacherName: string
    rating: number
    text: string
  }) => {
    const response = await http.post<TeacherReviewDto>('/teacher-reviews', payload)
    return response.data
  },
  updateTeacherReview: async (
    id: number,
    payload: { rating?: number; text?: string }
  ) => {
    const response = await http.patch<TeacherReviewDto>(
      `/teacher-reviews/${id}`,
      payload
    )
    return response.data
  },
  deleteReview: async (id: number) => {
    const response = await http.delete<TeacherReviewDto>(`/teacher-reviews/${id}`)
    return response.data
  },
  listModeration: async (status: 'UNDER_REVIEW' | 'VISIBLE' | 'REMOVED') => {
    const response = await http.get<TeacherReviewDto[]>(
      `/moderation/teacher-reviews?status=${status}`
    )
    return response.data
  },
  approve: async (id: number) => {
    const response = await http.post<TeacherReviewDto>(
      `/moderation/teacher-reviews/${id}/approve`
    )
    return response.data
  },
  remove: async (id: number, reason?: string) => {
    const response = await http.post<TeacherReviewDto>(
      `/moderation/teacher-reviews/${id}/remove`,
      reason ? { reason } : undefined
    )
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
