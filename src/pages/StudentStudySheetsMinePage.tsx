import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { studySheetsApi } from '../api/studySheets.api'
import type { ApiError, StudySheetDto } from '../types/dto'
import PageHeader from '../components/PageHeader'
import Card from '../components/Card'
import Button from '../components/Button'
import Badge from '../components/Badge'
import Modal from '../components/Modal'
import Alert from '../components/Alert'
import Spinner from '../components/Spinner'
import EmptyState from '../components/EmptyState'
import { formatBahtFromCents } from '../utils/money'

const statusVariant = (status: string) => {
  if (status === 'APPROVED') return 'success'
  if (status === 'PENDING') return 'warning'
  return 'danger'
}

const StudentStudySheetsMinePage = () => {
  const queryClient = useQueryClient()
  const [selected, setSelected] = useState<StudySheetDto | null>(null)

  const { data, isLoading, error } = useQuery({
    queryKey: ['study-sheets', 'mine'],
    queryFn: () => studySheetsApi.mine(),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => studySheetsApi.remove(id),
    onSuccess: () => {
      setSelected(null)
      void queryClient.invalidateQueries({ queryKey: ['study-sheets', 'mine'] })
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
          <Link to="/student/study-sheets/new">
            <Button>Create new</Button>
          </Link>
        }
      />

      {isLoading ? (
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
                <p>Course ID: {sheet.courseId}</p>
                <p>Price: {formatBahtFromCents(sheet.priceCents)}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link to={`/student/study-sheets/${sheet.id}/edit`}>
                  <Button variant="secondary">Edit</Button>
                </Link>
                <Button
                  variant="danger"
                  onClick={() => setSelected(sheet)}
                >
                  Delete
                </Button>
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
