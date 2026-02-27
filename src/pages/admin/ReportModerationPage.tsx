import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { reportsApi } from '../../api/reports.api'
import type { ApiError, ReportDto, ReportStatus } from '../../types/dto'
import PageHeader from '../../components/PageHeader'
import Table from '../../components/Table'
import Badge from '../../components/Badge'
import Button from '../../components/Button'
import Spinner from '../../components/Spinner'
import Alert from '../../components/Alert'
import EmptyState from '../../components/EmptyState'
import { formatDate } from '../../utils/format'

const headers = [
  'Status',
  'Type',
  'Reason',
  'Reporter',
  'Target Preview',
  'Created At',
  'Actions',
]

const statusOptions: ReportStatus[] = ['PENDING', 'RESOLVED', 'REJECTED']

const statusVariant = (status: ReportStatus) => {
  if (status === 'PENDING') return 'warning'
  if (status === 'RESOLVED') return 'success'
  return 'danger'
}

const ReportModerationPage = () => {
  const queryClient = useQueryClient()
  const [status, setStatus] = useState<ReportStatus>('PENDING')

  const queryKey = useMemo(() => ['admin', 'reports', status], [status])

  const { data = [], isLoading, error } = useQuery({
    queryKey,
    queryFn: () => reportsApi.listReports(status),
  })

  const rejectMutation = useMutation({
    mutationFn: (id: string) => reportsApi.rejectReport(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey })
    },
  })

  const removeTargetMutation = useMutation({
    mutationFn: (id: string) => reportsApi.removeTarget(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey })
    },
  })

  const isRowPending = (id: string) =>
    (rejectMutation.isPending && rejectMutation.variables === id) ||
    (removeTargetMutation.isPending && removeTargetMutation.variables === id)

  const getTargetPreview = (report: ReportDto) => {
    const text = report.targetPreview?.text?.trim()
    const rating = report.targetPreview?.rating
    const pieces: string[] = []
    if (text) {
      pieces.push(text.length > 100 ? `${text.slice(0, 100)}...` : text)
    }
    if (typeof rating === 'number') {
      pieces.push(`Rating: ${rating}`)
    }
    return pieces.length > 0 ? pieces.join(' | ') : '-'
  }

  const getReporter = (report: ReportDto) =>
    report.reporter.email || report.reporter.name || report.reporter._id

  const errorMessage = (error as { response?: { data?: ApiError } } | null)?.response
    ?.data?.message
  const actionErrorMessage =
    ((rejectMutation.error as { response?: { data?: ApiError } } | null)?.response
      ?.data?.message ??
      (removeTargetMutation.error as { response?: { data?: ApiError } } | null)?.response
        ?.data?.message) ||
    null

  return (
    <div className="space-y-6">
      <PageHeader
        title="Report Moderation"
        subtitle="Review user reports and resolve moderation actions."
        action={
          <div className="flex items-center gap-2">
            <label htmlFor="report-status" className="text-sm font-medium text-slate-700">
              Status
            </label>
            <select
              id="report-status"
              className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
              value={status}
              onChange={(event) => setStatus(event.target.value as ReportStatus)}
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
        <Alert
          message={errorMessage ?? (error as Error | null)?.message ?? 'Failed to load reports.'}
          tone="error"
        />
      ) : data.length > 0 ? (
        <Table headers={headers}>
          {data.map((report) => (
            <tr key={report._id} className="text-sm text-slate-700">
              <td className="px-4 py-3">
                <Badge label={report.status} variant={statusVariant(report.status)} />
              </td>
              <td className="px-4 py-3">{report.targetType}</td>
              <td className="px-4 py-3">{report.reason?.trim() || '-'}</td>
              <td className="px-4 py-3">{getReporter(report)}</td>
              <td className="px-4 py-3">{getTargetPreview(report)}</td>
              <td className="px-4 py-3">{formatDate(report.createdAt)}</td>
              <td className="px-4 py-3">
                {report.status === 'PENDING' ? (
                  <div className="flex flex-wrap gap-2">
                    <Button
                      onClick={() => rejectMutation.mutate(report._id)}
                      disabled={isRowPending(report._id)}
                    >
                      {rejectMutation.isPending && rejectMutation.variables === report._id
                        ? 'Rejecting...'
                        : 'Reject Report'}
                    </Button>
                    <Button
                      variant="danger"
                      onClick={() => removeTargetMutation.mutate(report._id)}
                      disabled={isRowPending(report._id)}
                    >
                      {removeTargetMutation.isPending &&
                      removeTargetMutation.variables === report._id
                        ? 'Removing...'
                        : 'Remove Review'}
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
        <EmptyState title="No reports" description="No reports found for this status." />
      )}
    </div>
  )
}

export default ReportModerationPage
