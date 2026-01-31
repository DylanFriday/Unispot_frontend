import { Link } from 'react-router-dom'
import Card from '../components/Card'
import Button from '../components/Button'

const NotFoundPage = () => (
  <div className="mx-auto max-w-lg">
    <Card className="space-y-3 text-center">
      <h1 className="text-2xl font-semibold text-gray-900">Page not found</h1>
      <p className="text-sm text-gray-600">
        The page you are looking for does not exist.
      </p>
      <Link to="/">
        <Button variant="secondary">Go home</Button>
      </Link>
    </Card>
  </div>
)

export default NotFoundPage
