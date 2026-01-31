import http from './http'
import type {
  AuthTokenResponse,
  LoginRequest,
  MeResponse,
  RegisterRequest,
} from '../types/dto'

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
    const response = await http.get<MeResponse>('/auth/me')
    return response.data
  },
}
