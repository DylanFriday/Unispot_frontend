import { useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { leaseListingsApi } from '../api/leaseListings.api'
import type { ApiError } from '../types/dto'
import { useAuth } from '../auth/useAuth'
import PageHeader from '../components/PageHeader'
import Card from '../components/Card'
import Button from '../components/Button'
import Alert from '../components/Alert'
import Spinner from '../components/Spinner'
import EmptyState from '../components/EmptyState'

const formatCents = (value: number) => `$${(value / 100).toFixed(2)}`

const LeaseListingsPublicPage = () => {
  const { me } = useAuth()
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const { data, isLoading, error } = useQuery({
    queryKey: ['lease-listings'],
    queryFn: () => leaseListingsApi.list(),
  })

  const interestMutation = useMutation({
    mutationFn: (id: number) => leaseListingsApi.interest(id),
    onSuccess: () => {
      setSuccessMessage('Interest submitted successfully.')
      setTimeout(() => setSuccessMessage(null), 2500)
    },
  })

  const errorMessage = (error as { response?: { data?: ApiError } })?.response
    ?.data?.message
  const interestError = (interestMutation.error as {
    response?: { data?: ApiError }
  })?.response?.data?.message

  return (
    <div className="space-y-6">
      <PageHeader
        title="Lease Listings"
        subtitle="Browse approved lease listings and express interest."
      />

      {successMessage ? <Alert message={successMessage} tone="info" /> : null}
      {interestError ? <Alert message={interestError} tone="error" /> : null}

      {isLoading ? (
        <div className="flex min-h-[40vh] items-center justify-center">
          <Spinner />
        </div>
      ) : errorMessage ? (
        <Alert message={errorMessage} tone="error" />
      ) : data && data.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2">
          {data.map((listing) => (
            <Card key={listing.id} className="space-y-3">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {listing.title}
                </h3>
                <p className="text-sm text-gray-600">{listing.description}</p>
              </div>
              <div className="text-sm text-gray-600">
                <p>Location: {listing.location}</p>
                <p>Rent: {formatCents(listing.rentCents)}</p>
                <p>Deposit: {formatCents(listing.depositCents)}</p>
                <p>
                  Available: {listing.startDate} → {listing.endDate}
                </p>
              </div>
              {me?.role === 'STUDENT' ? (
                <Button
                  onClick={() => interestMutation.mutate(listing.id)}
                  disabled={interestMutation.isPending}
                >
                  {interestMutation.isPending
                    ? 'Submitting...'
                    : 'Express interest'}
                </Button>
              ) : null}
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No lease listings yet"
          description="Approved listings will appear here." 
        />
      )}
    </div>
  )
}

export default LeaseListingsPublicPage
