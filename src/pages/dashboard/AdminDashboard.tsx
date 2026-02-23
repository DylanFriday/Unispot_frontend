import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { useAuth } from '../../auth/useAuth'
import { moderationApi } from '../../api/moderation.api'
import { leaseModerationApi } from '../../api/leaseModeration.api'
import { reviewModerationApi } from '../../api/reviewModeration.api'
import { teacherReviewModerationApi } from '../../api/teacherReviewModeration.api'
import { paymentsApi } from '../../api/payments.api'
import { studySheetsApi } from '../../api/studySheets.api'
import type { AdminPaymentDto, ApiError, TeacherReviewDto } from '../../types/dto'
import PageHeader from '../../components/PageHeader'
import Card from '../../components/Card'
import Button from '../../components/Button'
import Alert from '../../components/Alert'
import ChartSkeleton from '../../components/charts/ChartSkeleton'
import StatCard from '../../components/ui/StatCard'

const currencyFormatter = new Intl.NumberFormat('th-TH', {
  style: 'currency',
  currency: 'THB',
  minimumFractionDigits: 2,
})

const numberFormatter = new Intl.NumberFormat('en-US')

const monthFormatter = new Intl.DateTimeFormat('en-US', { month: 'short', year: '2-digit' })

const dateTimeFormatter = new Intl.DateTimeFormat('en-US', {
  dateStyle: 'medium',
  timeStyle: 'short',
})

const formatDateTime = (value: string) => {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return dateTimeFormatter.format(date)
}

const collectAdminPayments = (...groups: (AdminPaymentDto[] | undefined)[]) =>
  groups
    .flatMap((group) => group ?? [])
    .reduce<Map<number, AdminPaymentDto>>((map, item) => {
      map.set(item.id, item)
      return map
    }, new Map<number, AdminPaymentDto>())

const AdminDashboard = () => {
  const { me } = useAuth()
  const isAdmin = me?.role === 'ADMIN'

  const pendingStudySheetsQuery = useQuery({
    queryKey: ['dashboard', 'admin', 'moderation', 'studySheets', 'pending'],
    queryFn: moderationApi.listPendingStudySheets,
  })

  const pendingLeaseListingsQuery = useQuery({
    queryKey: ['dashboard', 'admin', 'moderation', 'leaseListings', 'pending'],
    queryFn: () => leaseModerationApi.listLeaseListings('PENDING'),
  })

  const reportedReviewsQuery = useQuery({
    queryKey: ['dashboard', 'admin', 'moderation', 'reviews', 'under-review'],
    queryFn: () => reviewModerationApi.list('UNDER_REVIEW'),
  })

  const teacherReviewsQuery = useQuery({
    queryKey: ['dashboard', 'admin', 'moderation', 'teacherReviews', 'under-review'],
    queryFn: async () => {
      try {
        return await teacherReviewModerationApi.list('UNDER_REVIEW')
      } catch {
        return [] as TeacherReviewDto[]
      }
    },
  })

  const pendingPaymentsQuery = useQuery({
    queryKey: ['dashboard', 'admin', 'payments', 'pending'],
    queryFn: () => paymentsApi.listPayments('PENDING'),
    enabled: isAdmin,
  })

  const approvedPaymentsQuery = useQuery({
    queryKey: ['dashboard', 'admin', 'payments', 'approved'],
    queryFn: () => paymentsApi.listPayments('APPROVED'),
    enabled: isAdmin,
  })

  const releasedPaymentsQuery = useQuery({
    queryKey: ['dashboard', 'admin', 'payments', 'released'],
    queryFn: () => paymentsApi.listPayments('RELEASED'),
    enabled: isAdmin,
  })

  const publicStudySheetsQuery = useQuery({
    queryKey: ['dashboard', 'admin', 'studySheets', 'public'],
    queryFn: async () => {
      try {
        return await studySheetsApi.list()
      } catch {
        return []
      }
    },
  })

  const isLoading =
    pendingStudySheetsQuery.isLoading ||
    pendingLeaseListingsQuery.isLoading ||
    reportedReviewsQuery.isLoading ||
    (isAdmin &&
      (pendingPaymentsQuery.isLoading ||
        approvedPaymentsQuery.isLoading ||
        releasedPaymentsQuery.isLoading))

  const hasError =
    pendingStudySheetsQuery.isError ||
    pendingLeaseListingsQuery.isError ||
    reportedReviewsQuery.isError ||
    (isAdmin &&
      (pendingPaymentsQuery.isError ||
        approvedPaymentsQuery.isError ||
        releasedPaymentsQuery.isError))

  const errorMessage =
    ((pendingStudySheetsQuery.error as { response?: { data?: ApiError } } | null)
      ?.response?.data?.message ??
      (pendingLeaseListingsQuery.error as { response?: { data?: ApiError } } | null)
        ?.response?.data?.message ??
      (reportedReviewsQuery.error as { response?: { data?: ApiError } } | null)
        ?.response?.data?.message ??
      (isAdmin
        ? ((pendingPaymentsQuery.error as { response?: { data?: ApiError } } | null)
            ?.response?.data?.message ??
          (approvedPaymentsQuery.error as { response?: { data?: ApiError } } | null)
            ?.response?.data?.message ??
          (releasedPaymentsQuery.error as { response?: { data?: ApiError } } | null)
            ?.response?.data?.message)
        : null) ??
      'Failed to load dashboard data.') as string

  const allPayments = useMemo(
    () => (isAdmin
      ?
      Array.from(
        collectAdminPayments(
          pendingPaymentsQuery.data,
          approvedPaymentsQuery.data,
          releasedPaymentsQuery.data
        ).values()
      )
      : []),
    [approvedPaymentsQuery.data, isAdmin, pendingPaymentsQuery.data, releasedPaymentsQuery.data]
  )

  const totalRevenueTHB = useMemo(
    () => (isAdmin ? (releasedPaymentsQuery.data ?? []).reduce((sum, item) => sum + item.amount / 100, 0) : 0),
    [isAdmin, releasedPaymentsQuery.data]
  )

  const pendingModerations = (pendingStudySheetsQuery.data?.length ?? 0) +
    (pendingLeaseListingsQuery.data?.length ?? 0) +
    (reportedReviewsQuery.data?.length ?? 0) +
    (teacherReviewsQuery.data?.length ?? 0)

  const totalStudySheets = useMemo(() => {
    const ids = new Set<number>()
    for (const item of publicStudySheetsQuery.data ?? []) ids.add(item.id)
    for (const item of pendingStudySheetsQuery.data ?? []) ids.add(item.id)
    return ids.size
  }, [pendingStudySheetsQuery.data, publicStudySheetsQuery.data])

  const totalUsers = useMemo(() => {
    const ids = new Set<number>()
    for (const payment of allPayments) {
      ids.add(payment.buyerId)
      ids.add(payment.sellerId)
    }
    for (const item of publicStudySheetsQuery.data ?? []) ids.add(item.ownerId)
    for (const item of pendingStudySheetsQuery.data ?? []) ids.add(item.ownerId)
    for (const item of pendingLeaseListingsQuery.data ?? []) ids.add(item.ownerId)
    for (const item of reportedReviewsQuery.data ?? []) ids.add(item.studentId)
    for (const item of teacherReviewsQuery.data ?? []) ids.add(item.studentId)
    return ids.size
  }, [
    allPayments,
    pendingLeaseListingsQuery.data,
    pendingStudySheetsQuery.data,
    publicStudySheetsQuery.data,
    reportedReviewsQuery.data,
    teacherReviewsQuery.data,
  ])

  const monthlyRevenueData = useMemo(() => {
    const bucket = new Map<string, number>()
    for (const payment of releasedPaymentsQuery.data ?? []) {
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
  }, [releasedPaymentsQuery.data])

  const platformFeed = useMemo(
    () =>
      [
        ...(pendingStudySheetsQuery.data ?? []).map((item) => ({
          id: `sheet-${item.id}`,
          title: `New study sheet uploaded: ${item.title}`,
          createdAt: item.createdAt,
        })),
        ...(reportedReviewsQuery.data ?? []).map((item) => ({
          id: `review-${item.id}`,
          title: `Course review reported (#${item.id})`,
          createdAt: item.createdAt,
        })),
        ...(teacherReviewsQuery.data ?? []).map((item) => ({
          id: `teacher-review-${item.id}`,
          title: `Teacher review reported (#${item.id})`,
          createdAt: item.createdAt,
        })),
      ]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 8),
    [
      pendingStudySheetsQuery.data,
      reportedReviewsQuery.data,
      teacherReviewsQuery.data,
    ]
  )

  return (
    <div className="space-y-8">
      <PageHeader
        title={isAdmin ? 'Admin Dashboard' : 'Staff Dashboard'}
        subtitle={
          isAdmin
            ? 'Professional overview of platform health, moderation, and revenue.'
            : 'Professional overview of platform health and moderation.'
        }
      />

      {isLoading ? (
        <div className="space-y-8">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <ChartSkeleton key={index} heightClassName="h-36" />
            ))}
          </div>
          <ChartSkeleton />
        </div>
      ) : hasError ? (
        <div className="space-y-3">
          <Alert message={errorMessage} tone="error" />
          <Button
            variant="secondary"
            onClick={() => {
              void pendingStudySheetsQuery.refetch()
              void pendingLeaseListingsQuery.refetch()
              void reportedReviewsQuery.refetch()
              void teacherReviewsQuery.refetch()
              if (isAdmin) {
                void pendingPaymentsQuery.refetch()
                void approvedPaymentsQuery.refetch()
                void releasedPaymentsQuery.refetch()
              }
              void publicStudySheetsQuery.refetch()
            }}
          >
            Retry
          </Button>
        </div>
      ) : (
        <div className="space-y-8 transition-opacity duration-300">
          <section className={`grid gap-4 md:grid-cols-2 ${isAdmin ? 'xl:grid-cols-4' : 'xl:grid-cols-3'}`}>
            <StatCard title="Total Users" value={numberFormatter.format(totalUsers)} tone="primary" />
            <StatCard title="Total Study Sheets" value={numberFormatter.format(totalStudySheets)} tone="success" />
            {isAdmin ? (
              <StatCard title="Total Revenue" value={currencyFormatter.format(totalRevenueTHB)} tone="warning" />
            ) : null}
            <StatCard title="Pending Moderations" value={numberFormatter.format(pendingModerations)} tone="danger" />
          </section>

          {isAdmin ? (
            <section>
              <Card className="space-y-4 transition duration-200 hover:shadow-md">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">Platform Revenue (Monthly)</h2>
                  <p className="text-sm text-slate-600">Released payments grouped by month.</p>
                </div>
                {releasedPaymentsQuery.isLoading ? (
                  <ChartSkeleton />
                ) : monthlyRevenueData.length > 0 ? (
                  <div className="h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={monthlyRevenueData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" />
                        <XAxis dataKey="month" tick={{ fill: '#334155', fontSize: 12 }} />
                        <YAxis tick={{ fill: '#334155', fontSize: 12 }} />
                        <Tooltip formatter={(value: number | undefined) => currencyFormatter.format(value ?? 0)} />
                        <Bar dataKey="revenueTHB" fill="#16a34a" radius={[8, 8, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <p className="text-sm text-slate-600">No released revenue yet.</p>
                )}
              </Card>
            </section>
          ) : (
            <section>
              <Card className="space-y-2">
                <h2 className="text-lg font-semibold text-slate-900">Payments</h2>
                <p className="text-sm text-slate-600">Payments are available for Admin only.</p>
              </Card>
            </section>
          )}

          <section className="space-y-4">
            <h2 className="text-lg font-semibold text-slate-900">Moderation Overview</h2>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <Link to="/moderation/study-sheets">
                <Card className="h-full transition duration-200 hover:-translate-y-0.5 hover:shadow-md">
                  <p className="text-sm text-slate-600">Pending Study Sheets</p>
                  <p className="mt-2 text-3xl font-bold text-blue-700">{pendingStudySheetsQuery.data?.length ?? 0}</p>
                </Card>
              </Link>
              <Link to="/moderation/reviews">
                <Card className="h-full transition duration-200 hover:-translate-y-0.5 hover:shadow-md">
                  <p className="text-sm text-slate-600">Reported Course Reviews</p>
                  <p className="mt-2 text-3xl font-bold text-rose-700">{reportedReviewsQuery.data?.length ?? 0}</p>
                </Card>
              </Link>
              <Link to="/moderation/teacher-reviews">
                <Card className="h-full transition duration-200 hover:-translate-y-0.5 hover:shadow-md">
                  <p className="text-sm text-slate-600">Reported Teacher Reviews</p>
                  <p className="mt-2 text-3xl font-bold text-amber-700">{teacherReviewsQuery.data?.length ?? 0}</p>
                </Card>
              </Link>
              <Link to="/moderation/lease-listings">
                <Card className="h-full transition duration-200 hover:-translate-y-0.5 hover:shadow-md">
                  <p className="text-sm text-slate-600">Pending Lease Listings</p>
                  <p className="mt-2 text-3xl font-bold text-emerald-700">{pendingLeaseListingsQuery.data?.length ?? 0}</p>
                </Card>
              </Link>
            </div>
          </section>

          <section>
            <Card className="space-y-4 transition duration-200 hover:shadow-md">
              <h2 className="text-lg font-semibold text-slate-900">Platform Activity Feed</h2>
              {platformFeed.length > 0 ? (
                <ul className="space-y-2">
                  {platformFeed.map((item) => (
                    <li key={item.id} className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm">
                      <p className="font-medium text-slate-900">{item.title}</p>
                      <p className="text-xs text-slate-500">{formatDateTime(item.createdAt)}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-slate-600">No platform activity right now.</p>
              )}
            </Card>
          </section>
        </div>
      )}
    </div>
  )
}

export default AdminDashboard
