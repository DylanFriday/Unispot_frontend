import http from './http'
import type { ReviewDto } from '../types/dto'

export const reviewsApi = {
  listByCourse: async (courseId: number) => {
    const response = await http.get<ReviewDto[]>(`/courses/${courseId}/reviews`)
    return response.data
  },
  create: async (payload: { courseId: number; rating: number; text: string }) => {
    const response = await http.post<ReviewDto>('/reviews', payload)
    return response.data
  },
  update: async (id: number, payload: { rating?: number; text?: string }) => {
    const response = await http.patch<ReviewDto>(`/reviews/${id}`, payload)
    return response.data
  },
  remove: async (id: number) => {
    const response = await http.delete<ReviewDto>(`/reviews/${id}`)
    return response.data
  },
  report: async (id: number, payload?: { reason?: string }) => {
    const response = await http.post<ReviewDto>(
      `/reviews/${id}/report`,
      payload ? payload : undefined
    )
    return response.data
  },
  upvote: async (id: number) => {
    const response = await http.post(`/reviews/${id}/upvote`)
    return response.data
  },
  removeUpvote: async (id: number) => {
    const response = await http.delete(`/reviews/${id}/upvote`)
    return response.data
  },
}
