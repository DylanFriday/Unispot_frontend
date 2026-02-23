import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { paymentsApi } from '../../api/payments.api'
import type { AdminPaymentDto, ApiError, PaymentStatus } from '../../types/dto'
import PageHeader from '../../components/PageHeader'
import Table from '../../components/Table'
import Badge from '../../components/Badge'
import Button from '../../components/Button'
import Alert from '../../components/Alert'
import Spinner from '../../components/Spinner'
import EmptyState from '../../components/EmptyState'
import { formatDate } from '../../utils/format'

const statusOptions: PaymentStatus[] = ['PENDING', 'APPROVED', 'RELEASED']

const statusVariant = (status: PaymentStatus) => {
  if (status === 'PENDING') return 'warning'
  if (status === 'APPROVED') return 'success'
  return 'info'
}

const headers = [
  'Reference',
  'Amount',
  'Buyer ID',
  'Seller ID',
  'Study Sheet ID',
  'Status',
  'Created At',
  'Actions',
]

const PaymentsPage = () => {
  const queryClient = useQueryClient()
  const [status, setStatus] = useState<PaymentStatus>('PENDING')

  const queryKey = useMemo(() => ['admin', 'payments', status], [status])

  const { data, isLoading, error } = useQuery({
    queryKey,
    queryFn: () => paymentsApi.listPayments(status),
  })

  const confirmMutation = useMutation({
    mutationFn: (id: number) => paymentsApi.confirmPayment(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey })
    },
  })

  const releaseMutation = useMutation({
    mutationFn: (id: number) => paymentsApi.releasePayment(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey })
    },
  })

  const errorMessage = (error as { response?: { data?: ApiError } })?.response
    ?.data?.message

  const renderActions = (payment: AdminPaymentDto) => {
    if (payment.status === 'PENDING') {
      return (
        <Button
          onClick={() => confirmMutation.mutate(payment.id)}
          disabled={confirmMutation.isPending}
        >
          {confirmMutation.isPending ? 'Confirming...' : 'Confirm'}
        </Button>
      )
    }

    if (payment.status === 'APPROVED') {
      return (
        <Button
          onClick={() => releaseMutation.mutate(payment.id)}
          disabled={releaseMutation.isPending}
        >
          {releaseMutation.isPending ? 'Releasing...' : 'Release'}
        </Button>
      )
    }

    return <span className="text-xs text-gray-400">No actions</span>
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Payments"
        subtitle="Confirm and release study sheet payments."
        action={
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700" htmlFor="status">
              Status
            </label>
            <select
              id="status"
              className="rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900"
              value={status}
              onChange={(event) => setStatus(event.target.value as PaymentStatus)}
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
          {data.map((payment) => (
            <tr key={payment.id} className="text-sm text-gray-700">
              <td className="px-4 py-3 font-medium text-gray-900">
                {payment.referenceCode}
              </td>
              <td className="px-4 py-3">{payment.amount}</td>
              <td className="px-4 py-3">{payment.buyerId}</td>
              <td className="px-4 py-3">{payment.sellerId}</td>
              <td className="px-4 py-3">{payment.studySheetId}</td>
              <td className="px-4 py-3">
                <Badge label={payment.status} variant={statusVariant(payment.status)} />
              </td>
              <td className="px-4 py-3">{formatDate(payment.createdAt)}</td>
              <td className="px-4 py-3">{renderActions(payment)}</td>
            </tr>
          ))}
        </Table>
      ) : (
        <EmptyState
          title="No payments"
          description="No payments found for this status."
        />
      )}
    </div>
  )
}

export default PaymentsPage
