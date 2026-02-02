import { useEffect, useMemo, useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { reviewsApi } from '../../api/reviews.api'
import { teacherReviewsApi } from '../../api/teacherReviews.api'
import { coursesApi } from '../../api/courses.api'
import type { ApiError, ReviewDto, TeacherReviewDto } from '../../types/dto'
import { useAuth } from '../../auth/useAuth'
import PageHeader from '../../components/PageHeader'
import Card from '../../components/Card'
import Badge from '../../components/Badge'
import Button from '../../components/Button'
import Alert from '../../components/Alert'
import Spinner from '../../components/Spinner'
import EmptyState from '../../components/EmptyState'
import Modal from '../../components/Modal'
import Input from '../../components/Input'
import StarRating from '../../components/StarRating'
import { formatDate } from '../../utils/format'

const statusVariant = (status: string) => {
  if (status === 'VISIBLE') return 'success'
  if (status === 'UNDER_REVIEW') return 'warning'
  return 'danger'
}

const CourseReviewsPage = () => {
  const { me } = useAuth()
  const params = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const queryClient = useQueryClient()
  const tabParam = searchParams.get('tab')
  const [activeTab, setActiveTab] = useState<'course' | 'teacher'>(
    tabParam === 'teacher' ? 'teacher' : 'course'
  )

  useEffect(() => {
    if (tabParam === 'teacher' || tabParam === 'course') {
      setActiveTab(tabParam)
    }
  }, [tabParam])

  const courseId = useMemo(
    () => Number(params.courseId ?? params.id),
    [params.courseId, params.id]
  )

  const { data: courses } = useQuery({
    queryKey: ['courses'],
    queryFn: () => coursesApi.listCourses(),
  })

  const course = courses?.find((item) => item.id === courseId)

  const {
    data: courseReviews,
    isLoading: isCourseLoading,
    error: courseError,
  } = useQuery({
    queryKey: ['courseReviews', courseId],
    queryFn: () => reviewsApi.listByCourse(courseId),
    enabled: Number.isFinite(courseId),
  })

  const myCourseReview = useMemo(
    () => courseReviews?.find((review) => review.studentId === me?.id) ?? null,
    [courseReviews, me?.id]
  )

  const [courseRating, setCourseRating] = useState(5)
  const [courseText, setCourseText] = useState('')
  const [courseFeedback, setCourseFeedback] = useState<{
    type: 'success' | 'error'
    message: string
  } | null>(null)
  const [courseReportTarget, setCourseReportTarget] = useState<ReviewDto | null>(null)
  const [courseReportReason, setCourseReportReason] = useState('')
  const [coursePendingId, setCoursePendingId] = useState<number | null>(null)
  const [courseSort, setCourseSort] = useState<'newest' | 'oldest' | 'highest' | 'lowest'>(
    'newest'
  )

  useEffect(() => {
    if (myCourseReview) {
      setCourseRating(myCourseReview.rating)
      setCourseText(myCourseReview.text)
    } else {
      setCourseRating(5)
      setCourseText('')
    }
  }, [myCourseReview])

  const createCourseMutation = useMutation({
    mutationFn: (payload: { courseId: number; rating: number; text: string }) =>
      reviewsApi.create(payload),
    onSuccess: () => {
      setCourseFeedback({ type: 'success', message: 'Review submitted' })
      void queryClient.invalidateQueries({
        queryKey: ['courseReviews', courseId],
      })
    },
    onError: (err) => {
      const message = (err as { response?: { data?: ApiError } })?.response
        ?.data?.message
      setCourseFeedback({ type: 'error', message: message ?? 'Submit failed' })
    },
  })

  const updateCourseMutation = useMutation({
    mutationFn: (payload: { id: number; rating: number; text: string }) =>
      reviewsApi.update(payload.id, { rating: payload.rating, text: payload.text }),
    onSuccess: () => {
      setCourseFeedback({ type: 'success', message: 'Review updated' })
      void queryClient.invalidateQueries({
        queryKey: ['courseReviews', courseId],
      })
    },
    onError: (err) => {
      const message = (err as { response?: { data?: ApiError } })?.response
        ?.data?.message
      setCourseFeedback({ type: 'error', message: message ?? 'Update failed' })
    },
  })

  const deleteCourseMutation = useMutation({
    mutationFn: (id: number) => reviewsApi.remove(id),
    onSuccess: () => {
      setCourseFeedback({ type: 'success', message: 'Review deleted' })
      void queryClient.invalidateQueries({
        queryKey: ['courseReviews', courseId],
      })
    },
  })

  const reportCourseMutation = useMutation({
    mutationFn: (payload: { id: number; reason?: string }) =>
      reviewsApi.report(payload.id, payload.reason ? { reason: payload.reason } : undefined),
    onSuccess: () => {
      setCourseReportTarget(null)
      setCourseReportReason('')
      setCourseFeedback({ type: 'success', message: 'Report submitted' })
      void queryClient.invalidateQueries({
        queryKey: ['courseReviews', courseId],
      })
    },
  })

  const upvoteCourseMutation = useMutation({
    mutationFn: (id: number) => reviewsApi.upvote(id),
    onMutate: (id) => setCoursePendingId(id),
    onSuccess: () => {
      setCoursePendingId(null)
      void queryClient.invalidateQueries({
        queryKey: ['courseReviews', courseId],
      })
    },
    onError: () => setCoursePendingId(null),
  })

  const removeUpvoteCourseMutation = useMutation({
    mutationFn: (id: number) => reviewsApi.removeUpvote(id),
    onMutate: (id) => setCoursePendingId(id),
    onSuccess: () => {
      setCoursePendingId(null)
      void queryClient.invalidateQueries({
        queryKey: ['courseReviews', courseId],
      })
    },
    onError: () => setCoursePendingId(null),
  })

  const handleCourseSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    const payload = {
      courseId,
      rating: courseRating,
      text: courseText,
    }

    if (myCourseReview) {
      updateCourseMutation.mutate({
        id: myCourseReview.id,
        rating: payload.rating,
        text: payload.text,
      })
    } else {
      createCourseMutation.mutate(payload)
    }
  }

  const courseErrorMessage = (courseError as { response?: { data?: ApiError } })?.response
    ?.data?.message

  const sortedCourseReviews = useMemo(() => {
    if (!courseReviews) return []
    const withIndex = courseReviews.map((review, index) => ({ review, index }))
    withIndex.sort((a, b) => {
      if (courseSort === 'newest') {
        return (
          new Date(b.review.createdAt).getTime() -
            new Date(a.review.createdAt).getTime() ||
          a.index - b.index
        )
      }
      if (courseSort === 'oldest') {
        return (
          new Date(a.review.createdAt).getTime() -
            new Date(b.review.createdAt).getTime() ||
          a.index - b.index
        )
      }
      if (courseSort === 'highest') {
        return b.review.rating - a.review.rating || a.index - b.index
      }
      return a.review.rating - b.review.rating || a.index - b.index
    })
    return withIndex.map(({ review }) => review)
  }, [courseReviews, courseSort])

  const teacherMode = me?.role === 'STUDENT' ? 'me' : 'public'
  const {
    data: teacherReviews,
    isLoading: isTeacherLoading,
    error: teacherError,
    refetch: refetchTeacherReviews,
  } = useQuery({
    queryKey: ['courseTeacherReviews', courseId, teacherMode, me?.id],
    queryFn: () => teacherReviewsApi.listCourseTeacherReviews(courseId, teacherMode),
    enabled: Number.isFinite(courseId),
  })

  const [teacherName, setTeacherName] = useState('')
  const [teacherRating, setTeacherRating] = useState(5)
  const [teacherText, setTeacherText] = useState('')
  const [teacherFeedback, setTeacherFeedback] = useState<{
    type: 'success' | 'error'
    message: string
  } | null>(null)
  const [teacherReportTarget, setTeacherReportTarget] = useState<TeacherReviewDto | null>(null)
  const [teacherReportReason, setTeacherReportReason] = useState('')
  const [teacherPendingId, setTeacherPendingId] = useState<number | null>(null)
  const [teacherDeleteTarget, setTeacherDeleteTarget] = useState<TeacherReviewDto | null>(null)
  const createTeacherMutation = useMutation({
    mutationFn: (payload: {
      courseId: number
      teacherName: string
      rating: number
      text: string
    }) => teacherReviewsApi.createTeacherReview(payload),
    onSuccess: () => {
      setTeacherFeedback({ type: 'success', message: 'Submitted for moderation.' })
      setTeacherName('')
      setTeacherRating(5)
      setTeacherText('')
      void queryClient.invalidateQueries({
        queryKey: ['courseTeacherReviews', courseId, teacherMode, me?.id],
      })
    },
    onError: (err) => {
      const status = (err as { response?: { status?: number } })?.response?.status
      const message = (err as { response?: { data?: ApiError } })?.response
        ?.data?.message
      if (status === 409 || message?.toLowerCase().includes('already')) {
        setTeacherFeedback({
          type: 'error',
          message: 'You already reviewed this teacher for this course.',
        })
        return
      }
      setTeacherFeedback({ type: 'error', message: message ?? 'Submit failed' })
    },
  })

  const updateTeacherMutation = useMutation({
    mutationFn: (payload: { id: number; rating: number; text: string }) =>
      teacherReviewsApi.updateTeacherReview(payload.id, {
        rating: payload.rating,
        text: payload.text,
      }),
    onSuccess: () => {
      setTeacherFeedback({ type: 'success', message: 'Review updated.' })
      void queryClient.invalidateQueries({
        queryKey: ['courseTeacherReviews', courseId, teacherMode, me?.id],
      })
    },
    onError: (err) => {
      const message = (err as { response?: { data?: ApiError } })?.response
        ?.data?.message
      setTeacherFeedback({ type: 'error', message: message ?? 'Update failed' })
    },
  })

  const deleteTeacherMutation = useMutation({
    mutationFn: (id: number) => teacherReviewsApi.deleteReview(id),
    onSuccess: () => {
      setTeacherDeleteTarget(null)
      setTeacherFeedback({ type: 'success', message: 'Review deleted.' })
      void queryClient.invalidateQueries({
        queryKey: ['courseTeacherReviews', courseId, teacherMode, me?.id],
      })
    },
  })

  const reportTeacherMutation = useMutation({
    mutationFn: (payload: { id: number; reason?: string }) =>
      teacherReviewsApi.report(payload.id, payload.reason ? { reason: payload.reason } : undefined),
    onSuccess: () => {
      setTeacherReportTarget(null)
      setTeacherReportReason('')
      setTeacherFeedback({ type: 'success', message: 'Report submitted' })
      void queryClient.invalidateQueries({
        queryKey: ['courseTeacherReviews', courseId, teacherMode, me?.id],
      })
    },
  })

  const upvoteTeacherMutation = useMutation({
    mutationFn: (id: number) => teacherReviewsApi.upvote(id),
    onMutate: (id) => setTeacherPendingId(id),
    onSuccess: (_, id) => {
      setTeacherPendingId(null)
      setUpvotedIds((prev) => new Set(prev).add(id))
      setTeacherFeedback({ type: 'success', message: 'Upvoted.' })
      void queryClient.invalidateQueries({
        queryKey: ['courseTeacherReviews', courseId, teacherMode, me?.id],
      })
    },
    onError: () => setTeacherPendingId(null),
  })
  const removeUpvoteTeacherMutation = useMutation({
    mutationFn: (id: number) => teacherReviewsApi.removeUpvote(id),
    onMutate: (id) => setTeacherPendingId(id),
    onSuccess: (data, id) => {
      setTeacherPendingId(null)
      setUpvotedIds((prev) => {
        const next = new Set(prev)
        next.delete(id)
        return next
      })
      setTeacherFeedback({ type: 'success', message: 'Upvote removed.' })
      void queryClient.invalidateQueries({
        queryKey: ['courseTeacherReviews', courseId, teacherMode, me?.id],
      })
    },
    onError: () => setTeacherPendingId(null),
  })

  const teacherErrorMessage = (teacherError as { response?: { data?: ApiError } })?.response
    ?.data?.message
  const normalizeTeacherName = (name: string) => name.trim().toLowerCase()

  const teacherGroups = useMemo(() => {
    if (!teacherReviews) return []
    const groups = new Map<
      string,
      {
        teacherName: string
        normalized: string
        reviews: TeacherReviewDto[]
        average: number
      }
    >()
    teacherReviews.forEach((review) => {
      const rawName = review.teacherName?.trim() || 'Unknown Teacher'
      const normalized = normalizeTeacherName(rawName)
      const existing = groups.get(normalized)
      if (existing) {
        existing.reviews.push(review)
      } else {
        groups.set(normalized, {
          teacherName: rawName,
          normalized,
          reviews: [review],
          average: 0,
        })
      }
    })
    return Array.from(groups.values())
      .map((group) => {
        const total = group.reviews.reduce((sum, review) => sum + review.rating, 0)
        return {
          ...group,
          average: group.reviews.length ? total / group.reviews.length : 0,
        }
      })
      .sort((a, b) => a.teacherName.localeCompare(b.teacherName))
  }, [teacherReviews])

  const [selectedTeacherName, setSelectedTeacherName] = useState<string | null>(null)
  const [upvotedIds, setUpvotedIds] = useState<Set<number>>(new Set())
  const teacherParam = searchParams.get('teacher')

  useEffect(() => {
    if (teacherGroups.length === 0) return
    const normalizedParam = teacherParam ? normalizeTeacherName(teacherParam) : ''
    const match =
      teacherGroups.find((group) => group.normalized === normalizedParam) ??
      teacherGroups[0]
    if (selectedTeacherName !== match.teacherName) {
      setSelectedTeacherName(match.teacherName)
    }
    if (teacherParam !== match.teacherName) {
      const nextParams = new URLSearchParams(searchParams)
      if (activeTab === 'teacher') {
        nextParams.set('tab', 'teacher')
      }
      nextParams.set('teacher', match.teacherName)
      setSearchParams(nextParams, { replace: true })
    }
  }, [
    activeTab,
    teacherGroups,
    teacherParam,
    searchParams,
    selectedTeacherName,
    setSearchParams,
  ])

  const selectedGroup = useMemo(() => {
    if (!selectedTeacherName) return null
    const normalized = normalizeTeacherName(selectedTeacherName)
    return teacherGroups.find((group) => group.normalized === normalized) ?? null
  }, [teacherGroups, selectedTeacherName])

  const myTeacherReviewForSelected = useMemo(() => {
    if (!teacherReviews || !me?.id || !selectedTeacherName) return null
    const normalized = normalizeTeacherName(selectedTeacherName)
    return (
      teacherReviews.find(
        (review) =>
          review.studentId === me.id &&
          normalizeTeacherName(review.teacherName) === normalized
      ) ?? null
    )
  }, [teacherReviews, me?.id, selectedTeacherName])

  const myTeacherReviewForInput = useMemo(() => {
    if (!teacherReviews || !me?.id) return null
    const normalized = normalizeTeacherName(teacherName)
    if (!normalized) return null
    return (
      teacherReviews.find(
        (review) =>
          review.studentId === me.id &&
          normalizeTeacherName(review.teacherName) === normalized
      ) ?? null
    )
  }, [teacherReviews, me?.id, teacherName])

  const handleTeacherSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    if (!Number.isFinite(courseId)) return
    const name = teacherName.trim()
    if (!name) {
      setTeacherFeedback({ type: 'error', message: 'Please enter a teacher name.' })
      return
    }
    if (myTeacherReviewForInput) {
      updateTeacherMutation.mutate({
        id: myTeacherReviewForInput.id,
        rating: teacherRating,
        text: teacherText,
      })
      return
    }
    createTeacherMutation.mutate({
      courseId,
      teacherName: name,
      rating: teacherRating,
      text: teacherText,
    })
  }

  useEffect(() => {
    if (!selectedTeacherName) return
    setTeacherName(selectedTeacherName)
    if (myTeacherReviewForSelected) {
      setTeacherRating(myTeacherReviewForSelected.rating)
      setTeacherText(myTeacherReviewForSelected.text)
    } else {
      setTeacherRating(5)
      setTeacherText('')
    }
    setUpvotedIds(new Set())
  }, [selectedTeacherName, myTeacherReviewForSelected])

  const selectedReviews = useMemo(() => {
    if (!selectedGroup) return []
    return [...selectedGroup.reviews].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
  }, [selectedGroup])

  const handleTabChange = (tab: 'course' | 'teacher') => {
    setActiveTab(tab)
    const nextParams = new URLSearchParams(searchParams)
    nextParams.set('tab', tab)
    setSearchParams(nextParams)
  }

  const handleTeacherSelect = (teacherName: string) => {
    setSelectedTeacherName(teacherName)
    const nextParams = new URLSearchParams(searchParams)
    nextParams.set('tab', 'teacher')
    nextParams.set('teacher', teacherName)
    setSearchParams(nextParams)
  }

  const courseTitle = course
    ? `${course.code} · ${course.name}`
    : `Course ID: ${params.courseId ?? params.id}`

  return (
    <div className="space-y-6">
      <PageHeader title="Course Reviews" subtitle={courseTitle} />

      <div className="flex gap-2">
        <Button
          variant={activeTab === 'course' ? 'primary' : 'secondary'}
          onClick={() => handleTabChange('course')}
        >
          Course Reviews
        </Button>
        <Button
          variant={activeTab === 'teacher' ? 'primary' : 'secondary'}
          onClick={() => handleTabChange('teacher')}
        >
          Teacher Reviews
        </Button>
      </div>

      {activeTab === 'course' ? (
        <div className="space-y-6">
          {courseFeedback ? (
            <Alert
              message={courseFeedback.message}
              tone={courseFeedback.type === 'success' ? 'info' : 'error'}
            />
          ) : null}

          {me?.role === 'STUDENT' ? (
            <Card className="space-y-4">
              <div className="space-y-1">
                <h2 className="text-lg font-semibold text-gray-900">
                  Write or edit your course review
                </h2>
                <p className="text-sm text-gray-600">
                  Share your experience to help other students.
                </p>
              </div>
              <form className="space-y-4" onSubmit={handleCourseSubmit}>
                <div className="space-y-2">
                  <span className="text-sm font-medium text-gray-700">Your rating</span>
                  <div className="flex flex-wrap items-center gap-3">
                    <StarRating value={courseRating} onChange={setCourseRating} size="lg" />
                    <span className="text-sm text-gray-600">{courseRating}/5</span>
                  </div>
                  <input type="hidden" name="rating" value={courseRating} />
                </div>
                <label className="block text-sm">
                  <span className="mb-1 block font-medium">Review</span>
                  <textarea
                    className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-ink focus:outline-none focus:ring-2 focus:ring-ink/20"
                    rows={4}
                    value={courseText}
                    onChange={(event) => setCourseText(event.target.value)}
                    placeholder="Share your experience"
                  />
                </label>
                <div className="flex gap-2">
                  <Button
                    type="submit"
                    disabled={createCourseMutation.isPending || updateCourseMutation.isPending}
                  >
                    {myCourseReview ? 'Update Review' : 'Submit Review'}
                  </Button>
                  {myCourseReview ? (
                    <Button
                      variant="danger"
                      type="button"
                      onClick={() => deleteCourseMutation.mutate(myCourseReview.id)}
                      disabled={deleteCourseMutation.isPending}
                    >
                      {deleteCourseMutation.isPending ? 'Deleting...' : 'Delete'}
                    </Button>
                  ) : null}
                </div>
              </form>
            </Card>
          ) : (
            <Alert
              message={
                me ? 'Only students can write course reviews.' : 'Login to write a review.'
              }
              tone="info"
            />
          )}

          {isCourseLoading ? (
            <div className="flex min-h-[40vh] items-center justify-center">
              <Spinner />
            </div>
          ) : courseErrorMessage ? (
            <div className="space-y-3">
              <Alert message={courseErrorMessage} tone="error" />
              <Button variant="secondary" onClick={() => queryClient.invalidateQueries({
                queryKey: ['courseReviews', courseId],
              })}>
                Retry
              </Button>
            </div>
          ) : sortedCourseReviews.length > 0 ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm text-gray-600">
                  {sortedCourseReviews.length} reviews
                </p>
                <div className="flex items-center gap-2">
                  <label className="text-xs font-semibold uppercase text-gray-500" htmlFor="course-sort">
                    Sort
                  </label>
                  <select
                    id="course-sort"
                    className="rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900"
                    value={courseSort}
                    onChange={(event) =>
                      setCourseSort(
                        event.target.value as 'newest' | 'oldest' | 'highest' | 'lowest'
                      )
                    }
                  >
                    <option value="newest">Newest</option>
                    <option value="oldest">Oldest</option>
                    <option value="highest">Highest rating</option>
                    <option value="lowest">Lowest rating</option>
                  </select>
                </div>
              </div>
              {sortedCourseReviews.map((review) => (
                <Card key={review.id} className="space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <StarRating value={review.rating} readOnly size="sm" />
                      <span className="text-sm font-semibold text-gray-900">
                        {review.rating}/5
                      </span>
                      <Badge label={review.status} variant={statusVariant(review.status)} />
                    </div>
                    <span className="text-xs text-gray-500">
                      {formatDate(review.createdAt)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700">{review.text}</p>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="secondary"
                      onClick={() => upvoteCourseMutation.mutate(review.id)}
                      disabled={coursePendingId === review.id && upvoteCourseMutation.isPending}
                    >
                      {coursePendingId === review.id && upvoteCourseMutation.isPending
                        ? 'Upvoting...'
                        : 'Upvote'}
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => removeUpvoteCourseMutation.mutate(review.id)}
                      disabled={coursePendingId === review.id && removeUpvoteCourseMutation.isPending}
                    >
                      {coursePendingId === review.id && removeUpvoteCourseMutation.isPending
                        ? 'Removing...'
                        : 'Remove Upvote'}
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => setCourseReportTarget(review)}
                    >
                      Report
                    </Button>
                    {review.studentId === me?.id ? (
                      <Button
                        variant="danger"
                        onClick={() => deleteCourseMutation.mutate(review.id)}
                        disabled={deleteCourseMutation.isPending}
                      >
                        {deleteCourseMutation.isPending ? 'Deleting...' : 'Delete'}
                      </Button>
                    ) : null}
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <EmptyState
              title="No reviews yet"
              description="Be the first to leave a review."
            />
          )}

          <Modal
            open={Boolean(courseReportTarget)}
            title="Report review"
            onClose={() => {
              setCourseReportTarget(null)
              setCourseReportReason('')
            }}
            footer={
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  onClick={() => {
                    setCourseReportTarget(null)
                    setCourseReportReason('')
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() =>
                    courseReportTarget &&
                    reportCourseMutation.mutate({
                      id: courseReportTarget.id,
                      reason: courseReportReason.trim() || undefined,
                    })
                  }
                  disabled={reportCourseMutation.isPending}
                >
                  {reportCourseMutation.isPending ? 'Submitting...' : 'Report'}
                </Button>
              </div>
            }
          >
            <div className="space-y-3">
              <p className="text-sm text-gray-600">
                Optional: provide a reason for reporting.
              </p>
              <Input
                label="Reason"
                value={courseReportReason}
                onChange={(event) => setCourseReportReason(event.target.value)}
                placeholder="Optional reason"
              />
            </div>
          </Modal>
        </div>
      ) : (
        <div className="space-y-6">
          {teacherFeedback ? (
            <Alert
              message={teacherFeedback.message}
              tone={teacherFeedback.type === 'success' ? 'info' : 'error'}
            />
          ) : null}

          {me?.role === 'STUDENT' ? (
            <Card className="space-y-4">
              <div className="space-y-1">
                <h2 className="text-lg font-semibold text-gray-900">
                  Write / Edit your review for this teacher
                </h2>
                <p className="text-sm text-gray-600">
                  Your review will be visible after moderation.
                </p>
              </div>
              <form className="space-y-4" onSubmit={handleTeacherSubmit}>
                <Input
                  label="Teacher name"
                  value={teacherName}
                  onChange={(event) => setTeacherName(event.target.value)}
                  placeholder="e.g. Prof. Jane Doe"
                />
                <div className="space-y-2">
                  <span className="text-sm font-medium text-gray-700">Your rating</span>
                  <div className="flex flex-wrap items-center gap-3">
                    <StarRating value={teacherRating} onChange={setTeacherRating} size="lg" />
                    <span className="text-sm text-gray-600">{teacherRating}/5</span>
                  </div>
                  <input type="hidden" name="rating" value={teacherRating} />
                </div>
                <label className="block text-sm">
                  <span className="mb-1 block font-medium">Review</span>
                  <textarea
                    className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-ink focus:outline-none focus:ring-2 focus:ring-ink/20"
                    rows={4}
                    value={teacherText}
                    onChange={(event) => setTeacherText(event.target.value)}
                    placeholder="Share your experience"
                  />
                </label>
                <div className="flex gap-2">
                  <Button
                    type="submit"
                    disabled={createTeacherMutation.isPending || updateTeacherMutation.isPending}
                  >
                    {myTeacherReviewForInput ? 'Update Review' : 'Submit Review'}
                  </Button>
                  {myTeacherReviewForInput ? (
                    <Button
                      variant="danger"
                      type="button"
                      onClick={() => setTeacherDeleteTarget(myTeacherReviewForInput)}
                      disabled={deleteTeacherMutation.isPending}
                    >
                      {deleteTeacherMutation.isPending ? 'Deleting...' : 'Delete'}
                    </Button>
                  ) : null}
                </div>
              </form>
            </Card>
          ) : (
            <Alert
              message={
                me ? 'Only students can write teacher reviews.' : 'Login to write a review.'
              }
              tone="info"
            />
          )}

          {isTeacherLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, index) => (
                <Card key={`review-skeleton-${index}`} className="space-y-3">
                  <div className="h-4 w-48 animate-pulse rounded bg-gray-200" />
                  <div className="h-3 w-full animate-pulse rounded bg-gray-100" />
                  <div className="h-3 w-2/3 animate-pulse rounded bg-gray-100" />
                </Card>
              ))}
            </div>
          ) : teacherErrorMessage ? (
            <div className="space-y-3">
              <Alert message={teacherErrorMessage} tone="error" />
              <Button variant="secondary" onClick={() => refetchTeacherReviews()}>
                Retry
              </Button>
            </div>
          ) : teacherGroups.length > 0 ? (
            <div className="grid gap-6 lg:grid-cols-[260px,1fr]">
              <Card className="space-y-3">
                <div className="space-y-1">
                  <h3 className="text-sm font-semibold text-gray-900">Teachers</h3>
                  <p className="text-xs text-gray-600">
                    Select a teacher to view reviews.
                  </p>
                </div>
                <div className="max-h-80 space-y-2 overflow-y-auto pr-1">
                  {teacherGroups.map((group) => {
                    const isSelected = selectedGroup?.normalized === group.normalized
                    return (
                      <button
                        key={group.normalized}
                        type="button"
                        className={`w-full rounded-lg border px-3 py-2 text-left text-sm transition ${
                          isSelected
                            ? 'border-ink bg-ink/5 text-gray-900'
                            : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                        }`}
                        onClick={() => handleTeacherSelect(group.teacherName)}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-semibold">{group.teacherName}</span>
                          <span className="text-xs text-gray-500">
                            {group.average.toFixed(1)}
                          </span>
                        </div>
                        <div className="mt-1 text-xs text-gray-500">
                          {group.reviews.length} reviews
                        </div>
                      </button>
                    )
                  })}
                </div>
              </Card>

              <div className="space-y-4">
                {selectedGroup ? (
                  <Card className="space-y-4">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {selectedGroup.teacherName}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {selectedGroup.reviews.length} reviews
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-3xl font-semibold text-gray-900">
                          {selectedGroup.average.toFixed(1)}
                        </p>
                        <StarRating value={selectedGroup.average} readOnly size="sm" />
                      </div>
                    </div>
                  </Card>
                ) : null}

                {selectedReviews.length > 0 ? (
                  <div className="space-y-3">
                    {selectedReviews.map((review) => {
                      const isUnderReview =
                        review.status === 'UNDER_REVIEW' && review.studentId === me?.id
                      const isUpvotePending = teacherPendingId === review.id
                      const isUpvoted = upvotedIds.has(review.id)

                      return (
                        <Card key={review.id} className="space-y-3">
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <StarRating value={review.rating} readOnly size="sm" />
                              <span className="text-sm font-semibold text-gray-900">
                                {review.rating}/5
                              </span>
                              {review.status ? (
                                <Badge
                                  label={review.status}
                                  variant={statusVariant(review.status)}
                                />
                              ) : null}
                            </div>
                            <span className="text-xs text-gray-500">
                              {formatDate(review.createdAt)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700">{review.text}</p>
                          <div className="flex flex-wrap items-center gap-2">
                            <Button
                              variant="secondary"
                              onClick={() =>
                                isUpvoted
                                  ? removeUpvoteTeacherMutation.mutate(review.id)
                                  : upvoteTeacherMutation.mutate(review.id)
                              }
                              disabled={isUnderReview || isUpvotePending}
                            >
                              {isUpvotePending
                                ? 'Working...'
                                : isUpvoted
                                  ? 'Remove Upvote'
                                  : 'Upvote'}
                            </Button>
                            <Button
                              variant="secondary"
                              onClick={() => setTeacherReportTarget(review)}
                              disabled={isUnderReview}
                            >
                              Report
                            </Button>
                            {review.studentId === me?.id ? (
                              <Button
                                variant="danger"
                                onClick={() => setTeacherDeleteTarget(review)}
                              >
                                Delete
                              </Button>
                            ) : null}
                            {isUnderReview ? (
                              <span className="text-xs text-amber-600">
                                Under review
                              </span>
                            ) : null}
                          </div>
                        </Card>
                      )
                    })}
                  </div>
                ) : (
                  <EmptyState
                    title="No teacher reviews yet"
                    description="No reviews yet - be the first."
                  />
                )}
              </div>
            </div>
          ) : (
            <EmptyState
              title="No teacher reviews yet"
              description="No reviews yet - be the first."
            />
          )}

          <Modal
            open={Boolean(teacherReportTarget)}
            title="Report review"
            onClose={() => {
              setTeacherReportTarget(null)
              setTeacherReportReason('')
            }}
            footer={
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  onClick={() => {
                    setTeacherReportTarget(null)
                    setTeacherReportReason('')
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() =>
                    teacherReportTarget &&
                    reportTeacherMutation.mutate({
                      id: teacherReportTarget.id,
                      reason: teacherReportReason.trim() || undefined,
                    })
                  }
                  disabled={reportTeacherMutation.isPending}
                >
                  {reportTeacherMutation.isPending ? 'Submitting...' : 'Report'}
                </Button>
              </div>
            }
          >
            <div className="space-y-3">
              <p className="text-sm text-gray-600">
                Optional: provide a reason for reporting.
              </p>
              <Input
                label="Reason"
                value={teacherReportReason}
                onChange={(event) => setTeacherReportReason(event.target.value)}
                placeholder="Optional reason"
              />
            </div>
          </Modal>

          <Modal
            open={Boolean(teacherDeleteTarget)}
            title="Delete review"
            onClose={() => setTeacherDeleteTarget(null)}
            footer={
              <div className="flex gap-2">
                <Button variant="secondary" onClick={() => setTeacherDeleteTarget(null)}>
                  Cancel
                </Button>
                <Button
                  variant="danger"
                  onClick={() =>
                    teacherDeleteTarget &&
                    deleteTeacherMutation.mutate(teacherDeleteTarget.id)
                  }
                  disabled={deleteTeacherMutation.isPending}
                >
                  {deleteTeacherMutation.isPending ? 'Deleting...' : 'Delete'}
                </Button>
              </div>
            }
          >
            Are you sure you want to delete this review?
          </Modal>
        </div>
      )}
    </div>
  )
}

export default CourseReviewsPage
