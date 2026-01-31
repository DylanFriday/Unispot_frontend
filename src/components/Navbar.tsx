import { Link } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'
import Button from './Button'
import Badge from './Badge'

const Navbar = () => {
  const { me, token, logout } = useAuth()

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link to="/" className="text-lg font-semibold text-gray-900">
          UniSpot
        </Link>
        <nav className="hidden items-center gap-4 text-sm text-gray-600 md:flex">
          <Link to="/study-sheets" className="hover:text-gray-900">
            Study Sheets
          </Link>
          <Link to="/leases" className="hover:text-gray-900">
            Leases
          </Link>
          {me?.role === 'ADMIN' ? (
            <>
              <Link to="/admin" className="hover:text-gray-900">
                Admin Dashboard
              </Link>
              <Link to="/admin/payments" className="hover:text-gray-900">
                Payments
              </Link>
            </>
          ) : null}
          {me && (me.role === 'STAFF' || me.role === 'ADMIN') ? (
            <>
              <Link to="/moderation/study-sheets" className="hover:text-gray-900">
                Study Sheet Moderation
              </Link>
              <Link to="/moderation/lease-listings" className="hover:text-gray-900">
                Lease Moderation
              </Link>
            </>
          ) : null}
          {me?.role === 'STUDENT' ? (
            <Link to="/leases/mine" className="hover:text-gray-900">
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
