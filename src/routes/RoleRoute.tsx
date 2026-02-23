import { Navigate } from 'react-router-dom'
import type { ReactElement } from 'react'
import { useAuth } from '../auth/useAuth'
import type { Role } from '../types/dto'
import Spinner from '../components/Spinner'

interface RoleRouteProps {
  allow: Role[]
  children: ReactElement
}

const RoleRoute = ({ allow, children }: RoleRouteProps) => {
  const { me, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner />
      </div>
    )
  }

  if (!me) {
    return <Navigate to="/login" replace />
  }

  if (!allow.includes(me.role)) {
    return <Navigate to="/forbidden" replace />
  }

  return children
}

export default RoleRoute
