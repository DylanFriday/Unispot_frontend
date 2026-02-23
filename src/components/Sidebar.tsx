import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'

interface SidebarProps {
  mobileOpen: boolean
  onCloseMobile: () => void
}

interface NavItem {
  to: string
  label: string
  icon: string
}

const Sidebar = ({ mobileOpen, onCloseMobile }: SidebarProps) => {
  const { me, logout } = useAuth()
  const location = useLocation()
  const avatarUrl = me?.avatarUrl?.trim()

  const isModerationRoute =
    location.pathname.startsWith('/moderation') ||
    location.pathname.startsWith('/admin/withdrawals')
  const [moderationOpen, setModerationOpen] = useState(isModerationRoute)

  useEffect(() => {
    if (isModerationRoute) setModerationOpen(true)
  }, [isModerationRoute])

  if (!me) return null

  const navItems = useMemo(() => {
    const base: NavItem[] = [
      { to: '/dashboard', label: 'Dashboard', icon: '▦' },
      { to: '/study-sheets', label: 'Study Sheets', icon: '▤' },
      { to: '/leases', label: 'Leases', icon: '⌂' },
      { to: '/courses', label: 'Course Reviews', icon: '◎' },
    ]
    if (me.role === 'STUDENT') {
      base.push({
        to: '/student/study-sheets/mine',
        label: 'My Study Sheets',
        icon: '▣',
      })
      base.push({ to: '/student/lease-listings/mine', label: 'My Lease Listings', icon: '▧' })
      base.push({ to: '/wallet', label: 'Wallet', icon: '◍' })
    }
    return base
  }, [me.role])

  const moderationItems: NavItem[] = [
    { to: '/moderation/study-sheets', label: 'Study Sheets', icon: '•' },
    { to: '/moderation/reviews', label: 'Reviews', icon: '•' },
    { to: '/moderation/teacher-reviews', label: 'Teacher Reviews', icon: '•' },
    { to: '/moderation/lease-listings', label: 'Lease Listings', icon: '•' },
    ...(me.role === 'ADMIN'
      ? ([{ to: '/admin/withdrawals', label: 'Withdrawals', icon: '•' }] as NavItem[])
      : []),
  ]

  const linkClass = (to: string) => {
    const isActive =
      location.pathname === to || location.pathname.startsWith(`${to}/`)
    return `flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition ${
      isActive
        ? 'bg-blue-600 text-white shadow-sm'
        : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
    }`
  }

  const sideContent = (
    <div className="flex h-full flex-col">
      <div className="px-4 pb-4 pt-5">
        <Link to="/dashboard" className="block" onClick={onCloseMobile}>
          <h1 className="text-lg font-semibold text-slate-900">UniSpot</h1>
          <p className="text-xs text-slate-500">Campus Marketplace</p>
        </Link>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 pb-4">
        {navItems.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className={linkClass(item.to)}
            onClick={onCloseMobile}
          >
            <span className="text-xs opacity-80">{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}

        {me.role === 'ADMIN' || me.role === 'STAFF' ? (
          <div className="mt-4 space-y-1 rounded-xl border border-slate-200 bg-white p-2">
            <button
              type="button"
              className={`flex w-full items-center justify-between rounded-lg px-2 py-2 text-sm font-semibold ${
                isModerationRoute
                  ? 'bg-slate-100 text-slate-900'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
              onClick={() => setModerationOpen((prev) => !prev)}
            >
              <span>Moderation</span>
              <span className="text-xs">{moderationOpen ? '▲' : '▼'}</span>
            </button>
            {moderationOpen ? (
              <div className="space-y-1">
                {moderationItems.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={linkClass(item.to)}
                    onClick={onCloseMobile}
                  >
                    <span className="text-xs opacity-80">{item.icon}</span>
                    <span>{item.label}</span>
                  </Link>
                ))}
              </div>
            ) : null}
          </div>
        ) : null}
      </nav>

      <div className="border-t border-slate-200 p-3">
        <div className="mb-3 flex items-center gap-3 rounded-xl bg-slate-100 px-3 py-2">
          <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-blue-600 text-xs font-semibold text-white">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt="Profile avatar"
                className="h-full w-full object-cover"
              />
            ) : (
              me.email?.charAt(0).toUpperCase() || 'U'
            )}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-slate-900">
              {me.name ?? me.fullName ?? me.username ?? `User ${me.id}`}
            </p>
            <p className="text-xs text-slate-500">{me.role}</p>
          </div>
        </div>
        <Link
          to="/profile"
          className={linkClass('/profile')}
          onClick={onCloseMobile}
        >
          <span className="text-xs opacity-80">◐</span>
          <span>My Profile</span>
        </Link>
        <button
          type="button"
          className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          onClick={logout}
        >
          Logout
        </button>
      </div>
    </div>
  )

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[240px] border-r border-slate-200 bg-slate-50 md:block">
        {sideContent}
      </aside>

      {mobileOpen ? (
        <div className="fixed inset-0 z-40 md:hidden">
          <div
            className="absolute inset-0 bg-slate-900/40"
            onClick={onCloseMobile}
            aria-hidden
          />
          <aside className="absolute inset-y-0 left-0 w-[240px] border-r border-slate-200 bg-slate-50">
            {sideContent}
          </aside>
        </div>
      ) : null}
    </>
  )
}

export default Sidebar
