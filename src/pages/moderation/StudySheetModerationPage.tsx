import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { moderationApi } from '../../api/moderation.api'
import type { ApiError, StudySheetDto } from '../../types/dto'
import PageHeader from '../../components/PageHeader'
import Table from '../../components/Table'
import Button from '../../components/Button'
import Modal from '../../components/Modal'
import Input from '../../components/Input'
import Alert from '../../components/Alert'
import Spinner from '../../components/Spinner'
import EmptyState from '../../components/EmptyState'

const headers = [
  'ID',
  'Title',
  'Course ID',
  'Owner ID',
  'Price (cents)',
  'Created At',
  'Actions',
]

const StudySheetModerationPage = () => {
  const queryClient = useQueryClient()
  const [rejectTarget, setRejectTarget] = useState<StudySheetDto | null>(null)
  const [rejectReason, setRejectReason] = useState('')

  const { data, isLoading, error } = useQuery({
    queryKey: ['moderation', 'study-sheets', 'pending'],
    queryFn: () => moderationApi.listPendingStudySheets(),
  })

  const approveMutation = useMutation({
    mutationFn: (id: number) => moderationApi.approveStudySheet(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ['moderation', 'study-sheets', 'pending'],
      })
    },
  })

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: number; reason?: string }) =>
      moderationApi.rejectStudySheet(id, reason),
    onSuccess: () => {
      setRejectTarget(null)
      setRejectReason('')
      void queryClient.invalidateQueries({
        queryKey: ['moderation', 'study-sheets', 'pending'],
      })
    },
  })

  const errorMessage = (error as { response?: { data?: ApiError } })?.response
    ?.data?.message

  return (
    <div className="space-y-6">
      <PageHeader
        title="Study Sheet Moderation"
        subtitle="Approve or reject pending study sheets."
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
              <td className="px-4 py-3">{sheet.priceCents}</td>
              <td className="px-4 py-3">{sheet.createdAt}</td>
              <td className="px-4 py-3">
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
              </td>
            </tr>
          ))}
        </Table>
      ) : (
        <EmptyState
          title="No pending study sheets"
          description="All pending study sheets have been reviewed."
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
