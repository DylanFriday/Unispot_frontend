import { useMemo, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'

interface NavbarProps {
  onOpenSidebar?: () => void
}

const resolveTitle = (pathname: string) => {
  if (pathname.startsWith('/dashboard')) return 'Dashboard'
  if (pathname.startsWith('/study-sheets')) return 'Study Sheets'
  if (pathname.startsWith('/courses')) return 'Course Reviews'
  if (pathname.startsWith('/moderation')) return 'Moderation'
  if (pathname.startsWith('/wallet')) return 'Wallet'
  if (pathname.startsWith('/profile')) return 'My Profile'
  if (pathname.startsWith('/leases')) return 'Leases'
  if (pathname.startsWith('/reviews')) return 'Course Reviews'
  if (pathname.startsWith('/admin')) return 'Admin'
  if (pathname.startsWith('/login')) return 'Login'
  if (pathname.startsWith('/register')) return 'Register'
  return 'UniSpot'
}

const Navbar = ({ onOpenSidebar }: NavbarProps) => {
  const { token, me, logout } = useAuth()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const pageTitle = useMemo(() => resolveTitle(location.pathname), [location.pathname])
  const isAuthenticated = Boolean(token && me)
  const avatarUrl = me?.avatarUrl?.trim()

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-[1200px] items-center gap-3 px-4 md:px-6 lg:px-8">
        {isAuthenticated ? (
          <button
            type="button"
            onClick={onOpenSidebar}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-700 md:hidden"
            aria-label="Open sidebar"
          >
            ☰
          </button>
        ) : null}

        <div className="min-w-0 flex-1">
          <p className="truncate text-lg font-semibold text-slate-900">{pageTitle}</p>
        </div>

        {isAuthenticated ? (
          <>
            <button
              type="button"
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
              aria-label="Notifications"
            >
              🔔
            </button>

            <div className="relative">
              <button
                type="button"
                className="inline-flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-blue-600 text-sm font-semibold text-white"
                onClick={() => setMenuOpen((prev) => !prev)}
              >
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt="Profile avatar"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  me?.email?.charAt(0).toUpperCase() ?? 'U'
                )}
              </button>
              {menuOpen ? (
                <div className="absolute right-0 mt-2 w-44 rounded-xl border border-slate-200 bg-white p-2 shadow-lg">
                  <Link
                    to="/profile"
                    className="block rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                    onClick={() => setMenuOpen(false)}
                  >
                    My Profile
                  </Link>
                  <button
                    type="button"
                    className="block w-full rounded-lg px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                    onClick={logout}
                  >
                    Logout
                  </button>
                </div>
              ) : null}
            </div>
          </>
        ) : (
          <div className="flex items-center gap-2">
            <Link
              to="/login"
              className="rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-100"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white"
            >
              Register
            </Link>
          </div>
        )}
      </div>
    </header>
  )
}

export default Navbar
