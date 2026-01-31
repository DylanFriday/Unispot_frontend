import { useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { studySheetsApi } from '../api/studySheets.api'
import type { ApiError } from '../types/dto'
import PageHeader from '../components/PageHeader'
import Card from '../components/Card'
import Input from '../components/Input'
import Button from '../components/Button'
import Alert from '../components/Alert'

const schema = z.object({
  title: z.string().min(3, 'Title is required'),
  description: z.string().min(5, 'Description is required'),
  fileUrl: z.string().url('Enter a valid file URL'),
  price: z.string().min(1, 'Price is required'),
  courseId: z.string().min(1, 'Course ID is required'),
})

type FormValues = z.infer<typeof schema>

const StudentStudySheetsNewPage = () => {
  const navigate = useNavigate()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  const mutation = useMutation({
    mutationFn: (payload: {
      title: string
      description: string
      fileUrl: string
      priceCents: number
      courseId: number
    }) => studySheetsApi.create(payload),
    onSuccess: () => {
      navigate('/student/study-sheets/mine', { replace: true })
    },
  })

  const onSubmit = (values: FormValues) => {
    mutation.mutate({
      title: values.title,
      description: values.description,
      fileUrl: values.fileUrl,
      priceCents: Number(values.price),
      courseId: Number(values.courseId),
    })
  }

  const errorMessage = (mutation.error as { response?: { data?: ApiError } })
    ?.response?.data?.message

  return (
    <div className="space-y-6">
      <PageHeader
        title="New Study Sheet"
        subtitle="Create a study sheet for students to purchase."
      />
      <Card className="space-y-4">
        {errorMessage ? <Alert message={errorMessage} tone="error" /> : null}
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
              label="Price"
              type="number"
              error={errors.price?.message}
              {...register('price')}
            />
            <Input
              label="Course ID"
              type="number"
              error={errors.courseId?.message}
              {...register('courseId')}
            />
          </div>
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? 'Creating...' : 'Create study sheet'}
          </Button>
        </form>
      </Card>
    </div>
  )
}

export default StudentStudySheetsNewPage
