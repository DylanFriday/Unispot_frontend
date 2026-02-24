import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { moderationApi } from '../../api/moderation.api'
import type { ApiError, StudySheetDto, StudySheetStatus } from '../../types/dto'
import PageHeader from '../../components/PageHeader'
import Table from '../../components/Table'
import Badge from '../../components/Badge'
import Button from '../../components/Button'
import Modal from '../../components/Modal'
import Input from '../../components/Input'
import Alert from '../../components/Alert'
import Spinner from '../../components/Spinner'
import EmptyState from '../../components/EmptyState'
import { formatBahtFromCents } from '../../utils/money'
import { formatDate } from '../../utils/format'

const statusOptions: StudySheetStatus[] = ['PENDING', 'APPROVED', 'REJECTED']

const statusVariant = (status: StudySheetStatus) => {
  if (status === 'PENDING') return 'warning'
  if (status === 'APPROVED') return 'success'
  return 'danger'
}

const headers = [
  'ID',
  'Title',
  'Course ID',
  'Owner ID',
  'Price (Baht)',
  'Status',
  'Created At',
  'Actions',
]

const StudySheetModerationPage = () => {
  const queryClient = useQueryClient()
  const [status, setStatus] = useState<StudySheetStatus>('PENDING')
  const [rejectTarget, setRejectTarget] = useState<StudySheetDto | null>(null)
  const [rejectReason, setRejectReason] = useState('')

  const queryKey = useMemo(
    () => ['moderation', 'study-sheets', status],
    [status]
  )

  const { data, isLoading, error } = useQuery({
    queryKey,
    queryFn: () => moderationApi.listStudySheets(status),
  })

  const approveMutation = useMutation({
    mutationFn: (id: number) => moderationApi.approveStudySheet(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey })
    },
  })

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: number; reason?: string }) =>
      moderationApi.rejectStudySheet(id, reason),
    onSuccess: () => {
      setRejectTarget(null)
      setRejectReason('')
      void queryClient.invalidateQueries({ queryKey })
    },
  })

  const errorMessage = (error as { response?: { data?: ApiError } })?.response
    ?.data?.message

  return (
    <div className="space-y-6">
      <PageHeader
        title="Study Sheet Moderation"
        subtitle="Review study sheets by moderation status."
        action={
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700" htmlFor="status">
              Status
            </label>
            <select
              id="status"
              className="rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900"
              value={status}
              onChange={(event) =>
                setStatus(event.target.value as StudySheetStatus)
              }
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
          {data.map((sheet) => (
            <tr key={sheet.id} className="text-sm text-gray-700">
              <td className="px-4 py-3 font-medium text-gray-900">
                {sheet.id}
              </td>
              <td className="px-4 py-3">{sheet.title}</td>
              <td className="px-4 py-3">{sheet.courseId}</td>
              <td className="px-4 py-3">{sheet.ownerId}</td>
              <td className="px-4 py-3">
                {sheet.price == null ? '-' : formatBahtFromCents(sheet.price)}
              </td>
              <td className="px-4 py-3">
                <Badge label={sheet.status} variant={statusVariant(sheet.status)} />
              </td>
              <td className="px-4 py-3">{formatDate(sheet.createdAt)}</td>
              <td className="px-4 py-3">
                {sheet.status === 'PENDING' ? (
                  <div className="flex flex-wrap gap-2">
                    <Button
                      onClick={() => approveMutation.mutate(sheet.id)}
                      disabled={approveMutation.isPending}
                    >
                      {approveMutation.isPending ? 'Approving...' : 'Approve'}
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => setRejectTarget(sheet)}
                    >
                      Reject
                    </Button>
                  </div>
                ) : (
                  <span className="text-xs text-gray-400">No actions</span>
                )}
              </td>
            </tr>
          ))}
        </Table>
      ) : (
        <EmptyState
          title="No study sheets"
          description="No study sheets found for this status."
        />
      )}

      <Modal
        open={Boolean(rejectTarget)}
        title="Reject study sheet"
        onClose={() => {
          setRejectTarget(null)
          setRejectReason('')
        }}
        footer={
          <div className="flex gap-2">
            <Button
              variant="secondary"
              onClick={() => {
                setRejectTarget(null)
                setRejectReason('')
              }}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={() =>
                rejectTarget &&
                rejectMutation.mutate({
                  id: rejectTarget.id,
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
            Optional: provide a reason to include in the rejection.
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

export default StudySheetModerationPage
