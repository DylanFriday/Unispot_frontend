import { Link, useLocation } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import { useAuth } from '../auth/useAuth'
import Button from './Button'
import Badge from './Badge'

const Navbar = () => {
  const { me, token, logout } = useAuth()
  const location = useLocation()
  const isModerationRoute = location.pathname.startsWith('/moderation')
  const isAdminRoute = location.pathname.startsWith('/admin')
  const [moderationOpen, setModerationOpen] = useState(isModerationRoute)
  const [adminOpen, setAdminOpen] = useState(isAdminRoute)
  const moderationRef = useRef<HTMLDivElement | null>(null)
  const adminRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (isModerationRoute) setModerationOpen(true)
  }, [isModerationRoute])

  useEffect(() => {
    if (isAdminRoute) setAdminOpen(true)
  }, [isAdminRoute])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node
      if (moderationRef.current && !moderationRef.current.contains(target)) {
        setModerationOpen(false)
      }
      if (adminRef.current && !adminRef.current.contains(target)) {
        setAdminOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const linkClass = (to: string) =>
    `hover:text-gray-900 ${
      location.pathname === to || location.pathname.startsWith(`${to}/`)
        ? 'text-ink'
        : 'text-gray-600'
    }`

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link to="/" className="text-lg font-semibold text-gray-900">
          UniSpot
        </Link>
        <nav className="hidden items-center gap-4 text-sm md:flex">
          <Link to="/study-sheets" className={linkClass('/study-sheets')}>
            Study Sheets
          </Link>
          <Link to="/courses" className={linkClass('/courses')}>
            Courses
          </Link>
          <Link to="/leases" className={linkClass('/leases')}>
            Leases
          </Link>
          {me?.role === 'ADMIN' ? (
            <div className="relative" ref={adminRef}>
              <button
                type="button"
                onClick={() => setAdminOpen((prev) => !prev)}
                className={`flex items-center gap-1 ${isAdminRoute ? 'text-ink' : 'text-gray-600 hover:text-gray-900'}`}
              >
                Admin
                <span className="text-xs">{adminOpen ? '▲' : '▼'}</span>
              </button>
              {adminOpen ? (
                <div className="absolute right-0 mt-2 w-44 rounded-lg border border-gray-200 bg-white p-2 shadow-lg">
                  <Link to="/admin" className={`block rounded px-2 py-1 ${linkClass('/admin')}`}>
                    Dashboard
                  </Link>
                  <Link to="/admin/payments" className={`block rounded px-2 py-1 ${linkClass('/admin/payments')}`}>
                    Payments
                  </Link>
                </div>
              ) : null}
            </div>
          ) : null}
          {me && (me.role === 'STAFF' || me.role === 'ADMIN') ? (
            <>
              <div className="relative" ref={moderationRef}>
                <button
                  type="button"
                  onClick={() => setModerationOpen((prev) => !prev)}
                  className={`flex items-center gap-1 ${isModerationRoute ? 'text-ink' : 'text-gray-600 hover:text-gray-900'}`}
                >
                  Moderation
                  <span className="text-xs">{moderationOpen ? '▲' : '▼'}</span>
                </button>
                {moderationOpen ? (
                  <div className="absolute right-0 mt-2 w-56 rounded-lg border border-gray-200 bg-white p-2 shadow-lg">
                    <Link to="/moderation/study-sheets" className={`block rounded px-2 py-1 ${linkClass('/moderation/study-sheets')}`}>
                      Study Sheets
                    </Link>
                    <Link to="/moderation/reviews" className={`block rounded px-2 py-1 ${linkClass('/moderation/reviews')}`}>
                      Review Moderation
                    </Link>
                    <Link to="/moderation/teacher-reviews" className={`block rounded px-2 py-1 ${linkClass('/moderation/teacher-reviews')}`}>
                      Teacher Review Moderation
                    </Link>
                    <Link to="/moderation/teacher-suggestions" className={`block rounded px-2 py-1 ${linkClass('/moderation/teacher-suggestions')}`}>
                      Teacher Suggestions
                    </Link>
                    <Link to="/moderation/lease-listings" className={`block rounded px-2 py-1 ${linkClass('/moderation/lease-listings')}`}>
                      Lease Moderation
                    </Link>
                  </div>
                ) : null}
              </div>
            </>
          ) : null}
          {me?.role === 'STUDENT' ? (
            <Link to="/leases/mine" className={linkClass('/leases/mine')}>
              My Leases
            </Link>
          ) : null}
        </nav>
        <div className="flex items-center gap-3">
          {me ? (
            <Badge label={me.role} variant="info" />
          ) : null}
          {token ? (
            <Button variant="secondary" onClick={logout}>
              Logout
            </Button>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login" className="text-sm text-gray-600">
                Login
              </Link>
              <Link to="/register">
                <Button>Get Started</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

export default Navbar
