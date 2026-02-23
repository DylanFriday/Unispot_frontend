import { Navigate } from 'react-router-dom'
import type { ReactElement } from 'react'
import { useAuth } from '../auth/useAuth'
import Spinner from '../components/Spinner'

const ProtectedRoute = ({ children }: { children: ReactElement }) => {
  const { token, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner />
      </div>
    )
  }

  if (!token) {
    return <Navigate to="/login" replace />
  }

  return children
}

export default ProtectedRoute
