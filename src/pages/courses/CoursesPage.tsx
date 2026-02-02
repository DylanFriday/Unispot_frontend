import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { coursesApi } from '../../api/courses.api'
import type { ApiError } from '../../types/dto'
import { useAuth } from '../../auth/useAuth'
import PageHeader from '../../components/PageHeader'
import Table from '../../components/Table'
import Button from '../../components/Button'
import Alert from '../../components/Alert'
import Spinner from '../../components/Spinner'
import EmptyState from '../../components/EmptyState'
import Input from '../../components/Input'
import Modal from '../../components/Modal'

const headers = ['Code', 'Name', 'Actions']

const CoursesPage = () => {
  const { me } = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [searchValue, setSearchValue] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [courseCode, setCourseCode] = useState('')
  const [courseName, setCourseName] = useState('')
  const [courseFeedback, setCourseFeedback] = useState<{
    type: 'success' | 'error'
    message: string
  } | null>(null)

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setDebouncedSearch(searchValue.trim())
    }, 400)
    return () => window.clearTimeout(timeout)
  }, [searchValue])

  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['courses', debouncedSearch],
    queryFn: () => coursesApi.listCourses(debouncedSearch || undefined),
  })

  const createCourseMutation = useMutation({
    mutationFn: (payload: { code: string; name: string }) =>
      coursesApi.createCourse(payload),
    onSuccess: (course) => {
      setAddModalOpen(false)
      setCourseCode('')
      setCourseName('')
      setCourseFeedback(null)
      void queryClient.invalidateQueries({ queryKey: ['courses'] })
      navigate(`/courses/${course.id}/reviews`)
    },
    onError: (err) => {
      const data = (err as {
        response?: { data?: (ApiError & { course?: { id: number }; id?: number }) | undefined }
      })?.response?.data
      const existingId = data?.course?.id ?? data?.id
      if (existingId) {
        setAddModalOpen(false)
        navigate(`/courses/${existingId}/reviews`)
        return
      }
      setCourseFeedback({
        type: 'error',
        message: data?.message ?? 'Create failed',
      })
    },
  })

  const handleAddCourse = (event: React.FormEvent) => {
    event.preventDefault()
    const code = courseCode.trim().toUpperCase()
    const name = courseName.trim()
    if (!code || !name) {
      setCourseFeedback({
        type: 'error',
        message: 'Please provide both course code and name.',
      })
      return
    }
    createCourseMutation.mutate({ code, name })
  }

  const errorMessage = (error as { response?: { data?: ApiError } })?.response
    ?.data?.message

  return (
    <div className="space-y-6">
      <PageHeader
        title="Courses"
        subtitle="Browse courses and view reviews."
        action={
          me?.role === 'STUDENT' ? (
            <Button onClick={() => setAddModalOpen(true)}>Add Course</Button>
          ) : undefined
        }
      />

      {courseFeedback ? (
        <Alert
          message={courseFeedback.message}
          tone={courseFeedback.type === 'success' ? 'info' : 'error'}
        />
      ) : null}

      <Input
        label="Search courses"
        value={searchValue}
        onChange={(event) => setSearchValue(event.target.value)}
        placeholder="Search by code or name"
      />

      {isLoading ? (
        <div className="flex min-h-[40vh] items-center justify-center">
          <Spinner />
        </div>
      ) : errorMessage ? (
        <div className="space-y-3">
          <Alert message={errorMessage} tone="error" />
          <Button variant="secondary" onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      ) : data && data.length > 0 ? (
        <Table headers={headers}>
          {data.map((course) => (
            <tr key={course.id} className="text-sm text-gray-700">
              <td className="px-4 py-3 font-medium text-gray-900">
                {course.code}
              </td>
              <td className="px-4 py-3">{course.name}</td>
              <td className="px-4 py-3">
                <Link to={`/courses/${course.id}/reviews`}>
                  <Button variant="secondary">View Reviews</Button>
                </Link>
              </td>
            </tr>
          ))}
        </Table>
      ) : (
        <EmptyState
          title="No courses yet"
          description={
            debouncedSearch
              ? 'No courses match your search.'
              : 'Courses will appear here when available.'
          }
        />
      )}

      <Modal
        open={addModalOpen}
        title="Add course"
        onClose={() => setAddModalOpen(false)}
        footer={
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => setAddModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                const code = courseCode.trim().toUpperCase()
                const name = courseName.trim()
                if (!code || !name) {
                  setCourseFeedback({
                    type: 'error',
                    message: 'Please provide both course code and name.',
                  })
                  return
                }
                createCourseMutation.mutate({ code, name })
              }}
              disabled={createCourseMutation.isPending}
            >
              {createCourseMutation.isPending ? 'Creating...' : 'Create'}
            </Button>
          </div>
        }
      >
        <form className="space-y-3" onSubmit={handleAddCourse}>
          <Input
            label="Course Code"
            value={courseCode}
            onChange={(event) => setCourseCode(event.target.value)}
            placeholder="CSX2009"
          />
          <Input
            label="Course Name"
            value={courseName}
            onChange={(event) => setCourseName(event.target.value)}
            placeholder="Introduction to Computer Science"
          />
        </form>
      </Modal>
    </div>
  )
}

export default CoursesPage
