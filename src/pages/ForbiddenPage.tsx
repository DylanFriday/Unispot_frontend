import { Link } from 'react-router-dom'
import Card from '../components/Card'
import Button from '../components/Button'

const ForbiddenPage = () => (
  <div className="mx-auto max-w-lg">
    <Card className="space-y-3 text-center">
      <h1 className="text-2xl font-semibold text-gray-900">Access denied</h1>
      <p className="text-sm text-gray-600">
        You do not have permission to view this area.
      </p>
      <Link to="/">
        <Button variant="secondary">Back to home</Button>
      </Link>
    </Card>
  </div>
)

export default ForbiddenPage
