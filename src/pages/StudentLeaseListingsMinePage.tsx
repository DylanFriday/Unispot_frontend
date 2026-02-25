import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { leaseListingsApi } from '../api/leaseListings.api'
import type { ApiError, LeaseListingDto } from '../types/dto'
import PageHeader from '../components/PageHeader'
import Card from '../components/Card'
import Button from '../components/Button'
import Badge from '../components/Badge'
import Modal from '../components/Modal'
import Alert from '../components/Alert'
import Spinner from '../components/Spinner'
import EmptyState from '../components/EmptyState'
import { formatBahtFromCents } from '../utils/money'
import { formatDate } from '../utils/format'

const statusVariant = (status: string) => {
  if (status === 'APPROVED') return 'success'
  if (status === 'PENDING') return 'warning'
  return 'danger'
}

  const formatCents = (value: number) => formatBahtFromCents(value)

const StudentLeaseListingsMinePage = () => {
  const queryClient = useQueryClient()
  const [selected, setSelected] = useState<LeaseListingDto | null>(null)

  const { data, isLoading, error } = useQuery({
    queryKey: ['lease-listings', 'mine'],
    queryFn: () => leaseListingsApi.mine(),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => leaseListingsApi.remove(id),
    onSuccess: () => {
      setSelected(null)
      void queryClient.invalidateQueries({ queryKey: ['lease-listings', 'mine'] })
    },
  })

  const errorMessage = (error as { response?: { data?: ApiError } })?.response
    ?.data?.message

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Lease Listings"
        subtitle="Manage your lease listings."
        action={
          <Link to="/student/lease-listings/new">
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
          {data.map((listing) => (
            <Card key={listing.id} className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {listing.title}
                  </h3>
                  <p className="text-sm text-gray-600">{listing.description}</p>
                </div>
                <Badge
                  label={listing.status}
                  variant={statusVariant(listing.status)}
                />
              </div>
              <div className="text-sm text-gray-600">
                <p>Location: {listing.location}</p>
                <p>Contact (LINE): {listing.lineId?.trim() ? listing.lineId : 'Not provided'}</p>
                <p>Rent: {formatCents(listing.rentCents)}</p>
                <p>Deposit: {formatCents(listing.depositCents)}</p>
                <p>
                  Dates: {formatDate(listing.startDate, { dateStyle: 'medium' })} → {formatDate(listing.endDate, { dateStyle: 'medium' })}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {listing.status === 'PENDING' ? (
                  <Button
                    variant="danger"
                    onClick={() => setSelected(listing)}
                  >
                    Delete
                  </Button>
                ) : null}
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No lease listings yet"
          description="Create your first lease listing to get started."
          action={
            <Link to="/student/lease-listings/new">
              <Button>Create lease listing</Button>
            </Link>
          }
        />
      )}

      <Modal
        open={Boolean(selected)}
        title="Delete lease listing"
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
        Are you sure you want to delete this lease listing? This action cannot be undone.
      </Modal>
    </div>
  )
}

export default StudentLeaseListingsMinePage
