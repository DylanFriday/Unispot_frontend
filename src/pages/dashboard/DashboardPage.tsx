import { Navigate } from 'react-router-dom'
import { useAuth } from '../../auth/useAuth'
import Spinner from '../../components/Spinner'
import StudentDashboard from './StudentDashboard'
import AdminDashboard from './AdminDashboard'

const DashboardPage = () => {
  const { me, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Spinner />
      </div>
    )
  }

  if (!me) {
    return <Navigate to="/login" replace />
  }

  if (me.role === 'STUDENT') {
    return <StudentDashboard />
  }

  return <AdminDashboard />
}

export default DashboardPage
