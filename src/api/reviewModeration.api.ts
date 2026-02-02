import http from './http'
import type { ReviewDto } from '../types/dto'

export const reviewModerationApi = {
  list: async (status: string) => {
    const response = await http.get<ReviewDto[]>('/moderation/reviews', {
      params: { status },
    })
    return response.data
  },
  approve: async (id: number) => {
    const response = await http.post<ReviewDto>(
      `/moderation/reviews/${id}/approve`
    )
    return response.data
  },
  remove: async (id: number) => {
    const response = await http.post<ReviewDto>(
      `/moderation/reviews/${id}/remove`
    )
    return response.data
  },
}
