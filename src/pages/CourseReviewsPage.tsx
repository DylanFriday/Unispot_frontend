import { useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { reviewsApi } from '../api/reviews.api'
import type { ApiError } from '../types/dto'
import PageHeader from '../components/PageHeader'
import Card from '../components/Card'
import Badge from '../components/Badge'
import Spinner from '../components/Spinner'
import Alert from '../components/Alert'
import EmptyState from '../components/EmptyState'

const statusVariant = (status: string) => {
  if (status === 'VISIBLE') return 'success'
  if (status === 'UNDER_REVIEW') return 'warning'
  return 'danger'
}

const CourseReviewsPage = () => {
  const params = useParams()
  const courseId = useMemo(() => Number(params.id), [params.id])

  const { data, isLoading, error } = useQuery({
    queryKey: ['course-reviews', courseId],
    queryFn: () => reviewsApi.listByCourse(courseId),
    enabled: Number.isFinite(courseId),
  })

  const errorMessage = (error as { response?: { data?: ApiError } })?.response
    ?.data?.message

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Course ${params.id} Reviews`}
        subtitle="Public reviews for this course."
      />

      {isLoading ? (
        <div className="flex min-h-[40vh] items-center justify-center">
          <Spinner />
        </div>
      ) : errorMessage ? (
        <Alert message={errorMessage} tone="error" />
      ) : data && data.length > 0 ? (
        <div className="space-y-4">
          {data.map((review) => (
            <Card key={review.id} className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-semibold text-gray-900">
                  Rating: {review.rating}/5
                </span>
                <Badge
                  label={review.status}
                  variant={statusVariant(review.status)}
                />
              </div>
              <p className="text-sm text-gray-700">{review.text}</p>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No reviews yet"
          description="Reviews will show up here when available." 
        />
      )}
    </div>
  )
}

export default CourseReviewsPage
