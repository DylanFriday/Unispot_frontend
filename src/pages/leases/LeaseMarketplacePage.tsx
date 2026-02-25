import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
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
import { formatDate } from '../../utils/format'

const statusVariant = (status: string) => {
  if (status === 'APPROVED') return 'success'
  if (status === 'PENDING') return 'warning'
  return 'danger'
}

const LeaseMarketplacePage = () => {
  const { me } = useAuth()
  const [copiedId, setCopiedId] = useState<number | null>(null)
  const [feedback, setFeedback] = useState<
    Record<number, { type: 'success' | 'error'; message: string }>
  >({})

  const { data, isLoading, error } = useQuery({
    queryKey: ['leases', 'marketplace'],
    queryFn: () => leasesApi.listApprovedLeases(),
  })

  const errorMessage = (error as { response?: { data?: ApiError } })?.response
    ?.data?.message

  const openLineContact = (lineId: string) => {
    const encodedLineId = encodeURIComponent(lineId)
    const deepLink = `line://ti/p/~${encodedLineId}`
    const fallbackLink = `https://line.me/R/ti/p/~${encodedLineId}`

    window.location.href = deepLink
    window.setTimeout(() => {
      window.location.href = fallbackLink
    }, 700)
  }

  const copyLineId = async (listingId: number, lineId: string) => {
    try {
      await navigator.clipboard.writeText(lineId)
      setCopiedId(listingId)
      setFeedback((prev) => ({
        ...prev,
        [listingId]: { type: 'success', message: 'Copied!' },
      }))
      window.setTimeout(() => setCopiedId((prev) => (prev === listingId ? null : prev)), 1500)
    } catch {
      setFeedback((prev) => ({
        ...prev,
        [listingId]: { type: 'error', message: 'Failed to copy LINE ID.' },
      }))
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Leases Marketplace"
        subtitle="Browse approved lease listings and contact owners via LINE." 
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
                <p>
                  Contact (LINE):{' '}
                  {listing.lineId?.trim() ? listing.lineId : 'Not provided'}
                </p>
                <p>Rent: {formatBahtFromCents(listing.rentCents)}</p>
                <p>Deposit: {formatBahtFromCents(listing.depositCents)}</p>
                <p>
                  Dates: {formatDate(listing.startDate, { dateStyle: 'medium' })} → {formatDate(listing.endDate, { dateStyle: 'medium' })}
                </p>
                <p>Created: {formatDate(listing.createdAt)}</p>
              </div>
              {feedback[listing.id] ? (
                <Alert
                  message={feedback[listing.id].message}
                  tone={feedback[listing.id].type === 'success' ? 'info' : 'error'}
                />
              ) : null}
              {me?.role === 'STUDENT' ? (
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-2">
                    <Button
                      onClick={() =>
                        listing.lineId?.trim() && openLineContact(listing.lineId.trim())
                      }
                      disabled={!listing.lineId?.trim()}
                    >
                      Contact Owner
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() =>
                        listing.lineId?.trim() &&
                        copyLineId(listing.id, listing.lineId.trim())
                      }
                      disabled={!listing.lineId?.trim()}
                    >
                      Copy LINE ID
                    </Button>
                  </div>
                  {!listing.lineId?.trim() ? (
                    <p className="text-xs text-gray-500">
                      Owner didn&apos;t provide LINE ID.
                    </p>
                  ) : null}
                  {copiedId === listing.id ? (
                    <p className="text-xs text-emerald-700">Copied!</p>
                  ) : null}
                </div>
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
