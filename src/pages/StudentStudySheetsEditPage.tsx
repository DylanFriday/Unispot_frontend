import { useEffect, useMemo } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { studySheetsApi } from '../api/studySheets.api'
import type { ApiError, StudySheetDto } from '../types/dto'
import PageHeader from '../components/PageHeader'
import Card from '../components/Card'
import Input from '../components/Input'
import Button from '../components/Button'
import Alert from '../components/Alert'
import Spinner from '../components/Spinner'
import EmptyState from '../components/EmptyState'
import { formatBahtFromCents, toCents } from '../utils/money'

const schema = z.object({
  title: z.string().min(3, 'Title is required'),
  description: z.string().min(5, 'Description is required'),
  fileUrl: z.string().url('Enter a valid file URL'),
  price: z.string().min(1, 'Price is required'),
  courseCode: z.string().min(1, 'Course code is required'),
})

type FormValues = z.infer<typeof schema>

const StudentStudySheetsEditPage = () => {
  const navigate = useNavigate()
  const params = useParams()
  const queryClient = useQueryClient()
  const sheetId = useMemo(() => Number(params.id), [params.id])

  const { data, isLoading, error } = useQuery({
    queryKey: ['study-sheets', 'mine'],
    queryFn: () => studySheetsApi.mine(),
  })

  const sheet = useMemo(
    () => data?.find((item) => item.id === sheetId) ?? null,
    [data, sheetId]
  )

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  })

  useEffect(() => {
    if (!sheet) return
    reset({
      title: sheet.title,
      description: sheet.description,
      fileUrl: sheet.fileUrl,
      price: sheet.price == null ? '' : formatBahtFromCents(sheet.price),
      courseCode: sheet.courseCode ?? '',
    })
  }, [reset, sheet])

  const mutation = useMutation({
    mutationFn: (payload: Partial<StudySheetDto>) =>
      studySheetsApi.update(sheetId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['study-sheets', 'mine'] })
      navigate('/student/study-sheets/mine', { replace: true })
    },
  })

  const onSubmit = (values: FormValues) => {
    mutation.mutate({
      title: values.title,
      description: values.description,
      fileUrl: values.fileUrl,
      priceCents: toCents(values.price),
      courseCode: values.courseCode.trim().toUpperCase(),
    })
  }

  const errorMessage = (error as { response?: { data?: ApiError } })?.response
    ?.data?.message

  return (
    <div className="space-y-6">
      <PageHeader
        title="Edit Study Sheet"
        subtitle="Update your study sheet details."
        action={
          <Link to="/student/study-sheets/mine">
            <Button variant="secondary">Back</Button>
          </Link>
        }
      />

      {isLoading ? (
        <div className="flex min-h-[40vh] items-center justify-center">
          <Spinner />
        </div>
      ) : errorMessage ? (
        <Alert message={errorMessage} tone="error" />
      ) : !sheet ? (
        <EmptyState
          title="Study sheet not found"
          description="Return to your study sheets to pick another item."
          action={
            <Link to="/student/study-sheets/mine">
              <Button>Back to list</Button>
            </Link>
          }
        />
      ) : (
        <Card className="space-y-4">
          {mutation.error ? (
            <Alert
              message={
                (mutation.error as { response?: { data?: ApiError } })?.response
                  ?.data?.message ?? 'Update failed'
              }
              tone="error"
            />
          ) : null}
          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <Input
              label="Title"
              error={errors.title?.message}
              {...register('title')}
            />
            <Input
              label="Description"
              error={errors.description?.message}
              {...register('description')}
            />
            <Input
              label="File URL"
              error={errors.fileUrl?.message}
              {...register('fileUrl')}
            />
            <div className="grid gap-4 md:grid-cols-2">
              <Input
                label="Price (Baht)"
                type="number"
                error={errors.price?.message}
                {...register('price')}
              />
              <Input
                label="Course Code"
                placeholder="CSX3003"
                error={errors.courseCode?.message}
                {...register('courseCode')}
              />
            </div>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? 'Saving...' : 'Save changes'}
            </Button>
          </form>
        </Card>
      )}
    </div>
  )
}

export default StudentStudySheetsEditPage
