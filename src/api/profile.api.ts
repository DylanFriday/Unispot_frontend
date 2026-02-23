import http from './http'
import { normalizeMeResponse } from './auth.api'
import type {
  ChangePasswordRequest,
  ProfileUpdateRequest,
} from '../types/dto'

const tryGet = async <T>(primary: string, fallback: string) => {
  try {
    const response = await http.get<T>(primary)
    return response.data
  } catch {
    const response = await http.get<T>(fallback)
    return response.data
  }
}

const tryPatch = async <T, P>(primary: string, fallback: string, payload: P) => {
  try {
    const response = await http.patch<T>(primary, payload)
    return response.data
  } catch {
    const response = await http.patch<T>(fallback, payload)
    return response.data
  }
}

export const profileApi = {
  getProfile: async () => {
    const response = await tryGet<unknown>('/me', '/auth/me')
    return normalizeMeResponse(response)
  },
  updateProfile: async (payload: ProfileUpdateRequest) => {
    const response = await tryPatch<unknown, ProfileUpdateRequest>(
      '/me',
      '/auth/me',
      payload
    )
    return normalizeMeResponse(response)
  },
  changePassword: async (payload: ChangePasswordRequest) =>
    tryPatch<void, ChangePasswordRequest>(
      '/me/password',
      '/auth/me/password',
      payload
    ),
}
