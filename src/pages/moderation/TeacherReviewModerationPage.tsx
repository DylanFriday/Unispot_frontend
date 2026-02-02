import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { teacherReviewsApi } from '../../api/teacherReviews.api'
import type { ApiError } from '../../types/dto'
import PageHeader from '../../components/PageHeader'
import Table from '../../components/Table'
import Badge from '../../components/Badge'
import Button from '../../components/Button'
import Alert from '../../components/Alert'
import Spinner from '../../components/Spinner'
import EmptyState from '../../components/EmptyState'
import Modal from '../../components/Modal'
import Input from '../../components/Input'
import { formatDate } from '../../utils/format'

const statusOptions = ['UNDER_REVIEW', 'VISIBLE', 'REMOVED'] as const

const statusVariant = (status: string) => {
  if (status === 'VISIBLE') return 'success'
  if (status === 'UNDER_REVIEW') return 'warning'
  return 'danger'
}

const headers = [
  'ID',
  'Course ID',
  'Teacher Name',
  'Student ID',
  'Rating',
  'Text',
  'Status',
  'Created At',
  'Actions',
]

const TeacherReviewModerationPage = () => {
  const queryClient = useQueryClient()
  const [status, setStatus] = useState<typeof statusOptions[number]>('UNDER_REVIEW')
  const [textModal, setTextModal] = useState<string | null>(null)
  const [removeTargetId, setRemoveTargetId] = useState<number | null>(null)
  const [removeReason, setRemoveReason] = useState('')
  const truncateText = (text: string, maxLength = 90) =>
    text.length > maxLength ? `${text.slice(0, maxLength)}...` : text

  const queryKey = useMemo(() => ['teacherReviewModeration', status], [status])

  const { data, isLoading, error } = useQuery({
    queryKey,
    queryFn: () => teacherReviewsApi.listModeration(status),
  })

  const approveMutation = useMutation({
    mutationFn: (id: number) => teacherReviewsApi.approve(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey })
    },
  })

  const removeMutation = useMutation({
    mutationFn: (payload: { id: number; reason?: string }) =>
      teacherReviewsApi.remove(payload.id, payload.reason),
    onSuccess: () => {
      setRemoveTargetId(null)
      setRemoveReason('')
      void queryClient.invalidateQueries({ queryKey })
    },
  })

  const errorMessage = (error as { response?: { data?: ApiError } })?.response
    ?.data?.message

  return (
    <div className="space-y-6">
      <PageHeader
        title="Teacher Review Moderation"
        subtitle="Approve or remove teacher reviews."
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
              <td className="px-4 py-3">{review.teacherName}</td>
              <td className="px-4 py-3">{review.studentId}</td>
              <td className="px-4 py-3">{review.rating}</td>
              <td className="px-4 py-3">
                <div className="space-y-2">
                  <p className="text-xs text-gray-600">
                    {truncateText(review.text)}
                  </p>
                  {review.text.length > 90 ? (
                    <Button variant="secondary" onClick={() => setTextModal(review.text)}>
                      View
                    </Button>
                  ) : null}
                </div>
              </td>
              <td className="px-4 py-3">
                <Badge label={review.status} variant={statusVariant(review.status)} />
              </td>
              <td className="px-4 py-3">{formatDate(review.createdAt)}</td>
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
                  {review.status !== 'REMOVED' ? (
                    <Button
                      variant="danger"
                      onClick={() => setRemoveTargetId(review.id)}
                      disabled={removeMutation.isPending}
                    >
                      {removeMutation.isPending ? 'Removing...' : 'Remove'}
                    </Button>
                  ) : null}
                </div>
              </td>
            </tr>
          ))}
        </Table>
      ) : (
        <EmptyState
          title="No reviews"
          description="No teacher reviews found for this status."
        />
      )}

      <Modal
        open={Boolean(textModal)}
        title="Review text"
        onClose={() => setTextModal(null)}
        footer={
          <Button variant="secondary" onClick={() => setTextModal(null)}>
            Close
          </Button>
        }
      >
        <p className="text-sm text-gray-700">{textModal}</p>
      </Modal>

      <Modal
        open={removeTargetId !== null}
        title="Remove review"
        onClose={() => {
          setRemoveTargetId(null)
          setRemoveReason('')
        }}
        footer={
          <div className="flex gap-2">
            <Button
              variant="secondary"
              onClick={() => {
                setRemoveTargetId(null)
                setRemoveReason('')
              }}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={() =>
                removeTargetId !== null &&
                removeMutation.mutate({
                  id: removeTargetId,
                  reason: removeReason.trim() || undefined,
                })
              }
              disabled={removeMutation.isPending}
            >
              {removeMutation.isPending ? 'Removing...' : 'Remove'}
            </Button>
          </div>
        }
      >
        <div className="space-y-3">
          <p className="text-sm text-gray-600">
            Optionally provide a reason for removing this review.
          </p>
          <Input
            label="Reason"
            value={removeReason}
            onChange={(event) => setRemoveReason(event.target.value)}
            placeholder="Optional reason"
          />
        </div>
      </Modal>
    </div>
  )
}

export default TeacherReviewModerationPage
