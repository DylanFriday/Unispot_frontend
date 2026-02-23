import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { leaseListingsApi } from '../api/leaseListings.api'
import type { ApiError } from '../types/dto'
import { useAuth } from '../auth/useAuth'
import PageHeader from '../components/PageHeader'
import Card from '../components/Card'
import Button from '../components/Button'
import Alert from '../components/Alert'
import Spinner from '../components/Spinner'
import EmptyState from '../components/EmptyState'
import { formatBahtFromCents } from '../utils/money'
import { formatDate } from '../utils/format'

const formatCents = (value: number) => formatBahtFromCents(value)

const LeaseListingsPublicPage = () => {
  const { me } = useAuth()
  const [feedback, setFeedback] = useState<Record<number, { type: 'success' | 'error'; message: string }>>({})
  const [copiedId, setCopiedId] = useState<number | null>(null)

  const { data, isLoading, error } = useQuery({
    queryKey: ['lease-listings'],
    queryFn: () => leaseListingsApi.list(),
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
        title="Lease Listings"
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
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {listing.title}
                </h3>
                <p className="text-sm text-gray-600">{listing.description}</p>
              </div>
              <div className="text-sm text-gray-600">
                <p>Location: {listing.location}</p>
                <p>
                  Contact (LINE):{' '}
                  {listing.lineId?.trim() ? listing.lineId : 'Not provided'}
                </p>
                <p>Rent: {formatCents(listing.rentCents)}</p>
                <p>Deposit: {formatCents(listing.depositCents)}</p>
                <p>
                  Available: {formatDate(listing.startDate, { dateStyle: 'medium' })} → {formatDate(listing.endDate, { dateStyle: 'medium' })}
                </p>
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
          title="No lease listings yet"
          description="Approved listings will appear here." 
        />
      )}
    </div>
  )
}

export default LeaseListingsPublicPage
