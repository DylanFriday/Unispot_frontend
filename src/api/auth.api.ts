import http from './http'
import type {
  AuthTokenResponse,
  LoginRequest,
  MeResponse,
  RegisterRequest,
} from '../types/dto'

export const normalizeMeResponse = (payload: unknown): MeResponse => {
  const data = payload as Record<string, unknown>
  return {
    id: Number(data.id ?? 0),
    role: String(data.role ?? '') as MeResponse['role'],
    name: (data.name as string | undefined) ?? undefined,
    username: (data.username as string | undefined) ?? undefined,
    fullName:
      (data.fullName as string | undefined) ??
      (data.full_name as string | undefined) ??
      undefined,
    email: (data.email as string | undefined) ?? undefined,
    phone: (data.phone as string | undefined) ?? undefined,
    bio: (data.bio as string | undefined) ?? undefined,
    avatarUrl:
      (data.avatarUrl as string | undefined) ??
      (data.avatar_url as string | undefined) ??
      undefined,
  }
}

export const authApi = {
  register: async (data: RegisterRequest) => {
    const response = await http.post<AuthTokenResponse>('/auth/register', data)
    return response.data
  },
  login: async (data: LoginRequest) => {
    const response = await http.post<AuthTokenResponse>('/auth/login', data)
    return response.data
  },
  me: async () => {
    const response = await http.get<unknown>('/auth/me')
    return normalizeMeResponse(response.data)
  },
}
