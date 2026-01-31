import { Link } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'

const Sidebar = () => {
  const { me } = useAuth()

  if (!me) return null

  const links =
    me.role === 'ADMIN'
      ? [
          { to: '/admin', label: 'Admin Dashboard' },
          { to: '/admin/payments', label: 'Payments' },
          { to: '/moderation/study-sheets', label: 'Study Sheets' },
          { to: '/moderation/lease-listings', label: 'Lease Listings' },
        ]
      : me.role === 'STAFF'
        ? [
            { to: '/moderation/study-sheets', label: 'Study Sheets' },
            { to: '/moderation/lease-listings', label: 'Lease Listings' },
          ]
        : [
            { to: '/student', label: 'Dashboard' },
            { to: '/student/study-sheets/mine', label: 'My Study Sheets' },
            { to: '/student/study-sheets/new', label: 'New Study Sheet' },
            { to: '/student/lease-listings/mine', label: 'My Lease Listings' },
            { to: '/student/lease-listings/new', label: 'New Lease Listing' },
            { to: '/leases/mine', label: 'My Leases' },
          ]

  return (
    <aside className="w-full border-b border-gray-200 bg-white px-4 py-3 md:w-56 md:border-b-0 md:border-r">
      <nav className="flex gap-3 md:flex-col">
        {links.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className="text-sm font-medium text-gray-700 hover:text-gray-900"
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </aside>
  )
}

export default Sidebar
