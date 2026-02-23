import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { dashboardApi } from '../../api/dashboard.api'
import { withdrawalsApi } from '../../api/withdrawals.api'
import type { ApiError, WithdrawalStatus } from '../../types/dto'
import PageHeader from '../../components/PageHeader'
import Card from '../../components/Card'
import Button from '../../components/Button'
import Spinner from '../../components/Spinner'
import Alert from '../../components/Alert'
import StatCard from '../../components/ui/StatCard'
import Input from '../../components/Input'
import Table from '../../components/Table'
import Badge from '../../components/Badge'
import EmptyState from '../../components/EmptyState'
import { formatDate } from '../../utils/format'

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

const tableHeaders = ['ID', 'Amount', 'Status', 'Created At', 'Reviewed At']

const WalletPage = () => {
  const queryClient = useQueryClient()
  const [amountTHB, setAmountTHB] = useState('')
  const [formMessage, setFormMessage] = useState<{
    tone: 'info' | 'error'
    message: string
  } | null>(null)

  const {
    data: summary,
    isLoading: isSummaryLoading,
    error: summaryError,
    refetch: refetchSummary,
  } = useQuery({
    queryKey: ['studentDashboardSummary'],
    queryFn: dashboardApi.getStudentSummary,
  })
  const {
    data: withdrawals,
    isLoading: isWithdrawalsLoading,
    error: withdrawalsError,
    refetch: refetchWithdrawals,
  } = useQuery({
    queryKey: ['myWithdrawals'],
    queryFn: withdrawalsApi.listMyWithdrawals,
  })

  const amountCents = useMemo(() => Math.round(Number(amountTHB || 0) * 100), [amountTHB])
  const walletBalance = summary?.walletBalance ?? 0

  const amountError = useMemo(() => {
    if (amountTHB.trim() === '') return undefined
    if (!Number.isFinite(Number(amountTHB))) return 'Please enter a valid amount.'
    if (amountCents <= 0) return 'Amount must be greater than 0.'
    if (amountCents > walletBalance) return 'Amount cannot exceed your wallet balance.'
    return undefined
  }, [amountCents, amountTHB, walletBalance])

  const createWithdrawalMutation = useMutation({
    mutationFn: (payload: { amountCents: number }) =>
      withdrawalsApi.createWithdrawal(payload),
    onSuccess: () => {
      setAmountTHB('')
      setFormMessage({
        tone: 'info',
        message: 'Withdrawal request submitted successfully.',
      })
      void queryClient.invalidateQueries({
        queryKey: ['studentDashboardSummary'],
      })
      void queryClient.invalidateQueries({ queryKey: ['myWithdrawals'] })
    },
    onError: (error) => {
      const message = (error as { response?: { data?: ApiError } })?.response?.data
        ?.message
      setFormMessage({
        tone: 'error',
        message: message ?? 'Failed to submit withdrawal request.',
      })
    },
  })

  const summaryErrorMessage = (summaryError as { response?: { data?: ApiError } } | null)?.response
    ?.data?.message
  const withdrawalsErrorMessage = (withdrawalsError as {
    response?: { data?: ApiError }
  } | null)?.response?.data?.message

  const handleSubmit = () => {
    setFormMessage(null)
    if (!amountTHB.trim()) {
      setFormMessage({ tone: 'error', message: 'Please enter an amount.' })
      return
    }
    if (amountError) {
      setFormMessage({ tone: 'error', message: amountError })
      return
    }
    createWithdrawalMutation.mutate({ amountCents })
  }

  return (
    <div className="space-y-8">
      <PageHeader title="Wallet" subtitle="Track your wallet balance and withdrawal requests." />

      {isSummaryLoading ? (
        <div className="flex min-h-[40vh] items-center justify-center">
          <Spinner />
        </div>
      ) : summaryError ? (
        <div className="space-y-3">
          <Alert
            message={summaryErrorMessage ?? 'Failed to load wallet data. Please try again.'}
            tone="error"
          />
          <Button variant="secondary" onClick={() => void refetchSummary()}>
            Retry
          </Button>
        </div>
      ) : (
        <>
          <section className="grid gap-4 md:grid-cols-3">
            <StatCard
              title="Wallet Balance"
              value={formatTHB(summary?.walletBalance ?? 0)}
              tone="primary"
            />
            <StatCard
              title="Pending Payout"
              value={formatTHB(summary?.mySales?.pendingPayoutCents ?? 0)}
              tone="warning"
            />
            <StatCard
              title="Released Payout"
              value={formatTHB(summary?.mySales?.releasedPayoutCents ?? 0)}
              tone="success"
            />
          </section>

          <section>
            <Card className="space-y-4">
              <h2 className="text-lg font-semibold text-slate-900">
                Request Withdrawal
              </h2>
              <Input
                label="Amount (THB)"
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={amountTHB}
                onChange={(event) => setAmountTHB(event.target.value)}
                error={amountError}
              />
              <p className="text-xs text-slate-600">
                Available balance: {formatTHB(walletBalance)}
              </p>
              {formMessage ? (
                <Alert message={formMessage.message} tone={formMessage.tone} />
              ) : null}
              <Button
                onClick={handleSubmit}
                disabled={createWithdrawalMutation.isPending}
              >
                {createWithdrawalMutation.isPending ? 'Submitting...' : 'Submit Request'}
              </Button>
            </Card>
          </section>

          <section className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Withdraw History</h2>
              <p className="text-sm text-slate-600">
                Review your previous withdrawal requests.
              </p>
            </div>
            {isWithdrawalsLoading ? (
              <div className="flex min-h-[20vh] items-center justify-center">
                <Spinner />
              </div>
            ) : withdrawalsError ? (
              <div className="space-y-3">
                <Alert
                  message={
                    withdrawalsErrorMessage ??
                    'Failed to load withdrawal history. Please try again.'
                  }
                  tone="error"
                />
                <Button
                  variant="secondary"
                  onClick={() => void refetchWithdrawals()}
                >
                  Retry
                </Button>
              </div>
            ) : (withdrawals?.length ?? 0) > 0 ? (
              <Table headers={tableHeaders}>
                {withdrawals?.map((item) => (
                  <tr key={item.id} className="text-sm text-slate-700">
                    <td className="px-4 py-3 font-medium text-slate-900">{item.id}</td>
                    <td className="px-4 py-3">{formatTHB(item.amount)}</td>
                    <td className="px-4 py-3">
                      <Badge label={item.status} variant={statusVariant(item.status)} />
                    </td>
                    <td className="px-4 py-3">{formatDate(item.createdAt)}</td>
                    <td className="px-4 py-3">
                      {item.reviewedAt ? formatDate(item.reviewedAt) : '-'}
                    </td>
                  </tr>
                ))}
              </Table>
            ) : (
              <EmptyState
                title="No withdrawal requests"
                description="You haven't made any withdrawal requests yet."
              />
            )}
          </section>
        </>
      )}
    </div>
  )
}

export default WalletPage
