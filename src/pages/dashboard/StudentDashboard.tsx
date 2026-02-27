import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { walletApi } from '../../api/wallet.api'
import { dashboardApi } from '../../api/dashboard.api'
import { studySheetsApi } from '../../api/studySheets.api'
import { paymentsApi } from '../../api/payments.api'
import { teacherReviewsApi } from '../../api/teacherReviews.api'
import type {
  ApiError,
  PaymentDto,
  ReviewDto,
  StudentDashboardSummaryDto,
  StudySheetDto,
  TeacherReviewDto,
} from '../../types/dto'
import PageHeader from '../../components/PageHeader'
import Card from '../../components/Card'
import Button from '../../components/Button'
import Spinner from '../../components/Spinner'
import Alert from '../../components/Alert'
import ChartSkeleton from '../../components/charts/ChartSkeleton'
import StatCard from '../../components/ui/StatCard'

interface ActivityItem {
  id: string
  title: string
  createdAt: string
}

const currencyFormatter = new Intl.NumberFormat('th-TH', {
  style: 'currency',
  currency: 'THB',
  minimumFractionDigits: 2,
})

const compactNumberFormatter = new Intl.NumberFormat('en-US', {
  notation: 'compact',
  maximumFractionDigits: 1,
})

const dateTimeFormatter = new Intl.DateTimeFormat('en-US', {
  dateStyle: 'medium',
  timeStyle: 'short',
})

const monthFormatter = new Intl.DateTimeFormat('en-US', { month: 'short', year: '2-digit' })

const formatTHBFromCents = (value: number) => currencyFormatter.format((value ?? 0) / 100)

const formatDateTime = (value: string) => {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return dateTimeFormatter.format(date)
}

const toNumber = (value: unknown) => {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string') {
    const parsed = Number(value)
    if (Number.isFinite(parsed)) return parsed
  }
  return undefined
}

const toString = (value: unknown) => (typeof value === 'string' ? value : undefined)

const normalizePayment = (value: unknown): PaymentDto | null => {
  if (!value || typeof value !== 'object') return null
  const row = value as Record<string, unknown>

  const id = toNumber(row.id)
  const amount =
    toNumber(row.amount) ??
    toNumber(row.amountCents) ??
    toNumber(row.amount_cents)
  const status = toString(row.status)
  const createdAt =
    toString(row.createdAt) ??
    toString(row.created_at) ??
    toString(row.updatedAt) ??
    toString(row.updated_at)

  if (!id || !amount || !status || !createdAt) return null

  return {
    id,
    amount,
    status: status as PaymentDto['status'],
    createdAt,
    buyerId: toNumber(row.buyerId) ?? toNumber(row.buyer_id),
    sellerId: toNumber(row.sellerId) ?? toNumber(row.seller_id),
    referenceCode: toString(row.referenceCode) ?? toString(row.reference_code),
  }
}

const getSummarySalesCount = (summary: StudentDashboardSummaryDto | undefined) => {
  const sales = summary?.mySales as Record<string, unknown> | undefined
  if (!sales) return undefined
  return (
    toNumber(sales.totalSalesCount) ??
    toNumber(sales.total_sales_count) ??
    toNumber(sales.totalSales) ??
    toNumber(sales.total_sales) ??
    toNumber(sales.totalTransactions) ??
    toNumber(sales.total_transactions) ??
    toNumber(sales.releasedTransactions) ??
    toNumber(sales.released_transactions)
  )
}

const getSummaryRecentSales = (summary: StudentDashboardSummaryDto | undefined) => {
  const sales = summary?.mySales as Record<string, unknown> | undefined
  if (!sales) return []

  const candidates = [
    sales.recentSales,
    sales.recent_sales,
    sales.sales,
    sales.transactions,
    sales.recentTransactions,
    sales.recent_transactions,
    sales.payments,
  ]

  for (const candidate of candidates) {
    if (!Array.isArray(candidate)) continue
    const normalized = candidate.map(normalizePayment).filter((item): item is PaymentDto => Boolean(item))
    if (normalized.length > 0) return normalized
  }

  return []
}

const WalletIcon = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M4 7.5A2.5 2.5 0 0 1 6.5 5H18a2 2 0 0 1 2 2v1H7a2 2 0 1 0 0 4h13v1a2 2 0 0 1-2 2H6.5A2.5 2.5 0 0 1 4 12.5z" />
    <circle cx="15.5" cy="10" r="1" />
  </svg>
)

const GrowthIcon = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M4 16l6-6 4 4 6-7" />
    <path d="M14 7h6v6" />
  </svg>
)

const PendingIcon = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
    <circle cx="12" cy="12" r="8" />
    <path d="M12 8v5l3 2" />
  </svg>
)

const SalesIcon = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M6 6h15l-1.5 8.5H8z" />
    <path d="M6 6l-1-2.5H2.5" />
    <circle cx="9.5" cy="18.5" r="1.5" />
    <circle cx="17.5" cy="18.5" r="1.5" />
  </svg>
)

const StudentDashboard = () => {
  const walletQuery = useQuery({
    queryKey: ['walletSummary'],
    queryFn: walletApi.getWalletSummary,
  })

  const studentSummaryQuery = useQuery({
    queryKey: ['studentDashboardSummary'],
    queryFn: dashboardApi.getStudentSummary,
  })

  const studySheetsQuery = useQuery({
    queryKey: ['studentDashboard', 'studySheets', 'mine'],
    queryFn: studySheetsApi.mine,
  })

  const reviewsQuery = useQuery({
    queryKey: ['studentDashboard', 'reviews', 'mine'],
    queryFn: async () => [] as ReviewDto[],
  })

  const teacherReviewsMineQuery = useQuery({
    queryKey: ['studentDashboard', 'teacherReviews', 'mine'],
    queryFn: async () => {
      try {
        return await teacherReviewsApi.listMine()
      } catch {
        return [] as TeacherReviewDto[]
      }
    },
  })

  const paymentsMineQuery = useQuery({
    queryKey: ['studentDashboard', 'payments', 'mine'],
    queryFn: async () => {
      try {
        return await paymentsApi.listMine()
      } catch {
        return [] as PaymentDto[]
      }
    },
  })

  const isCoreLoading = walletQuery.isLoading || studySheetsQuery.isLoading
  const hasCoreError = walletQuery.isError || studySheetsQuery.isError

  const errorMessage =
    ((walletQuery.error as { response?: { data?: ApiError } } | null)?.response?.data
      ?.message ??
      (studySheetsQuery.error as { response?: { data?: ApiError } } | null)?.response
        ?.data?.message ??
      'Failed to load dashboard data.') as string

  const monthlyRevenue = useMemo(() => {
    const bucket = new Map<string, number>()
    for (const payment of paymentsMineQuery.data ?? []) {
      if (payment.status !== 'APPROVED' && payment.status !== 'RELEASED') continue
      const date = new Date(payment.createdAt)
      if (Number.isNaN(date.getTime())) continue
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1)
      const key = monthStart.toISOString()
      bucket.set(key, (bucket.get(key) ?? 0) + payment.amount / 100)
    }

    return [...bucket.entries()]
      .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
      .map(([key, revenueTHB]) => ({
        month: monthFormatter.format(new Date(key)),
        revenueTHB: Number(revenueTHB.toFixed(2)),
      }))
  }, [paymentsMineQuery.data])

  const revenueTrendLabel = useMemo(() => {
    if (monthlyRevenue.length < 2) return undefined
    const current = monthlyRevenue[monthlyRevenue.length - 1]?.revenueTHB ?? 0
    const previous = monthlyRevenue[monthlyRevenue.length - 2]?.revenueTHB ?? 0
    const delta = current - previous
    if (delta <= 0) return 'Trend: stable'
    const percent = previous > 0 ? (delta / previous) * 100 : 100
    return `↑ ${percent.toFixed(1)}% vs last month`
  }, [monthlyRevenue])

  const totalEarningsCents = useMemo(() => {
    const summarySales = studentSummaryQuery.data?.mySales as Record<string, unknown> | undefined
    const salesAmountFromSummary =
      toNumber(summarySales?.totalSalesAmountCents) ??
      toNumber(summarySales?.total_sales_amount_cents)
    if (typeof salesAmountFromSummary === 'number') return salesAmountFromSummary

    const payments = paymentsMineQuery.data ?? []
    const sumFromPayments = payments
      .filter((item) => item.status === 'APPROVED' || item.status === 'RELEASED')
      .reduce((sum, item) => sum + item.amount, 0)
    if (sumFromPayments > 0) return sumFromPayments
    return walletQuery.data?.totalEarned ?? 0
  }, [paymentsMineQuery.data, studentSummaryQuery.data?.mySales, walletQuery.data?.totalEarned])

  const summarySalesCount = useMemo(
    () => getSummarySalesCount(studentSummaryQuery.data),
    [studentSummaryQuery.data]
  )

  const totalSales = useMemo(() => {
    if (typeof summarySalesCount === 'number') return summarySalesCount
    return (paymentsMineQuery.data ?? []).filter(
      (item) => item.status === 'APPROVED' || item.status === 'RELEASED'
    ).length
  }, [paymentsMineQuery.data, summarySalesCount])

  const summaryRecentSales = useMemo(
    () => getSummaryRecentSales(studentSummaryQuery.data),
    [studentSummaryQuery.data]
  )

  const recentSales = useMemo(() => {
    if (summaryRecentSales.length > 0) {
      return [...summaryRecentSales]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5)
    }
    return [...(paymentsMineQuery.data ?? [])]
      .filter((item) => item.status === 'APPROVED' || item.status === 'RELEASED')
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5)
  }, [paymentsMineQuery.data, summaryRecentSales])

  const recentActions = useMemo(() => {
    const sheetActions = (studySheetsQuery.data ?? []).map((item: StudySheetDto): ActivityItem => ({
      id: `sheet-${item.id}`,
      title: `Uploaded study sheet: ${item.title}`,
      createdAt: item.createdAt,
    }))

    const reviewActions = (reviewsQuery.data ?? []).map((item: ReviewDto): ActivityItem => ({
      id: `review-${item.id}`,
      title: `Wrote course review #${item.id}`,
      createdAt: item.createdAt,
    }))

    return [...sheetActions, ...reviewActions]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5)
  }, [reviewsQuery.data, studySheetsQuery.data])

  const reviewStatsData = useMemo(() => {
    const courseReviews = reviewsQuery.data ?? []
    const avgRating =
      courseReviews.length > 0
        ? courseReviews.reduce((sum, item) => sum + item.rating, 0) / courseReviews.length
        : 0
    const totalReviews = courseReviews.length
    const totalUpvotes = (teacherReviewsMineQuery.data ?? []).reduce(
      (sum, item) => sum + (item.upvotes ?? 0),
      0
    )

    return [
      { name: 'Avg Rating', value: Number(avgRating.toFixed(2)), display: `${avgRating.toFixed(2)} / 5` },
      { name: 'Reviews', value: totalReviews, display: compactNumberFormatter.format(totalReviews) },
      { name: 'Upvotes', value: totalUpvotes, display: compactNumberFormatter.format(totalUpvotes) },
    ]
  }, [reviewsQuery.data, teacherReviewsMineQuery.data])

  return (
    <div className="space-y-8">
      <PageHeader
        title="Student Dashboard"
        subtitle="Financial and activity insights for your marketplace performance."
      />

      {isCoreLoading ? (
        <div className="flex min-h-[40vh] items-center justify-center">
          <Spinner />
        </div>
      ) : hasCoreError ? (
        <div className="space-y-3">
          <Alert message={errorMessage} tone="error" />
          <Button
            variant="secondary"
            onClick={() => {
              void walletQuery.refetch()
              void studySheetsQuery.refetch()
              void reviewsQuery.refetch()
              void paymentsMineQuery.refetch()
              void teacherReviewsMineQuery.refetch()
            }}
          >
            Retry
          </Button>
        </div>
      ) : (
        <div className="space-y-8 transition-opacity duration-300">
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <StatCard
              title="Wallet Balance"
              value={formatTHBFromCents(walletQuery.data?.walletBalance ?? 0)}
              subtext="Available"
              tone="primary"
              icon={<WalletIcon />}
            />
            <StatCard
              title="Total Earnings"
              value={formatTHBFromCents(totalEarningsCents)}
              subtext={revenueTrendLabel ?? 'Approved and released'}
              tone="success"
              icon={<GrowthIcon />}
            />
            <StatCard
              title="Pending Payout"
              value={formatTHBFromCents(walletQuery.data?.pendingPayout ?? 0)}
              subtext="Waiting for admin release"
              tone="warning"
              icon={<PendingIcon />}
            />
            <StatCard
              title="Total Sales"
              value={compactNumberFormatter.format(totalSales)}
              subtext="Released transactions"
              tone="neutral"
              icon={<SalesIcon />}
            />
          </section>

          <section>
            <Card className="space-y-4 transition duration-200 hover:shadow-md">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Revenue Over Time</h2>
                <p className="text-sm text-slate-600">Grouped monthly from payment history.</p>
              </div>
              {paymentsMineQuery.isLoading ? (
                <ChartSkeleton />
              ) : monthlyRevenue.length > 0 ? (
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={monthlyRevenue}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" />
                      <XAxis dataKey="month" tick={{ fill: '#334155', fontSize: 12 }} />
                      <YAxis tick={{ fill: '#334155', fontSize: 12 }} />
                      <Tooltip formatter={(value: number | undefined) => currencyFormatter.format(value ?? 0)} />
                      <Line
                        type="monotone"
                        dataKey="revenueTHB"
                        stroke="#2563eb"
                        strokeWidth={3}
                        dot={{ r: 3 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className="text-sm text-slate-600">No revenue history available yet.</p>
              )}
            </Card>
          </section>

          <section className="grid gap-6 xl:grid-cols-2">
            <Card className="space-y-4 transition duration-200 hover:shadow-md">
              <h2 className="text-lg font-semibold text-slate-900">Recent Sales</h2>
              {recentSales.length > 0 ? (
                <ul className="space-y-2">
                  {recentSales.map((payment) => (
                    <li
                      key={payment.id}
                      className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
                    >
                      <div>
                        <p className="font-medium text-slate-900">
                          {payment.buyerId ? `Buyer #${String(payment.buyerId).slice(-4)}` : 'Buyer ••••'}
                        </p>
                        <p className="text-xs text-slate-500">{formatDateTime(payment.createdAt)}</p>
                      </div>
                      <p className="font-semibold text-emerald-700">{formatTHBFromCents(payment.amount)}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-slate-600">No sales yet.</p>
              )}
            </Card>

            <Card className="space-y-4 transition duration-200 hover:shadow-md">
              <h2 className="text-lg font-semibold text-slate-900">Recent Actions</h2>
              {recentActions.length > 0 ? (
                <ul className="space-y-2">
                  {recentActions.map((item) => (
                    <li key={item.id} className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm">
                      <p className="font-medium text-slate-900">{item.title}</p>
                      <p className="text-xs text-slate-500">{formatDateTime(item.createdAt)}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-slate-600">No recent actions yet.</p>
              )}
            </Card>
          </section>

          <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
            <Card className="space-y-4 transition duration-200 hover:shadow-md">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Review Stats</h2>
                <p className="text-sm text-slate-600">Average rating, review volume, and upvotes.</p>
              </div>
              {reviewsQuery.isLoading || teacherReviewsMineQuery.isLoading ? (
                <ChartSkeleton heightClassName="h-56" />
              ) : (
                <div className="h-56 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={reviewStatsData} layout="vertical" margin={{ left: 12, right: 12 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis type="number" tick={{ fill: '#334155', fontSize: 12 }} />
                      <YAxis type="category" dataKey="name" tick={{ fill: '#334155', fontSize: 12 }} width={80} />
                      <Tooltip
                        formatter={(_value: number | undefined, _name, item) => [
                          String(item.payload.display),
                          item.payload.name,
                        ]}
                      />
                      <Bar dataKey="value" radius={[0, 8, 8, 0]} fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </Card>

            <Card className="space-y-4 transition duration-200 hover:shadow-md">
              <h2 className="text-lg font-semibold text-slate-900">Quick Actions</h2>
              <div className="grid gap-2">
                <Link to="/study-sheets/create">
                  <Button className="w-full">Upload Study Sheet</Button>
                </Link>
                <Link to="/study-sheets">
                  <Button variant="secondary" className="w-full">Browse Study Sheets</Button>
                </Link>
                <Link to="/courses">
                  <Button variant="secondary" className="w-full">My Reviews</Button>
                </Link>
                <Link to="/wallet">
                  <Button variant="secondary" className="w-full">Wallet</Button>
                </Link>
              </div>
            </Card>
          </section>
        </div>
      )}
    </div>
  )
}

export default StudentDashboard
