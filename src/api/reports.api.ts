import http from './http'
import type { ReportDto, ReportStatus } from '../types/dto'

type RawReport = Record<string, unknown>

const asArray = (value: unknown): RawReport[] | null =>
  Array.isArray(value) ? (value as RawReport[]) : null

const asNumber = (value: unknown) =>
  typeof value === 'number' ? value : null

const asString = (value: unknown) =>
  typeof value === 'string' ? value : null

const normalizeReport = (raw: RawReport): ReportDto | null => {
  const idValue = raw.id ?? raw._id
  const normalizedId =
    typeof idValue === 'number'
      ? idValue
      : typeof idValue === 'string' && idValue.trim()
        ? Number(idValue)
        : NaN

  const status = asString(raw.status)
  const targetType = asString(raw.targetType)
  const createdAt = asString(raw.createdAt)
  const targetId = asNumber(raw.targetId)

  if (
    !Number.isFinite(normalizedId) ||
    (status !== 'PENDING' && status !== 'RESOLVED' && status !== 'REJECTED') ||
    (targetType !== 'REVIEW' && targetType !== 'TEACHER_REVIEW') ||
    !createdAt ||
    targetId === null
  ) {
    return null
  }

  const reporterRaw =
    raw.reporter && typeof raw.reporter === 'object'
      ? (raw.reporter as Record<string, unknown>)
      : {}
  const targetPreviewRaw =
    raw.targetPreview && typeof raw.targetPreview === 'object'
      ? (raw.targetPreview as Record<string, unknown>)
      : raw.target && typeof raw.target === 'object'
        ? (raw.target as Record<string, unknown>)
        : {}

  return {
    _id: String(normalizedId),
    status,
    reason: asString(raw.reason) ?? undefined,
    createdAt,
    reporter: {
      _id: String(
        asNumber(reporterRaw.id) ??
          asNumber(reporterRaw._id) ??
          asNumber(raw.reporterId) ??
          0
      ),
      name: asString(reporterRaw.name) ?? undefined,
      email: asString(reporterRaw.email) ?? undefined,
    },
    targetType,
    targetId: String(targetId),
    targetPreview: {
      text: asString(targetPreviewRaw.text) ?? undefined,
      rating: asNumber(targetPreviewRaw.rating) ?? undefined,
      createdAt: asString(targetPreviewRaw.createdAt) ?? undefined,
      authorId:
        asNumber(targetPreviewRaw.authorId) ??
        asNumber(targetPreviewRaw.studentId) ??
        undefined,
      courseId: asNumber(targetPreviewRaw.courseId) ?? undefined,
      teacherId: asNumber(targetPreviewRaw.teacherId) ?? undefined,
    },
  }
}

const extractReports = (payload: unknown): ReportDto[] => {
  const direct = asArray(payload)
  if (direct) {
    return direct.map(normalizeReport).filter((item): item is ReportDto => item !== null)
  }

  if (payload && typeof payload === 'object') {
    const record = payload as Record<string, unknown>

    const reports = asArray(record.reports)
    if (reports) {
      return reports.map(normalizeReport).filter((item): item is ReportDto => item !== null)
    }

    const data = asArray(record.data)
    if (data) {
      return data.map(normalizeReport).filter((item): item is ReportDto => item !== null)
    }

    const items = asArray(record.items)
    if (items) {
      return items.map(normalizeReport).filter((item): item is ReportDto => item !== null)
    }

    if (record.data && typeof record.data === 'object') {
      const nested = record.data as Record<string, unknown>
      const nestedReports = asArray(nested.reports)
      if (nestedReports) {
        return nestedReports
          .map(normalizeReport)
          .filter((item): item is ReportDto => item !== null)
      }
      const nestedItems = asArray(nested.items)
      if (nestedItems) {
        return nestedItems.map(normalizeReport).filter((item): item is ReportDto => item !== null)
      }
    }
  }

  throw new Error('Invalid reports response format')
}

const extractErrorMessage = (error: unknown, fallback: string) => {
  if (
    error &&
    typeof error === 'object' &&
    'response' in error &&
    (error as { response?: unknown }).response
  ) {
    const response = (error as { response?: { data?: unknown; status?: number } }).response
    const payload = response?.data
    if (typeof payload === 'string' && payload.trim()) {
      return payload
    }
    if (payload && typeof payload === 'object') {
      const message = (payload as { message?: unknown }).message
      if (typeof message === 'string' && message.trim()) {
        return message
      }
    }
    if (typeof response?.status === 'number') {
      return `${fallback} (HTTP ${response.status})`
    }
  }
  if (error instanceof Error && error.message.trim()) {
    return error.message
  }
  return fallback
}

export const reportsApi = {
  listReports: async (status: ReportStatus) => {
    try {
      const response = await http.get<unknown>('/admin/reports', {
        params: { status },
      })
      return extractReports(response.data)
    } catch (error) {
      throw new Error(extractErrorMessage(error, 'Failed to load reports'))
    }
  },
  resolveReport: async (id: string) => {
    const response = await http.patch<ReportDto>(
      `/admin/reports/${id}/status`,
      JSON.stringify({ status: 'RESOLVED' }),
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )
    return response.data
  },
  rejectReport: async (id: string) => {
    const response = await http.patch<ReportDto>(
      `/admin/reports/${id}/status`,
      JSON.stringify({ status: 'REJECTED' }),
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )
    return response.data
  },
  removeTarget: async (id: string) => {
    const response = await http.post(
      `/admin/reports/${id}/remove-target`,
      JSON.stringify({}),
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )
    return response.data
  },
}
