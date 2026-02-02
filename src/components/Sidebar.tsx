import { Link, useLocation } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../auth/useAuth'

const Sidebar = () => {
  const { me } = useAuth()
  const location = useLocation()

  if (!me) return null

  const baseLinks = useMemo(
    () => [
      { to: '/', label: 'Home' },
      { to: '/courses', label: 'Courses' },
      { to: '/study-sheets', label: 'Study Sheets' },
      { to: '/leases', label: 'Leases' },
    ],
    []
  )

  const studentLinks = useMemo(
    () => [
      { to: '/student', label: 'Dashboard' },
      { to: '/student/study-sheets/mine', label: 'My Study Sheets' },
      { to: '/student/study-sheets/new', label: 'New Study Sheet' },
      { to: '/student/lease-listings/mine', label: 'My Lease Listings' },
      { to: '/student/lease-listings/new', label: 'New Lease Listing' },
      { to: '/leases/mine', label: 'My Leases' },
    ],
    []
  )

  const moderationLinks = useMemo(
    () => [
      { to: '/moderation/study-sheets', label: 'Study Sheets' },
      { to: '/moderation/reviews', label: 'Review Moderation' },
      { to: '/moderation/teacher-reviews', label: 'Teacher Reviews' },
      { to: '/moderation/lease-listings', label: 'Lease Listings' },
    ],
    []
  )

  const adminLinks = useMemo(
    () => [
      { to: '/admin', label: 'Admin Dashboard' },
      { to: '/admin/payments', label: 'Payments' },
    ],
    []
  )

  const isModerationRoute = location.pathname.startsWith('/moderation')
  const isAdminRoute = location.pathname.startsWith('/admin')

  const [moderationOpen, setModerationOpen] = useState(isModerationRoute)
  const [adminOpen, setAdminOpen] = useState(isAdminRoute)

  useEffect(() => {
    if (isModerationRoute) setModerationOpen(true)
  }, [isModerationRoute])

  useEffect(() => {
    if (isAdminRoute) setAdminOpen(true)
  }, [isAdminRoute])

  const linkClass = (to: string) => {
    const isActive =
      to === '/'
        ? location.pathname === '/'
        : location.pathname === to || location.pathname.startsWith(`${to}/`)
    return `text-sm font-medium transition ${
      isActive ? 'text-ink' : 'text-gray-700 hover:text-gray-900'
    }`
  }

  return (
    <aside className="w-full border-b border-gray-200 bg-white px-4 py-3 md:w-56 md:border-b-0 md:border-r">
      <nav className="flex gap-3 md:flex-col">
        {baseLinks.map((link) => (
          <Link key={link.to} to={link.to} className={linkClass(link.to)}>
            {link.label}
          </Link>
        ))}

        {me.role === 'STUDENT'
          ? studentLinks.map((link) => (
              <Link key={link.to} to={link.to} className={linkClass(link.to)}>
                {link.label}
              </Link>
            ))
          : null}

        {(me.role === 'STAFF' || me.role === 'ADMIN') ? (
          <div className="space-y-2">
            <button
              type="button"
              className={`flex w-full items-center justify-between rounded-md px-2 py-1 text-sm font-semibold ${
                isModerationRoute ? 'bg-ink/10 text-ink' : 'text-gray-800'
              }`}
              onClick={() => setModerationOpen((prev) => !prev)}
            >
              Moderation
              <span className="text-xs">{moderationOpen ? '▲' : '▼'}</span>
            </button>
            <div
              className={`space-y-1 overflow-hidden transition-all duration-200 ${
                moderationOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
              }`}
            >
              {moderationLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`ml-3 block ${linkClass(link.to)}`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        ) : null}

        {me.role === 'ADMIN' ? (
          <div className="space-y-2">
            <button
              type="button"
              className={`flex w-full items-center justify-between rounded-md px-2 py-1 text-sm font-semibold ${
                isAdminRoute ? 'bg-ink/10 text-ink' : 'text-gray-800'
              }`}
              onClick={() => setAdminOpen((prev) => !prev)}
            >
              Admin
              <span className="text-xs">{adminOpen ? '▲' : '▼'}</span>
            </button>
            <div
              className={`space-y-1 overflow-hidden transition-all duration-200 ${
                adminOpen ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'
              }`}
            >
              {adminLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`ml-3 block ${linkClass(link.to)}`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        ) : null}
      </nav>
    </aside>
  )
}

export default Sidebar
