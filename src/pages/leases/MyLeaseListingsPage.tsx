import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { leasesApi } from '../../api/leases.api'
import type { ApiError, LeaseListingDto } from '../../types/dto'
import PageHeader from '../../components/PageHeader'
import Table from '../../components/Table'
import Badge from '../../components/Badge'
import Button from '../../components/Button'
import Modal from '../../components/Modal'
import Input from '../../components/Input'
import Alert from '../../components/Alert'
import Spinner from '../../components/Spinner'
import EmptyState from '../../components/EmptyState'

const statusVariant = (status: string) => {
  if (status === 'APPROVED') return 'success'
  if (status === 'PENDING') return 'warning'
  if (status === 'TRANSFERRED') return 'info'
  return 'danger'
}

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

const headers = [
  'Title',
  'Location',
  'Rent',
  'Deposit',
  'Start',
  'End',
  'Status',
  'Created',
  'Actions',
]

const MyLeaseListingsPage = () => {
  const queryClient = useQueryClient()
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingListing, setEditingListing] = useState<LeaseListingDto | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<LeaseListingDto | null>(null)
  const [transferTarget, setTransferTarget] = useState<LeaseListingDto | null>(null)

  const { data, isLoading, error } = useQuery({
    queryKey: ['leases', 'mine'],
    queryFn: () => leasesApi.listMyLeases(),
  })

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  const openCreate = () => {
    setEditingListing(null)
    reset({
      title: '',
      description: '',
      location: '',
      rentCents: '',
      depositCents: '',
      startDate: '',
      endDate: '',
    })
    setIsFormOpen(true)
  }

  const openEdit = (listing: LeaseListingDto) => {
    setEditingListing(listing)
    reset({
      title: listing.title,
      description: listing.description,
      location: listing.location,
      rentCents: String(listing.rentCents),
      depositCents: String(listing.depositCents),
      startDate: listing.startDate.slice(0, 10),
      endDate: listing.endDate.slice(0, 10),
    })
    setIsFormOpen(true)
  }

  const createMutation = useMutation({
    mutationFn: (payload: {
      title: string
      description: string
      location: string
      rentCents: number
      depositCents: number
      startDate: string
      endDate: string
    }) => leasesApi.createLease(payload),
    onSuccess: () => {
      setIsFormOpen(false)
      void queryClient.invalidateQueries({ queryKey: ['leases', 'mine'] })
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Partial<LeaseListingDto> }) =>
      leasesApi.updateLease(id, payload),
    onSuccess: () => {
      setIsFormOpen(false)
      setEditingListing(null)
      void queryClient.invalidateQueries({ queryKey: ['leases', 'mine'] })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => leasesApi.deleteLease(id),
    onSuccess: () => {
      setDeleteTarget(null)
      void queryClient.invalidateQueries({ queryKey: ['leases', 'mine'] })
    },
  })

  const transferMutation = useMutation({
    mutationFn: (id: number) => leasesApi.transferLease(id),
    onSuccess: () => {
      setTransferTarget(null)
      void queryClient.invalidateQueries({ queryKey: ['leases', 'mine'] })
    },
  })

  const onSubmit = (values: FormValues) => {
    const payload = {
      title: values.title,
      description: values.description,
      location: values.location,
      rentCents: Number(values.rentCents),
      depositCents: Number(values.depositCents),
      startDate: toIso(values.startDate),
      endDate: toIso(values.endDate),
    }

    if (editingListing) {
      updateMutation.mutate({ id: editingListing.id, payload })
      return
    }

    createMutation.mutate(payload)
  }

  const errorMessage = (error as { response?: { data?: ApiError } })?.response
    ?.data?.message

  const formError = (createMutation.error as { response?: { data?: ApiError } })
    ?.response?.data?.message ||
    (updateMutation.error as { response?: { data?: ApiError } })?.response?.data?.message

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Lease Listings"
        subtitle="Create and manage your lease listings."
        action={<Button onClick={openCreate}>Create listing</Button>}
      />

      {isLoading ? (
        <div className="flex min-h-[40vh] items-center justify-center">
          <Spinner />
        </div>
      ) : errorMessage ? (
        <Alert message={errorMessage} tone="error" />
      ) : data && data.length > 0 ? (
        <Table headers={headers}>
          {data.map((listing) => (
            <tr key={listing.id} className="text-sm text-gray-700">
              <td className="px-4 py-3 font-medium text-gray-900">
                {listing.title}
              </td>
              <td className="px-4 py-3">{listing.location}</td>
              <td className="px-4 py-3">{listing.rentCents}</td>
              <td className="px-4 py-3">{listing.depositCents}</td>
              <td className="px-4 py-3">{listing.startDate}</td>
              <td className="px-4 py-3">{listing.endDate}</td>
              <td className="px-4 py-3">
                <Badge label={listing.status} variant={statusVariant(listing.status)} />
              </td>
              <td className="px-4 py-3">{listing.createdAt}</td>
              <td className="px-4 py-3">
                <div className="flex flex-wrap gap-2">
                  <Button variant="secondary" onClick={() => openEdit(listing)}>
                    Edit
                  </Button>
                  <Button variant="danger" onClick={() => setDeleteTarget(listing)}>
                    Delete
                  </Button>
                  <Button onClick={() => setTransferTarget(listing)}>
                    Transfer
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </Table>
      ) : (
        <EmptyState
          title="No lease listings"
          description="Create your first lease listing to get started."
          action={<Button onClick={openCreate}>Create listing</Button>}
        />
      )}

      <Modal
        open={isFormOpen}
        title={editingListing ? 'Edit lease listing' : 'Create lease listing'}
        onClose={() => {
          setIsFormOpen(false)
          setEditingListing(null)
        }}
        footer={
          <div className="flex gap-2">
            <Button
              variant="secondary"
              onClick={() => {
                setIsFormOpen(false)
                setEditingListing(null)
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit(onSubmit)}
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {createMutation.isPending || updateMutation.isPending
                ? 'Saving...'
                : 'Save'}
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          {formError ? <Alert message={formError} tone="error" /> : null}
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
        </div>
      </Modal>

      <Modal
        open={Boolean(deleteTarget)}
        title="Delete lease listing"
        onClose={() => setDeleteTarget(null)}
        footer={
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        }
      >
        Are you sure you want to delete this lease listing?
      </Modal>

      <Modal
        open={Boolean(transferTarget)}
        title="Transfer lease listing"
        onClose={() => setTransferTarget(null)}
        footer={
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => setTransferTarget(null)}>
              Cancel
            </Button>
            <Button
              onClick={() => transferTarget && transferMutation.mutate(transferTarget.id)}
              disabled={transferMutation.isPending}
            >
              {transferMutation.isPending ? 'Transferring...' : 'Transfer'}
            </Button>
          </div>
        }
      >
        Confirm transfer of this lease listing.
      </Modal>
    </div>
  )
}

export default MyLeaseListingsPage
