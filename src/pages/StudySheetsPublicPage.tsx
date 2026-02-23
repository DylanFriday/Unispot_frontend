import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { studySheetsApi } from '../api/studySheets.api'
import { purchasesApi } from '../api/purchases.api'
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

const getFilePreviewMeta = (value: string) => {
  try {
    const url = new URL(value)
    const host = url.hostname.replace(/^www\./, '')
    const rawName = decodeURIComponent(
      url.pathname.split('/').filter(Boolean).pop() ?? 'Study sheet file'
    )
    const fileName =
      rawName.length > 34 ? `${rawName.slice(0, 34)}...` : rawName
    const extension = rawName.includes('.')
      ? rawName.split('.').pop()?.toUpperCase() ?? 'FILE'
      : 'FILE'
    return {
      host,
      fileName,
      extension: extension.length > 8 ? 'FILE' : extension,
    }
  } catch {
    return {
      host: 'External file',
      fileName: 'Study sheet file',
      extension: 'FILE',
    }
  }
}

const StudySheetsPublicPage = () => {
  const { me } = useAuth()
  const queryClient = useQueryClient()
  const [searchParams, setSearchParams] = useSearchParams()
  const [purchaseData, setPurchaseData] = useState<
    StudySheetPurchaseResponse | null
  >(null)
  const [pendingPurchaseSheetId, setPendingPurchaseSheetId] = useState<
    number | null
  >(null)
  const [copyMessage, setCopyMessage] = useState<string | null>(null)

  const courseCodeParam = searchParams.get('courseCode')?.trim() ?? ''
  const appliedCourseCode = courseCodeParam ? courseCodeParam : undefined

  const { data, isLoading, error } = useQuery({
    queryKey: ['study-sheets'],
    queryFn: () => studySheetsApi.list(),
  })
  const purchasedQuery = useQuery({
    queryKey: ['purchasedStudySheets'],
    queryFn: purchasesApi.listPurchasedStudySheets,
    enabled: me?.role === 'STUDENT',
  })

  const purchaseMutation = useMutation({
    mutationFn: (id: number) => studySheetsApi.purchase(id),
    onMutate: (id) => {
      setPendingPurchaseSheetId(id)
    },
    onSuccess: (response) => {
      setPurchaseData(response)
      setCopyMessage(null)
      void queryClient.invalidateQueries({ queryKey: ['purchasedStudySheets'] })
      void queryClient.invalidateQueries({ queryKey: ['study-sheets'] })
    },
    onSettled: () => {
      setPendingPurchaseSheetId(null)
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
  const purchasedError = (purchasedQuery.error as {
    response?: { data?: ApiError }
  })?.response?.data?.message
  const purchasedSheetIds = useMemo(() => {
    return new Set((purchasedQuery.data ?? []).map((item) => item.studySheet.id))
  }, [purchasedQuery.data])
  const canPreviewSheet = (ownerId: number, isPurchased: boolean) => {
    if (!me) return false
    if (me.role === 'ADMIN' || me.role === 'STAFF') return true
    if (me.id === ownerId) return true
    return isPurchased
  }

  const displaySheets = useMemo(() => {
    if (!data) return []
    if (!appliedCourseCode) return data

    const normalizedFilter = appliedCourseCode.toUpperCase()
    return data.filter((sheet) => {
      const courseCode = sheet.courseCode?.toUpperCase() ?? ''
      const courseId =
        sheet.courseId == null ? '' : String(sheet.courseId).toUpperCase()
      return (
        courseCode.includes(normalizedFilter) ||
        courseId.includes(normalizedFilter)
      )
    })
  }, [data, appliedCourseCode])

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
                }}
              >
                Clear
              </Button>
            ) : null}
          </div>
        }
      />

      {purchaseError ? <Alert message={purchaseError} tone="error" /> : null}
      {me?.role === 'STUDENT' && purchasedError ? (
        <Alert message={purchasedError} tone="error" />
      ) : null}

      {isLoading ? (
        <div className="flex min-h-[40vh] items-center justify-center">
          <Spinner />
        </div>
      ) : errorMessage ? (
        <Alert message={errorMessage} tone="error" />
      ) : displaySheets.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2">
          {displaySheets.map((sheet) => {
            const fileMeta = getFilePreviewMeta(sheet.fileUrl)
            const isPurchased = purchasedSheetIds.has(sheet.id)
            const canPreview = canPreviewSheet(sheet.ownerId, isPurchased)
            const isOwnSheet = me?.id === sheet.ownerId
            const isPurchasableByStudent =
              me?.role === 'STUDENT' && !isOwnSheet && !canPreview
            return (
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
                <div className="rounded-xl border border-white/55 bg-white/45 p-3 backdrop-blur-md">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-[11px] font-semibold tracking-[0.08em] text-indigo-700/90">
                        {fileMeta.extension}
                      </p>
                      <p className="truncate text-sm font-semibold text-slate-900">
                        {fileMeta.fileName}
                      </p>
                      <p className="truncate text-xs text-slate-600">
                        {fileMeta.host}
                      </p>
                    </div>
                    {canPreview ? (
                      <a
                        href={sheet.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex shrink-0 items-center justify-center rounded-lg border border-white/60 bg-white/65 px-3 py-1.5 text-xs font-semibold text-slate-900 transition hover:bg-white/85"
                      >
                        Open Preview
                      </a>
                    ) : (
                      <span className="inline-flex shrink-0 items-center justify-center rounded-lg border border-indigo-200/70 bg-indigo-100/65 px-3 py-1.5 text-xs font-semibold text-indigo-900">
                        Preview Locked
                      </span>
                    )}
                  </div>
                  {!canPreview ? (
                    <p className="mt-2 text-xs text-slate-600">
                      {me?.role === 'STUDENT' &&
                      !isOwnSheet &&
                      purchasedQuery.isLoading
                        ? 'Checking your purchase history...'
                        : isPurchasableByStudent
                        ? 'Purchase this study sheet to unlock preview.'
                        : me
                          ? 'Preview unlock is available after purchase.'
                          : 'Login as student and purchase to unlock preview.'}
                    </p>
                  ) : null}
                </div>
                <div className="flex flex-wrap gap-2">
                  {me?.role === 'STUDENT' && !isOwnSheet && isPurchased ? (
                    <>
                      <span className="inline-flex items-center rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700">
                        Already purchased
                      </span>
                      <Button
                        variant="secondary"
                        onClick={() => window.open(sheet.fileUrl, '_blank')}
                      >
                        Download
                      </Button>
                    </>
                  ) : null}
                  {isPurchasableByStudent ? (
                    <Button
                      onClick={() => {
                        purchaseMutation.mutate(sheet.id)
                      }}
                      disabled={
                        purchasedQuery.isLoading ||
                        purchaseMutation.isPending &&
                        pendingPurchaseSheetId === sheet.id
                      }
                    >
                      {purchaseMutation.isPending &&
                      pendingPurchaseSheetId === sheet.id
                        ? 'Processing...'
                        : 'Purchase to Unlock'}
                    </Button>
                  ) : null}
                </div>
              </Card>
            )
          })}
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
        panelClassName="glass-panel-strong max-w-2xl"
        contentClassName="text-slate-700"
      >
        {purchaseData ? (
          <div className="space-y-4">
            {(() => {
              const receiver = import.meta.env.VITE_PROMPTPAY_PHONE as
                | string
                | undefined
              const amountCents = purchaseData.amountCents
              const hasAmount =
                typeof amountCents === 'number' && !Number.isNaN(amountCents)
              const amountBaht = hasAmount ? amountCents / 100 : null
              const payload =
                hasAmount && receiver && receiver.trim().length > 0
                  ? buildPromptPayPayload({
                      phoneOrId: receiver.trim(),
                      amountBaht: Number(amountBaht?.toFixed(2)),
                    })
                  : ''
              const amountError = !hasAmount
                ? 'Payment amount not found'
                : null
              const receiverError =
                !receiver || receiver.trim().length === 0
                  ? 'Missing VITE_PROMPTPAY_PHONE'
                  : null
              return (
                <>
                  <div className="rounded-2xl border border-white/60 bg-white/55 p-4 backdrop-blur-md">
                    <div className="flex flex-col items-center gap-3">
                      {amountError ? (
                        <Alert message={amountError} tone="error" />
                      ) : receiverError ? (
                        <p className="text-sm text-red-600">{receiverError}</p>
                      ) : payload ? (
                        <div className="rounded-xl border border-white/65 bg-white p-3 shadow-[0_16px_24px_-20px_rgba(15,23,42,0.65)]">
                          <QRCodeCanvas value={payload} size={220} />
                        </div>
                      ) : null}
                      <p className="text-xs text-slate-600">
                        Scan with Thai banking apps (amount locked)
                      </p>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/60 bg-white/55 p-4 backdrop-blur-md">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-600">
                        Reference
                      </span>
                      <span className="font-mono text-xs text-slate-700">
                        {purchaseData.referenceCode}
                      </span>
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-sm font-semibold text-slate-700">Amount</span>
                      <span className="text-lg font-semibold text-slate-900">
                        {hasAmount ? `฿${formatBahtFromCents(amountCents)}` : '-'}
                      </span>
                    </div>
                  </div>

                  <div className="grid gap-2 sm:grid-cols-3">
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
                    <Button
                      variant="primary"
                      onClick={() => setPurchaseData(null)}
                    >
                      Payment Completed
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
