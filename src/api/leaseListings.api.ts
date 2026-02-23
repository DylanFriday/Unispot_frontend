import http from './http'
import type {
  LeaseInterestResponse,
  LeaseListingDto,
} from '../types/dto'

const normalizeListing = (data: LeaseListingDto | LeaseListingDto[], id: number) => {
  if (Array.isArray(data)) {
    const match = data.find((item) => item.id === id)
    if (!match) {
      throw new Error('Updated listing not found in response')
    }
    return match
  }
  return data
}

export const leaseListingsApi = {
  list: async () => {
    const response = await http.get<LeaseListingDto[]>('/lease-listings')
    return response.data
  },
  mine: async () => {
    const response = await http.get<LeaseListingDto[]>('/lease-listings/mine')
    return response.data
  },
  create: async (payload: {
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
  update: async (id: number, payload: Partial<LeaseListingDto>) => {
    const response = await http.patch<LeaseListingDto | LeaseListingDto[]>(
      `/lease-listings/${id}`,
      payload
    )
    return normalizeListing(response.data, id)
  },
  remove: async (id: number) => {
    const response = await http.delete<LeaseListingDto>(`/lease-listings/${id}`)
    return response.data
  },
  interest: async (id: number) => {
    const response = await http.post<LeaseInterestResponse>(
      `/lease-listings/${id}/interest`
    )
    return response.data
  },
  transfer: async (id: number) => {
    const response = await http.post<LeaseListingDto>(
      `/lease-listings/${id}/transfer`
    )
    return response.data
  },
}
