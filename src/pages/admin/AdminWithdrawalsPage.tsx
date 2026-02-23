import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { withdrawalsApi } from '../../api/withdrawals.api'
import type { ApiError, WithdrawalDto, WithdrawalStatus } from '../../types/dto'
import PageHeader from '../../components/PageHeader'
import Table from '../../components/Table'
import Badge from '../../components/Badge'
import Button from '../../components/Button'
import Spinner from '../../components/Spinner'
import Alert from '../../components/Alert'
import EmptyState from '../../components/EmptyState'
import Modal from '../../components/Modal'
import { formatDate } from '../../utils/format'

const statusOptions: WithdrawalStatus[] = ['PENDING', 'APPROVED', 'REJECTED']
const headers = ['ID', 'Seller ID', 'Amount', 'Status', 'Created At', 'Actions']

const currencyFormatter = new Intl.NumberFormat('th-TH', {
  style: 'currency',
  currency: 'THB',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

const formatTHB = (amountCents: number) => currencyFormatter.format(amountCents / 100)

const statusVariant = (status: WithdrawalStatus) => {
  if (status === 'PENDING') return 'warning'
  if (status === 'APPROVED') return 'success'
  return 'danger'
}

const AdminWithdrawalsPage = () => {
  const queryClient = useQueryClient()
  const [status, setStatus] = useState<WithdrawalStatus>('PENDING')
  const [actionTarget, setActionTarget] = useState<{
    type: 'approve' | 'reject'
    item: WithdrawalDto
  } | null>(null)

  const queryKey = useMemo(() => ['adminWithdrawals', status], [status])

  const { data, isLoading, error } = useQuery({
    queryKey,
    queryFn: () => withdrawalsApi.listWithdrawals(status),
  })

  const approveMutation = useMutation({
    mutationFn: (id: number) => withdrawalsApi.approveWithdrawal(id),
    onSuccess: () => {
      setActionTarget(null)
      void queryClient.invalidateQueries({ queryKey: ['adminWithdrawals'] })
    },
  })

  const rejectMutation = useMutation({
    mutationFn: (id: number) => withdrawalsApi.rejectWithdrawal(id),
    onSuccess: () => {
      setActionTarget(null)
      void queryClient.invalidateQueries({ queryKey: ['adminWithdrawals'] })
    },
  })

  const isActionPending = approveMutation.isPending || rejectMutation.isPending

  const errorMessage = (error as { response?: { data?: ApiError } } | null)?.response
    ?.data?.message
  const actionErrorMessage =
    ((approveMutation.error as { response?: { data?: ApiError } } | null)?.response
      ?.data?.message ??
      (rejectMutation.error as { response?: { data?: ApiError } } | null)?.response
        ?.data?.message) ||
    null

  return (
    <div className="space-y-6">
      <PageHeader
        title="Withdrawal Requests"
        subtitle="Review and process student withdrawal requests."
        action={
          <div className="flex items-center gap-2">
            <label htmlFor="withdrawal-status" className="text-sm font-medium text-slate-700">
              Status
            </label>
            <select
              id="withdrawal-status"
              className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
              value={status}
              onChange={(event) => setStatus(event.target.value as WithdrawalStatus)}
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

      {actionErrorMessage ? <Alert message={actionErrorMessage} tone="error" /> : null}

      {isLoading ? (
        <div className="flex min-h-[40vh] items-center justify-center">
          <Spinner />
        </div>
      ) : error ? (
        <Alert message={errorMessage ?? 'Failed to load withdrawals.'} tone="error" />
      ) : (data?.length ?? 0) > 0 ? (
        <Table headers={headers}>
          {data?.map((item) => (
            <tr key={item.id} className="text-sm text-slate-700">
              <td className="px-4 py-3 font-medium text-slate-900">{item.id}</td>
              <td className="px-4 py-3">{item.sellerId}</td>
              <td className="px-4 py-3">{formatTHB(item.amount)}</td>
              <td className="px-4 py-3">
                <Badge label={item.status} variant={statusVariant(item.status)} />
              </td>
              <td className="px-4 py-3">{formatDate(item.createdAt)}</td>
              <td className="px-4 py-3">
                {item.status === 'PENDING' ? (
                  <div className="flex flex-wrap gap-2">
                    <Button
                      onClick={() => setActionTarget({ type: 'approve', item })}
                      disabled={isActionPending}
                    >
                      Approve
                    </Button>
                    <Button
                      variant="danger"
                      onClick={() => setActionTarget({ type: 'reject', item })}
                      disabled={isActionPending}
                    >
                      Reject
                    </Button>
                  </div>
                ) : (
                  <span className="text-xs text-slate-500">No actions</span>
                )}
              </td>
            </tr>
          ))}
        </Table>
      ) : (
        <EmptyState
          title="No withdrawals found"
          description="No withdrawal requests found for this status."
        />
      )}

      <Modal
        open={Boolean(actionTarget)}
        title={
          actionTarget?.type === 'approve'
            ? 'Approve withdrawal request'
            : 'Reject withdrawal request'
        }
        onClose={() => setActionTarget(null)}
        footer={
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => setActionTarget(null)}>
              Cancel
            </Button>
            <Button
              variant={actionTarget?.type === 'approve' ? 'primary' : 'danger'}
              onClick={() => {
                if (!actionTarget) return
                if (actionTarget.type === 'approve') {
                  approveMutation.mutate(actionTarget.item.id)
                  return
                }
                rejectMutation.mutate(actionTarget.item.id)
              }}
              disabled={isActionPending}
            >
              {isActionPending
                ? 'Processing...'
                : actionTarget?.type === 'approve'
                  ? 'Approve'
                  : 'Reject'}
            </Button>
          </div>
        }
      >
        <p className="text-sm text-slate-700">
          {actionTarget?.type === 'approve'
            ? `Approve withdrawal #${actionTarget.item.id} for ${formatTHB(actionTarget.item.amount)}?`
            : `Reject withdrawal #${actionTarget?.item.id} for ${formatTHB(actionTarget?.item.amount ?? 0)}?`}
        </p>
      </Modal>
    </div>
  )
}

export default AdminWithdrawalsPage
