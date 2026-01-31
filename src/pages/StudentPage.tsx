import { Link } from 'react-router-dom'
import PageHeader from '../components/PageHeader'
import Card from '../components/Card'
import Button from '../components/Button'

const StudentPage = () => (
  <div className="space-y-6">
    <PageHeader
      title="Student Dashboard"
      subtitle="Manage your study sheets and lease listings."
    />
    <div className="grid gap-4 md:grid-cols-2">
      <Card className="space-y-3">
        <h3 className="text-lg font-semibold text-gray-900">Study Sheets</h3>
        <p className="text-sm text-gray-600">
          Create and manage your study sheets.
        </p>
        <Link to="/student/study-sheets/mine">
          <Button>My Study Sheets</Button>
        </Link>
      </Card>
      <Card className="space-y-3">
        <h3 className="text-lg font-semibold text-gray-900">Lease Listings</h3>
        <p className="text-sm text-gray-600">
          Publish and manage your lease listings.
        </p>
        <Link to="/student/lease-listings/mine">
          <Button>My Lease Listings</Button>
        </Link>
      </Card>
    </div>
  </div>
)

export default StudentPage
