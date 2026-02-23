import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { studySheetsApi } from '../api/studySheets.api'
import { purchasesApi } from '../api/purchases.api'
import type { ApiError, StudySheetDto } from '../types/dto'
import PageHeader from '../components/PageHeader'
import Card from '../components/Card'
import Button from '../components/Button'
import Badge from '../components/Badge'
import Modal from '../components/Modal'
import Alert from '../components/Alert'
import Spinner from '../components/Spinner'
import EmptyState from '../components/EmptyState'
import Table from '../components/Table'
import { formatBahtFromCents } from '../utils/money'

const statusVariant = (status: string) => {
  if (status === 'APPROVED') return 'success'
  if (status === 'PENDING') return 'warning'
  return 'danger'
}

const purchasedAtFormatter = new Intl.DateTimeFormat('en-US', {
  dateStyle: 'medium',
  timeStyle: 'short',
})

const formatPurchasedAt = (value: string) => {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return purchasedAtFormatter.format(date)
}

const StudentStudySheetsMinePage = () => {
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState<'uploads' | 'purchased'>('uploads')
  const [selected, setSelected] = useState<StudySheetDto | null>(null)
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error'
    message: string
  } | null>(null)

  const { data, isLoading, error } = useQuery({
    queryKey: ['study-sheets', 'mine'],
    queryFn: () => studySheetsApi.mine(),
  })
  const purchasedQuery = useQuery({
    queryKey: ['purchasedStudySheets'],
    queryFn: purchasesApi.listPurchasedStudySheets,
    enabled: activeTab === 'purchased',
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => studySheetsApi.remove(id),
    onSuccess: (_, id) => {
      setSelected(null)
      setFeedback({ type: 'success', message: 'Study sheet deleted' })
      queryClient.setQueryData<StudySheetDto[]>(
        ['study-sheets', 'mine'],
        (current) => current?.filter((sheet) => sheet.id !== id) ?? current
      )
      void queryClient.invalidateQueries({ queryKey: ['study-sheets', 'mine'] })
    },
    onError: (err) => {
      const message = (err as { response?: { data?: ApiError } })?.response?.data
        ?.message
      setFeedback({
        type: 'error',
        message: message ?? 'Unable to delete this study sheet.',
      })
    },
  })

  const errorMessage = (error as { response?: { data?: ApiError } })?.response
    ?.data?.message

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Study Sheets"
        subtitle="Track and edit your uploaded study sheets."
        action={
          activeTab === 'uploads' ? (
            <Link to="/student/study-sheets/new">
              <Button>Create new</Button>
            </Link>
          ) : undefined
        }
      />
      <Card className="p-2">
        <div className="flex w-full flex-wrap gap-2">
          <Button
            variant={activeTab === 'uploads' ? 'primary' : 'secondary'}
            onClick={() => setActiveTab('uploads')}
          >
            My Uploads
          </Button>
          <Button
            variant={activeTab === 'purchased' ? 'primary' : 'secondary'}
            onClick={() => setActiveTab('purchased')}
          >
            Purchased
          </Button>
        </div>
      </Card>
      {feedback ? (
        <Alert
          message={feedback.message}
          tone={feedback.type === 'success' ? 'info' : 'error'}
        />
      ) : null}

      {activeTab === 'uploads' ? (
        isLoading ? (
          <div className="flex min-h-[40vh] items-center justify-center">
            <Spinner />
          </div>
        ) : errorMessage ? (
          <Alert message={errorMessage} tone="error" />
        ) : data && data.length > 0 ? (
          <div className="space-y-4">
            {data.map((sheet) => (
              <Card key={sheet.id} className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {sheet.title}
                    </h3>
                    <p className="text-sm text-gray-600">{sheet.description}</p>
                  </div>
                  <Badge label={sheet.status} variant={statusVariant(sheet.status)} />
                </div>
                <div className="text-sm text-gray-600">
                  <p>
                    Course: {sheet.courseCode ?? sheet.courseId ?? '-'}
                  </p>
                  <p>
                    Price:{' '}
                    {sheet.price == null
                      ? '-'
                      : formatBahtFromCents(sheet.price)}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Link to={`/student/study-sheets/${sheet.id}/edit`}>
                    <Button variant="secondary">Edit</Button>
                  </Link>
                  {sheet.status === 'PENDING' ? (
                    <Button variant="danger" onClick={() => setSelected(sheet)}>
                      Delete
                    </Button>
                  ) : (
                    <span className="inline-flex items-center rounded-lg px-1 text-xs text-slate-600">
                      Only pending study sheets can be deleted
                    </span>
                  )}
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No study sheets yet"
            description="Create your first study sheet to get started."
            action={
              <Link to="/student/study-sheets/new">
                <Button>Create study sheet</Button>
              </Link>
            }
          />
        )
      ) : (
        <div className="space-y-4">
          {purchasedQuery.isLoading ? (
            <div className="flex min-h-[40vh] items-center justify-center">
              <Spinner />
            </div>
          ) : purchasedQuery.isError ? (
            <Card className="space-y-3">
              <Alert
                message={
                  (purchasedQuery.error as { response?: { data?: ApiError } })
                    ?.response?.data?.message ??
                  'Unable to load purchased study sheets.'
                }
                tone="error"
              />
              <Button
                variant="secondary"
                onClick={() => void purchasedQuery.refetch()}
              >
                Retry
              </Button>
            </Card>
          ) : (purchasedQuery.data?.length ?? 0) === 0 ? (
            <EmptyState
              title="No purchases yet"
              description="You haven't purchased any study sheets yet."
            />
          ) : (
            <>
              <div className="hidden md:block">
                <Table
                  headers={[
                    'Title',
                    'Course Code',
                    'Price',
                    'Purchased At',
                    'Action',
                  ]}
                >
                  {purchasedQuery.data?.map((purchase) => (
                    <tr key={purchase.purchaseId} className="text-slate-700">
                      <td className="px-4 py-3 font-medium">
                        {purchase.studySheet.title}
                      </td>
                      <td className="px-4 py-3">
                        {purchase.studySheet.courseCode}
                      </td>
                      <td className="px-4 py-3">
                        {(purchase.studySheet.priceCents / 100).toFixed(2)}
                      </td>
                      <td className="px-4 py-3">
                        {formatPurchasedAt(purchase.purchasedAt)}
                      </td>
                      <td className="px-4 py-3">
                        <Button
                          variant="secondary"
                          onClick={() =>
                            window.open(purchase.studySheet.fileUrl, '_blank')
                          }
                        >
                          Open
                        </Button>
                      </td>
                    </tr>
                  ))}
                </Table>
              </div>
              <div className="space-y-3 md:hidden">
                {purchasedQuery.data?.map((purchase) => (
                  <Card key={purchase.purchaseId} className="space-y-2 p-4">
                    <h3 className="text-base font-semibold text-slate-900">
                      {purchase.studySheet.title}
                    </h3>
                    <p className="text-sm text-slate-600">
                      Course: {purchase.studySheet.courseCode}
                    </p>
                    <p className="text-sm text-slate-600">
                      Price: {(purchase.studySheet.priceCents / 100).toFixed(2)}
                    </p>
                    <p className="text-sm text-slate-600">
                      Purchased: {formatPurchasedAt(purchase.purchasedAt)}
                    </p>
                    <Button
                      variant="secondary"
                      onClick={() =>
                        window.open(purchase.studySheet.fileUrl, '_blank')
                      }
                    >
                      Open
                    </Button>
                  </Card>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      <Modal
        open={Boolean(selected)}
        title="Delete study sheet"
        onClose={() => setSelected(null)}
        footer={
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => setSelected(null)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={() => selected && deleteMutation.mutate(selected.id)}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        }
      >
        Are you sure you want to delete this study sheet? This action cannot be undone.
      </Modal>
    </div>
  )
}

export default StudentStudySheetsMinePage
