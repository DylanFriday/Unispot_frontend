import http from './http'
import type { LeaseListingDto, LeaseListingStatus } from '../types/dto'

export const leaseModerationApi = {
  listLeaseListings: async (status: LeaseListingStatus) => {
    const response = await http.get<LeaseListingDto[]>(
      '/moderation/lease-listings',
      {
        params: { status },
      }
    )
    return response.data
  },
  approveLeaseListing: async (id: number) => {
    const response = await http.post<LeaseListingDto>(
      `/moderation/lease-listings/${id}/approve`
    )
    return response.data
  },
  rejectLeaseListing: async (id: number, reason: string) => {
    const response = await http.post<LeaseListingDto>(
      `/moderation/lease-listings/${id}/reject`,
      { reason }
    )
    return response.data
  },
}
