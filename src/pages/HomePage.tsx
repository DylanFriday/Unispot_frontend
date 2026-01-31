import { Link } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'
import Card from '../components/Card'
import Button from '../components/Button'
import Badge from '../components/Badge'
import { redirectForRole } from '../auth/AuthProvider'

const HomePage = () => {
  const { me, token } = useAuth()
  const destination = me ? redirectForRole(me.role) : null

  return (
    <div className="space-y-6">
      <Card>
        <h1 className="text-2xl font-semibold text-gray-900">
          UniSpot Frontend
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          Minimal foundation for authentication and routing.
        </p>
        {token && me ? (
          <div className="mt-4 flex items-center gap-3">
            <Badge label={me.role} variant="info" />
            {destination ? (
              <Link to={destination}>
                <Button>Go to workspace</Button>
              </Link>
            ) : null}
          </div>
        ) : (
          <div className="mt-4 flex flex-wrap gap-3">
            <Link to="/login">
              <Button>Login</Button>
            </Link>
            <Link to="/register">
              <Button variant="secondary">Register</Button>
            </Link>
          </div>
        )}
      </Card>
    </div>
  )
}

export default HomePage
