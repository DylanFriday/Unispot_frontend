import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { leasesApi } from '../../api/leases.api'
import type { ApiError } from '../../types/dto'
import { useAuth } from '../../auth/useAuth'
import PageHeader from '../../components/PageHeader'
import Card from '../../components/Card'
import Badge from '../../components/Badge'
import Button from '../../components/Button'
import Alert from '../../components/Alert'
import Spinner from '../../components/Spinner'
import EmptyState from '../../components/EmptyState'
import { formatBahtFromCents } from '../../utils/money'

const statusVariant = (status: string) => {
  if (status === 'APPROVED') return 'success'
  if (status === 'PENDING') return 'warning'
  if (status === 'TRANSFERRED') return 'info'
  return 'danger'
}

const LeaseMarketplacePage = () => {
  const { me } = useAuth()
  const queryClient = useQueryClient()
  const [requestedIds, setRequestedIds] = useState<Set<number>>(new Set())
  const [pendingId, setPendingId] = useState<number | null>(null)
  const [feedback, setFeedback] = useState<
    Record<number, { type: 'success' | 'error'; message: string }>
  >({})

  const { data, isLoading, error } = useQuery({
    queryKey: ['leases', 'marketplace'],
    queryFn: () => leasesApi.listApprovedLeases(),
  })

  const interestMutation = useMutation({
    mutationFn: (id: number) => leasesApi.expressInterest(id),
    onMutate: (id) => {
      setPendingId(id)
    },
    onSuccess: (_, id) => {
      setRequestedIds((prev) => new Set(prev).add(id))
      setPendingId(null)
      setFeedback((prev) => ({
        ...prev,
        [id]: { type: 'success', message: 'Interest sent ✅' },
      }))
      void queryClient.invalidateQueries({ queryKey: ['leases', 'marketplace'] })
    },
    onError: (err, id) => {
      setPendingId(null)
      const status = (err as { response?: { status?: number } })?.response
        ?.status
      const message = (err as { response?: { data?: ApiError } })?.response
        ?.data?.message
      if (status === 409 || message?.toLowerCase().includes('already')) {
        setFeedback((prev) => ({
          ...prev,
          [id]: { type: 'error', message: 'You already expressed interest.' },
        }))
        setRequestedIds((prev) => new Set(prev).add(id))
        return
      }
      setFeedback((prev) => ({
        ...prev,
        [id]: {
          type: 'error',
          message: message ?? 'Failed to send interest request',
        },
      }))
    },
  })

  const errorMessage = (error as { response?: { data?: ApiError } })?.response
    ?.data?.message

  return (
    <div className="space-y-6">
      <PageHeader
        title="Leases Marketplace"
        subtitle="Browse approved lease listings." 
      />

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
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  {listing.title}
                </h3>
                <Badge
                  label={listing.status}
                  variant={statusVariant(listing.status)}
                />
              </div>
              <p className="text-sm text-gray-600">{listing.description}</p>
              <div className="text-sm text-gray-600">
                <p>Location: {listing.location}</p>
                <p>Rent: {formatBahtFromCents(listing.rentCents)}</p>
                <p>Deposit: {formatBahtFromCents(listing.depositCents)}</p>
                <p>
                  Dates: {listing.startDate} → {listing.endDate}
                </p>
                <p>Created: {listing.createdAt}</p>
              </div>
              {feedback[listing.id] ? (
                <Alert
                  message={feedback[listing.id].message}
                  tone={feedback[listing.id].type === 'success' ? 'info' : 'error'}
                />
              ) : null}
              {me?.role === 'STUDENT' ? (
                listing.status === 'APPROVED' ? (
                  <Button
                    onClick={() => interestMutation.mutate(listing.id)}
                    disabled={
                      interestMutation.isPending && pendingId === listing.id
                        ? true
                        : requestedIds.has(listing.id)
                    }
                  >
                    {requestedIds.has(listing.id)
                      ? 'Requested'
                      : interestMutation.isPending && pendingId === listing.id
                        ? 'Sending...'
                        : 'Express Interest'}
                  </Button>
                ) : (
                  <p className="text-xs text-gray-500">
                    Interest available only for approved listings.
                  </p>
                )
              ) : null}
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No lease listings"
          description="Approved lease listings will appear here." 
        />
      )}
    </div>
  )
}

export default LeaseMarketplacePage
