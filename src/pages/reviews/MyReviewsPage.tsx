import { Link } from 'react-router-dom'
import PageHeader from '../../components/PageHeader'
import Card from '../../components/Card'
import Button from '../../components/Button'

const MyReviewsPage = () => {
  return (
    <div className="space-y-6">
      <PageHeader title="My Reviews" subtitle="Reviews you have submitted." />
      <Card className="space-y-3">
        <p className="text-sm text-slate-600">
          Review history list is not available yet.
        </p>
        <Link to="/courses">
          <Button variant="secondary">Browse Courses to Review</Button>
        </Link>
      </Card>
    </div>
  )
}

export default MyReviewsPage
