import { Link } from 'react-router-dom'
import PageHeader from '../../components/PageHeader'
import Card from '../../components/Card'
import Button from '../../components/Button'

const AdminDashboardPage = () => (
  <div className="space-y-6">
    <PageHeader
      title="Admin Dashboard"
      subtitle="Review payments and admin operations."
    />
    <div className="grid gap-4 md:grid-cols-2">
      <Card className="space-y-3">
        <h3 className="text-lg font-semibold text-gray-900">Payments</h3>
        <p className="text-sm text-gray-600">
          Confirm and release study sheet payments.
        </p>
        <Link to="/admin/payments">
          <Button>Open payments</Button>
        </Link>
      </Card>
    </div>
  </div>
)

export default AdminDashboardPage
