import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { reviewModerationApi } from '../../api/reviewModeration.api'
import type { ApiError } from '../../types/dto'
import PageHeader from '../../components/PageHeader'
import Table from '../../components/Table'
import Badge from '../../components/Badge'
import Button from '../../components/Button'
import Alert from '../../components/Alert'
import Spinner from '../../components/Spinner'
import EmptyState from '../../components/EmptyState'

const statusOptions = ['UNDER_REVIEW', 'VISIBLE', 'REMOVED'] as const

const statusVariant = (status: string) => {
  if (status === 'VISIBLE') return 'success'
  if (status === 'UNDER_REVIEW') return 'warning'
  return 'danger'
}

const headers = [
  'ID',
  'Course ID',
  'Student ID',
  'Rating',
  'Text',
  'Status',
  'Created At',
  'Actions',
]

const ReviewModerationPage = () => {
  const queryClient = useQueryClient()
  const [status, setStatus] = useState<typeof statusOptions[number]>('UNDER_REVIEW')

  const queryKey = useMemo(() => ['reviewModeration', status], [status])

  const { data, isLoading, error } = useQuery({
    queryKey,
    queryFn: () => reviewModerationApi.list(status),
  })

  const approveMutation = useMutation({
    mutationFn: (id: number) => reviewModerationApi.approve(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey })
    },
  })

  const removeMutation = useMutation({
    mutationFn: (id: number) => reviewModerationApi.remove(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey })
    },
  })

  const errorMessage = (error as { response?: { data?: ApiError } })?.response
    ?.data?.message

  return (
    <div className="space-y-6">
      <PageHeader
        title="Review Moderation"
        subtitle="Approve or remove course reviews."
        action={
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700" htmlFor="status">
              Status
            </label>
            <select
              id="status"
              className="rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900"
              value={status}
              onChange={(event) => setStatus(event.target.value as typeof statusOptions[number])}
            >
              {statusOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        }
      />

      {isLoading ? (
        <div className="flex min-h-[40vh] items-center justify-center">
          <Spinner />
        </div>
      ) : errorMessage ? (
        <Alert message={errorMessage} tone="error" />
      ) : data && data.length > 0 ? (
        <Table headers={headers}>
          {data.map((review) => (
            <tr key={review.id} className="text-sm text-gray-700">
              <td className="px-4 py-3 font-medium text-gray-900">{review.id}</td>
              <td className="px-4 py-3">{review.courseId}</td>
              <td className="px-4 py-3">{review.studentId}</td>
              <td className="px-4 py-3">{review.rating}</td>
              <td className="px-4 py-3">{review.text}</td>
              <td className="px-4 py-3">
                <Badge label={review.status} variant={statusVariant(review.status)} />
              </td>
              <td className="px-4 py-3">{review.createdAt}</td>
              <td className="px-4 py-3">
                <div className="flex flex-wrap gap-2">
                  {status === 'UNDER_REVIEW' ? (
                    <Button
                      onClick={() => approveMutation.mutate(review.id)}
                      disabled={approveMutation.isPending}
                    >
                      {approveMutation.isPending ? 'Approving...' : 'Approve'}
                    </Button>
                  ) : null}
                  <Button
                    variant="danger"
                    onClick={() => removeMutation.mutate(review.id)}
                    disabled={removeMutation.isPending}
                  >
                    {removeMutation.isPending ? 'Removing...' : 'Remove'}
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </Table>
      ) : (
        <EmptyState
          title="No reviews"
          description="No reviews found for this status."
        />
      )}
    </div>
  )
}

export default ReviewModerationPage
