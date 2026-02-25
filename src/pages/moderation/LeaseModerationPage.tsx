import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { leaseModerationApi } from '../../api/leaseModeration.api'
import type { ApiError, LeaseListingDto, LeaseListingStatus } from '../../types/dto'
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

const statusOptions: LeaseListingStatus[] = [
  'PENDING',
  'APPROVED',
  'REJECTED',
]

const statusVariant = (status: LeaseListingStatus) => {
  if (status === 'PENDING') return 'warning'
  if (status === 'APPROVED') return 'success'
  return 'danger'
}

const headers = [
  'Title',
  'Location',
  'Rent (cents)',
  'Deposit (cents)',
  'Start',
  'End',
  'Status',
  'Owner ID',
  'Created At',
  'Actions',
]

const LeaseModerationPage = () => {
  const queryClient = useQueryClient()
  const [status, setStatus] = useState<LeaseListingStatus>('PENDING')
  const [rejectTarget, setRejectTarget] = useState<LeaseListingDto | null>(null)
  const [rejectReason, setRejectReason] = useState('')

  const queryKey = useMemo(
    () => ['moderation', 'lease-listings', status],
    [status]
  )

  const { data, isLoading, error } = useQuery({
    queryKey,
    queryFn: () => leaseModerationApi.listLeaseListings(status),
  })

  const approveMutation = useMutation({
    mutationFn: (id: number) => leaseModerationApi.approveLeaseListing(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey })
    },
  })

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: number; reason: string }) =>
      leaseModerationApi.rejectLeaseListing(id, reason),
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
        title="Lease Moderation"
        subtitle="Approve or reject lease listings."
        action={
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700" htmlFor="status">
              Status
            </label>
            <select
              id="status"
              className="rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900"
              value={status}
              onChange={(event) => setStatus(event.target.value as LeaseListingStatus)}
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
          {data.map((listing) => (
            <tr key={listing.id} className="text-sm text-gray-700">
              <td className="px-4 py-3 font-medium text-gray-900">
                {listing.title}
              </td>
              <td className="px-4 py-3">{listing.location}</td>
              <td className="px-4 py-3">
                {formatBahtFromCents(listing.rentCents)}
              </td>
              <td className="px-4 py-3">
                {formatBahtFromCents(listing.depositCents)}
              </td>
              <td className="px-4 py-3">
                {formatDate(listing.startDate, { dateStyle: 'medium' })}
              </td>
              <td className="px-4 py-3">
                {formatDate(listing.endDate, { dateStyle: 'medium' })}
              </td>
              <td className="px-4 py-3">
                <Badge label={listing.status} variant={statusVariant(listing.status)} />
              </td>
              <td className="px-4 py-3">{listing.ownerId}</td>
              <td className="px-4 py-3">{formatDate(listing.createdAt)}</td>
              <td className="px-4 py-3">
                {listing.status === 'PENDING' ? (
                  <div className="flex flex-wrap gap-2">
                    <Button
                      onClick={() => approveMutation.mutate(listing.id)}
                      disabled={approveMutation.isPending}
                    >
                      {approveMutation.isPending ? 'Approving...' : 'Approve'}
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => setRejectTarget(listing)}
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
          title="No lease listings"
          description="No lease listings found for this status."
        />
      )}

      <Modal
        open={Boolean(rejectTarget)}
        title="Reject lease listing"
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
                  reason: rejectReason.trim(),
                })
              }
              disabled={rejectMutation.isPending || rejectReason.trim().length === 0}
            >
              {rejectMutation.isPending ? 'Rejecting...' : 'Reject'}
            </Button>
          </div>
        }
      >
        <div className="space-y-3">
          <p className="text-sm text-gray-600">
            Reason is required to reject this lease listing.
          </p>
          <Input
            label="Reason"
            value={rejectReason}
            onChange={(event) => setRejectReason(event.target.value)}
            placeholder="Add rejection reason"
          />
        </div>
      </Modal>
    </div>
  )
}

export default LeaseModerationPage
