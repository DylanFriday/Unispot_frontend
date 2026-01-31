import http from './http'
import type { ReviewDto } from '../types/dto'

export const reviewsApi = {
  listByCourse: async (courseId: number) => {
    const response = await http.get<ReviewDto[]>(`/courses/${courseId}/reviews`)
    return response.data
  },
}
