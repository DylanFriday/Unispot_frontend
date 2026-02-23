import http from './http'
import type { LeaseListingDto } from '../types/dto'

export const leasesApi = {
  listApprovedLeases: async () => {
    const response = await http.get<LeaseListingDto[]>('/lease-listings')
    return response.data
  },
  listMyLeases: async () => {
    const response = await http.get<LeaseListingDto[]>('/lease-listings/mine')
    return response.data
  },
  createLease: async (payload: {
    title: string
    description: string
    location: string
    lineId?: string | null
    rentCents: number
    depositCents: number
    startDate: string
    endDate: string
  }) => {
    const response = await http.post<LeaseListingDto>('/lease-listings', payload)
    return response.data
  },
  updateLease: async (
    id: number,
    payload: Partial<{
      title: string
      description: string
      location: string
      lineId: string | null
      rentCents: number
      depositCents: number
      startDate: string
      endDate: string
    }>
  ) => {
    const response = await http.patch<LeaseListingDto | LeaseListingDto[]>(
      `/lease-listings/${id}`,
      payload
    )
    if (Array.isArray(response.data)) {
      const match = response.data.find((item) => item.id === id)
      if (match) return match
    }
    return response.data as LeaseListingDto
  },
  deleteLease: async (id: number) => {
    const response = await http.delete<LeaseListingDto>(`/lease-listings/${id}`)
    return response.data
  },
  expressInterest: async (id: number) => {
    const response = await http.post(`/lease-listings/${id}/interest`)
    return response.data  
  },
  transferLease: async (id: number) => {
    const response = await http.post(`/lease-listings/${id}/transfer`)
    return response.data
  },
}
