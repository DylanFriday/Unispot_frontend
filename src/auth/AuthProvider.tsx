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

  const loadMe = useCallback(async () => {
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
      logout()
      return null
    }
  }, [logout])

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
      await loadMe()
      setLoading(false)
    }

    void init()
  }, [loadMe, me, token])

  const login = useCallback(async (email: string, password: string) => {
    const response = await authApi.login({ email, password })
    localStorage.setItem('access_token', response.access_token)
    setToken(response.access_token)
    const role = await loadMe()
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
      const role = await loadMe()
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
