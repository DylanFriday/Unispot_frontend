import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { teacherSuggestionsApi } from '../../api/teacherSuggestions.api'
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

const statusOptions = ['PENDING', 'APPROVED', 'REJECTED'] as const

const statusVariant = (status: string) => {
  if (status === 'APPROVED') return 'success'
  if (status === 'PENDING') return 'warning'
  return 'danger'
}

const headers = [
  'ID',
  'Course ID',
  'Teacher Name',
  'Suggested By',
  'Status',
  'Created At',
  'Actions',
]

const TeacherSuggestionModerationPage = () => {
  const queryClient = useQueryClient()
  const [status, setStatus] = useState<typeof statusOptions[number]>('PENDING')
  const [rejectTargetId, setRejectTargetId] = useState<number | null>(null)
  const [rejectReason, setRejectReason] = useState('')

  const queryKey = useMemo(() => ['teacherSuggestionModeration', status], [status])

  const { data, isLoading, error } = useQuery({
    queryKey,
    queryFn: () => teacherSuggestionsApi.moderationList(status),
  })

  const approveMutation = useMutation({
    mutationFn: (id: number) => teacherSuggestionsApi.approve(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey })
    },
  })

  const rejectMutation = useMutation({
    mutationFn: (payload: { id: number; reason?: string }) =>
      teacherSuggestionsApi.reject(payload.id, payload.reason),
    onSuccess: () => {
      setRejectTargetId(null)
      setRejectReason('')
      void queryClient.invalidateQueries({ queryKey })
    },
  })

  const errorMessage = (error as { response?: { data?: ApiError } })?.response
    ?.data?.message

  return (
    <div className="space-y-6">
      <PageHeader
        title="Teacher Suggestions"
        subtitle="Approve or reject teacher suggestions."
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
          {data.map((suggestion) => (
            <tr key={suggestion.id} className="text-sm text-gray-700">
              <td className="px-4 py-3 font-medium text-gray-900">{suggestion.id}</td>
              <td className="px-4 py-3">{suggestion.courseId}</td>
              <td className="px-4 py-3">{suggestion.teacherName}</td>
              <td className="px-4 py-3">{suggestion.suggestedById}</td>
              <td className="px-4 py-3">
                <Badge
                  label={suggestion.status}
                  variant={statusVariant(suggestion.status)}
                />
              </td>
              <td className="px-4 py-3">{formatDate(suggestion.createdAt)}</td>
              <td className="px-4 py-3">
                <div className="flex flex-wrap gap-2">
                  {suggestion.status === 'PENDING' ? (
                    <Button
                      onClick={() => approveMutation.mutate(suggestion.id)}
                      disabled={approveMutation.isPending}
                    >
                      {approveMutation.isPending ? 'Approving...' : 'Approve'}
                    </Button>
                  ) : null}
                  {suggestion.status === 'PENDING' ? (
                    <Button
                      variant="danger"
                      onClick={() => setRejectTargetId(suggestion.id)}
                    >
                      Reject
                    </Button>
                  ) : null}
                </div>
              </td>
            </tr>
          ))}
        </Table>
      ) : (
        <EmptyState
          title="No suggestions"
          description="No teacher suggestions found for this status."
        />
      )}

      <Modal
        open={rejectTargetId !== null}
        title="Reject suggestion"
        onClose={() => {
          setRejectTargetId(null)
          setRejectReason('')
        }}
        footer={
          <div className="flex gap-2">
            <Button
              variant="secondary"
              onClick={() => {
                setRejectTargetId(null)
                setRejectReason('')
              }}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={() =>
                rejectTargetId !== null &&
                rejectMutation.mutate({
                  id: rejectTargetId,
                  reason: rejectReason.trim() || undefined,
                })
              }
              disabled={rejectMutation.isPending}
            >
              {rejectMutation.isPending ? 'Rejecting...' : 'Reject'}
            </Button>
          </div>
        }
      >
        <div className="space-y-3">
          <p className="text-sm text-gray-600">
            Optionally provide a reason for rejecting this suggestion.
          </p>
          <Input
            label="Reason"
            value={rejectReason}
            onChange={(event) => setRejectReason(event.target.value)}
            placeholder="Optional reason"
          />
        </div>
      </Modal>
    </div>
  )
}

export default TeacherSuggestionModerationPage
