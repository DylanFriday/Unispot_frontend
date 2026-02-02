import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useMutation, useQuery } from '@tanstack/react-query'
import { studySheetsApi } from '../api/studySheets.api'
import type { ApiError, StudySheetPurchaseResponse } from '../types/dto'
import { useAuth } from '../auth/useAuth'
import PageHeader from '../components/PageHeader'
import Card from '../components/Card'
import Button from '../components/Button'
import Input from '../components/Input'
import Alert from '../components/Alert'
import Spinner from '../components/Spinner'
import EmptyState from '../components/EmptyState'
import Modal from '../components/Modal'
import { QRCodeCanvas } from 'qrcode.react'
import { buildPromptPayPayload } from '../utils/promptpay'
import { formatBahtFromCents } from '../utils/money'

const formatPrice = (value?: number | null) =>
  value == null ? '-' : formatBahtFromCents(value)

const StudySheetsPublicPage = () => {
  const { me } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const [purchaseData, setPurchaseData] = useState<
    StudySheetPurchaseResponse | null
  >(null)
  const [copyMessage, setCopyMessage] = useState<string | null>(null)

  const courseCodeParam = searchParams.get('courseCode')?.trim() ?? ''
  const appliedCourseCode = courseCodeParam ? courseCodeParam : undefined

  const queryKey = useMemo(
    () => ['study-sheets', appliedCourseCode],
    [appliedCourseCode]
  )

  const { data, isLoading, error, refetch } = useQuery({
    queryKey,
    queryFn: () => studySheetsApi.list(appliedCourseCode),
  })

  const purchaseMutation = useMutation({
    mutationFn: (id: number) => studySheetsApi.purchase(id),
    onSuccess: (response) => {
      setPurchaseData(response)
      setCopyMessage(null)
    },
  })

  const handleFilterChange = (value: string) => {
    const next = value.trim()
    if (!next) {
      setSearchParams({})
      return
    }
    setSearchParams({ courseCode: next.toUpperCase() })
  }

  const handleCopy = async (value: string) => {
    await navigator.clipboard.writeText(value)
    setCopyMessage('Copied to clipboard')
    setTimeout(() => setCopyMessage(null), 2000)
  }

  const errorMessage = (error as { response?: { data?: ApiError } })?.response
    ?.data?.message
  const purchaseError = (purchaseMutation.error as {
    response?: { data?: ApiError }
  })?.response?.data?.message

  return (
    <div className="space-y-6">
      <PageHeader
        title="Study Sheets"
        subtitle="Browse approved study sheets from students."
        action={
          <div className="flex flex-wrap gap-2">
            <Input
              placeholder="Filter by course code"
              value={courseCodeParam}
              onChange={(event) => handleFilterChange(event.target.value)}
            />
            {appliedCourseCode ? (
              <Button
                variant="secondary"
                onClick={() => {
                  setSearchParams({})
                  void refetch()
                }}
              >
                Clear
              </Button>
            ) : null}
          </div>
        }
      />

      {purchaseError ? <Alert message={purchaseError} tone="error" /> : null}

      {isLoading ? (
        <div className="flex min-h-[40vh] items-center justify-center">
          <Spinner />
        </div>
      ) : errorMessage ? (
        <Alert message={errorMessage} tone="error" />
      ) : data && data.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2">
          {data.map((sheet) => (
            <Card key={sheet.id} className="space-y-3">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {sheet.title}
                </h3>
                <p className="text-sm text-gray-600">{sheet.description}</p>
              </div>
              <div className="text-sm text-gray-600">
                <p>
                  Course: {sheet.courseCode ?? sheet.courseId ?? '-'}
                </p>
                <p>Price: {formatPrice(sheet.price)}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <a
                  href={sheet.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm font-medium text-gray-900 underline"
                >
                  Preview file
                </a>
                {me?.role === 'STUDENT' ? (
                  <Button
                    onClick={() => purchaseMutation.mutate(sheet.id)}
                    disabled={purchaseMutation.isPending}
                  >
                    {purchaseMutation.isPending ? 'Processing...' : 'Purchase'}
                  </Button>
                ) : null}
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No study sheets yet"
          description="Approved study sheets will appear here." 
        />
      )}

      <Modal
        open={Boolean(purchaseData)}
        title="Purchase details"
        onClose={() => setPurchaseData(null)}
        footer={
          <Button variant="secondary" onClick={() => setPurchaseData(null)}>
            Close
          </Button>
        }
      >
        {purchaseData ? (
          <div className="space-y-3">
            {(() => {
              const receiver = import.meta.env.VITE_PROMPTPAY_PHONE as
                | string
                | undefined
              const amountBaht = Number(formatBahtFromCents(purchaseData.amountCents))
              const payload =
                receiver && receiver.trim().length > 0
                  ? buildPromptPayPayload({
                      phoneOrId: receiver.trim(),
                      amountBaht,
                    })
                  : ''
              return (
                <>
                  <div className="flex flex-col items-center gap-3 rounded-md border border-gray-200 bg-white p-4">
                    {payload ? (
                      <QRCodeCanvas value={payload} size={200} />
                    ) : (
                      <p className="text-sm text-red-600">
                        Missing VITE_PROMPTPAY_PHONE
                      </p>
                    )}
                    <p className="text-xs text-gray-500">
                      Scan with Thai banking apps
                    </p>
                    {receiver ? (
                      <div className="text-xs text-gray-600">
                        <div className="font-mono">
                          Using phone: {receiver}
                        </div>
                        {payload ? (
                          <div className="font-mono">
                            Payload prefix: {payload.slice(0, 50)}...
                          </div>
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                  <div className="rounded-md border border-gray-200 bg-gray-50 p-3 text-sm">
                    <p>
                      <span className="font-semibold">Reference Code:</span>{' '}
                      {purchaseData.referenceCode}
                    </p>
                    <p>
                      <span className="font-semibold">Amount (cents):</span>{' '}
                      {purchaseData.amountCents}
                    </p>
                    <p className="break-all">
                      <span className="font-semibold">PromptPay EMV:</span>{' '}
                      {payload || 'Missing VITE_PROMPTPAY_PHONE'}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="secondary"
                      onClick={() => handleCopy(purchaseData.referenceCode)}
                    >
                      Copy reference
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => payload && handleCopy(payload)}
                      disabled={!payload}
                    >
                      Copy PromptPay
                    </Button>
                  </div>
                </>
              )
            })()}
            {copyMessage ? (
              <Alert message={copyMessage} tone="info" />
            ) : null}
          </div>
        ) : null}
      </Modal>
    </div>
  )
}

export default StudySheetsPublicPage
