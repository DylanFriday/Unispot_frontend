import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'
import type { MeResponse, Role } from '../types/dto'
import { authApi } from '../api/auth.api'

const DISPLAY_NAME_KEY = 'display_name'
const ROLE_SET = new Set<Role>(['STUDENT', 'STAFF', 'ADMIN'])

interface JwtPayload {
  sub?: string | number
  id?: string | number
  userId?: string | number
  role?: string
  email?: string
  name?: string
  fullName?: string
  username?: string
}

interface AuthContextValue {
  token: string | null
  me: MeResponse | null
  loading: boolean
  login: (email: string, password: string) => Promise<Role>
  register: (email: string, name: string, password: string) => Promise<Role>
  refreshMe: () => Promise<void>
  logout: () => void
}

export const AuthContext = createContext<AuthContextValue | undefined>(
  undefined
)

const getRedirectPath = (role: Role) => {
  if (role === 'ADMIN') return '/dashboard'
  if (role === 'STAFF') return '/dashboard'
  return '/dashboard'
}

const decodeJwtPayload = (token: string): JwtPayload | null => {
  const [, encodedPayload] = token.split('.')
  if (!encodedPayload) return null
  try {
    const base64 = encodedPayload.replace(/-/g, '+').replace(/_/g, '/')
    const normalized = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=')
    const raw = atob(normalized)
    return JSON.parse(raw) as JwtPayload
  } catch {
    return null
  }
}

const getRoleFromPayload = (payload: JwtPayload | null): Role | null => {
  const raw = payload?.role?.toUpperCase()
  if (!raw) return null
  return ROLE_SET.has(raw as Role) ? (raw as Role) : null
}

const getIdFromPayload = (payload: JwtPayload | null) => {
  const raw = payload?.id ?? payload?.userId ?? payload?.sub
  const parsed = Number(raw)
  return Number.isFinite(parsed) ? parsed : 0
}

const resolveMeFromToken = (token: string): MeResponse | null => {
  const payload = decodeJwtPayload(token)
  const role = getRoleFromPayload(payload)
  if (!role) return null
  return {
    id: getIdFromPayload(payload),
    role,
    name: payload?.name,
    fullName: payload?.fullName,
    username: payload?.username,
    email: payload?.email,
  }
}

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [token, setToken] = useState<string | null>(
    localStorage.getItem('access_token')
  )
  const [me, setMe] = useState<MeResponse | null>(null)
  const [loading, setLoading] = useState(true)

  const logout = useCallback(() => {
    localStorage.removeItem('access_token')
    localStorage.removeItem(DISPLAY_NAME_KEY)
    setToken(null)
    setMe(null)
  }, [])

  const loadMe = useCallback(async (tokenOverride?: string | null) => {
    const activeToken = tokenOverride ?? token
    try {
      const response = await authApi.me()
      setMe(response)
      const resolvedName =
        response.name?.trim() ||
        response.fullName?.trim() ||
        response.username?.trim() ||
        (response.email ? response.email.split('@')[0] : '')
      if (resolvedName) {
        localStorage.setItem(DISPLAY_NAME_KEY, resolvedName)
      }
      return response.role
    } catch {
      if (activeToken) {
        const fallbackMe = resolveMeFromToken(activeToken)
        if (fallbackMe) {
          setMe(fallbackMe)
          const resolvedName =
            fallbackMe.name?.trim() ||
            fallbackMe.fullName?.trim() ||
            fallbackMe.username?.trim() ||
            (fallbackMe.email ? fallbackMe.email.split('@')[0] : '')
          if (resolvedName) {
            localStorage.setItem(DISPLAY_NAME_KEY, resolvedName)
          }
          return fallbackMe.role
        }
      }
      logout()
      return null
    }
  }, [logout, token])

  useEffect(() => {
    const init = async () => {
      if (!token) {
        setLoading(false)
        return
      }
      if (me) {
        setLoading(false)
        return
      }
      setLoading(true)
      await loadMe(token)
      setLoading(false)
    }

    void init()
  }, [loadMe, me, token])

  const login = useCallback(async (email: string, password: string) => {
    const response = await authApi.login({ email, password })
    localStorage.setItem('access_token', response.access_token)
    setToken(response.access_token)
    const role = await loadMe(response.access_token)
    if (!role) {
      throw new Error('Unable to load profile')
    }
    return role
  }, [loadMe])

  const register = useCallback(
    async (email: string, name: string, password: string) => {
      const response = await authApi.register({ email, name, password })
      localStorage.setItem('access_token', response.access_token)
      localStorage.setItem(DISPLAY_NAME_KEY, name.trim())
      setToken(response.access_token)
      const role = await loadMe(response.access_token)
      if (!role) {
        throw new Error('Unable to load profile')
      }
      return role
    },
    [loadMe]
  )

  const refreshMe = useCallback(async () => {
    await loadMe()
  }, [loadMe])

  const value = useMemo(
    () => ({ token, me, loading, login, register, refreshMe, logout }),
    [token, me, loading, login, register, refreshMe, logout]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const redirectForRole = getRedirectPath
