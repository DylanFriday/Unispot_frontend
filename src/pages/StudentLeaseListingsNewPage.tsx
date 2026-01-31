import { useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { leaseListingsApi } from '../api/leaseListings.api'
import type { ApiError } from '../types/dto'
import PageHeader from '../components/PageHeader'
import Card from '../components/Card'
import Input from '../components/Input'
import Button from '../components/Button'
import Alert from '../components/Alert'

const schema = z.object({
  title: z.string().min(3, 'Title is required'),
  description: z.string().min(5, 'Description is required'),
  location: z.string().min(3, 'Location is required'),
  rentCents: z.string().min(1, 'Rent is required'),
  depositCents: z.string().min(1, 'Deposit is required'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
})

type FormValues = z.infer<typeof schema>

const toIso = (value: string) => {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : date.toISOString()
}

const StudentLeaseListingsNewPage = () => {
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
      location: string
      rentCents: number
      depositCents: number
      startDate: string
      endDate: string
    }) => leaseListingsApi.create(payload),
    onSuccess: () => {
      navigate('/student/lease-listings/mine', { replace: true })
    },
  })

  const onSubmit = (values: FormValues) => {
    mutation.mutate({
      title: values.title,
      description: values.description,
      location: values.location,
      rentCents: Number(values.rentCents),
      depositCents: Number(values.depositCents),
      startDate: toIso(values.startDate),
      endDate: toIso(values.endDate),
    })
  }

  const errorMessage = (mutation.error as { response?: { data?: ApiError } })
    ?.response?.data?.message

  return (
    <div className="space-y-6">
      <PageHeader
        title="New Lease Listing"
        subtitle="Create a listing for available leases."
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
            label="Location"
            error={errors.location?.message}
            {...register('location')}
          />
          <div className="grid gap-4 md:grid-cols-2">
            <Input
              label="Rent (cents)"
              type="number"
              error={errors.rentCents?.message}
              {...register('rentCents')}
            />
            <Input
              label="Deposit (cents)"
              type="number"
              error={errors.depositCents?.message}
              {...register('depositCents')}
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Input
              label="Start date"
              type="date"
              error={errors.startDate?.message}
              {...register('startDate')}
            />
            <Input
              label="End date"
              type="date"
              error={errors.endDate?.message}
              {...register('endDate')}
            />
          </div>
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? 'Creating...' : 'Create lease listing'}
          </Button>
        </form>
      </Card>
    </div>
  )
}

export default StudentLeaseListingsNewPage
