export type Role = 'STUDENT' | 'STAFF' | 'ADMIN'

export interface MeResponse {
  id: number
  role: Role
  name?: string
  username?: string
  fullName?: string
  email?: string
  phone?: string
  bio?: string
  avatarUrl?: string
}

export interface AuthTokenResponse {
  access_token: string
}

export interface RegisterRequest {
  email: string
  name: string
  password: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface ProfileUpdateRequest {
  name?: string
  username?: string
  fullName?: string
  phone?: string
  bio?: string
  avatarUrl?: string
}

export interface ChangePasswordRequest {
  currentPassword: string
  newPassword: string
}

export interface ApiError {
  message: string
  error: string
  statusCode: number
}

export type StudySheetStatus = 'PENDING' | 'APPROVED' | 'REJECTED'

export interface StudySheetDto {
  id: number
  title: string
  description: string
  fileUrl: string
  price: number | null
  status: StudySheetStatus
  createdAt: string
  updatedAt: string
  courseId?: number
  courseCode?: string
  ownerId: number
}

export interface StudySheetCreateRequest {
  title: string
  description: string
  fileUrl: string
  priceCents: number
  courseCode: string
}

export interface StudySheetUpdateRequest {
  title?: string
  description?: string
  fileUrl?: string
  priceCents?: number
  courseCode?: string
}

export type LeaseListingStatus =
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED'

export interface LeaseListingDto {
  id: number
  title: string
  description: string
  location: string
  lineId?: string | null
  rentCents: number
  depositCents: number
  startDate: string
  endDate: string
  status: LeaseListingStatus
  createdAt: string
  updatedAt: string
  ownerId: number
}

export interface LeaseInterestResponse {
  id: number
  leaseListingId: number
  studentId: number
  createdAt: string
}

export interface StudySheetPurchaseResponse {
  paymentId: number
  referenceCode: string
  amountCents: number
}

export interface StudySheetPurchaseResponseRaw {
  id: number
  reference_code: string
  amount: number
}

export interface PurchasedStudySheetDto {
  purchaseId: number
  purchasedAt: string
  amountCents: number
  studySheet: {
    id: number
    title: string
    description?: string | null
    fileUrl: string
    priceCents: number
    status: string
    createdAt: string
    updatedAt: string
    ownerId: number
    courseId: number
    courseCode: string
  }
}

export type ReviewStatus = 'VISIBLE' | 'UNDER_REVIEW' | 'REMOVED'

export interface ReviewDto {
  id: number
  rating: number
  text: string
  status: ReviewStatus
  createdAt: string
  updatedAt: string
  studentId: number
  courseId: number
}

export interface TeacherDto {
  id: number
  name: string
}

export interface TeacherReviewDto {
  id: number
  rating: number
  text: string
  status: ReviewStatus
  createdAt: string
  updatedAt: string
  studentId: number
  courseId: number
  teacherId?: number
  teacherName: string
  upvotes?: number
}

export type TeacherSuggestionStatus = 'PENDING' | 'APPROVED' | 'REJECTED'

export interface TeacherSuggestionDto {
  id: number
  courseId: number
  teacherName: string
  status: TeacherSuggestionStatus
  suggestedById: number
  createdAt: string
  updatedAt: string
  reason?: string | null
}

export type PaymentStatus = 'PENDING' | 'APPROVED' | 'RELEASED'

export interface AdminPaymentDto {
  id: number
  purchaseId: number
  referenceCode: string
  amount: number
  status: PaymentStatus
  approvedAt: string | null
  releasedAt: string | null
  approvedById: number | null
  releasedById: number | null
  buyerId: number
  sellerId: number
  studySheetId: number
  createdAt: string
}

export interface PaymentDto {
  id: number
  amount: number
  status: PaymentStatus
  createdAt: string
  buyerId?: number
  sellerId?: number
  referenceCode?: string
}

export interface WalletSummaryDto {
  walletBalance: number
  totalEarned: number
  pendingPayout: number
}

export interface StudentDashboardSummaryDto {
  walletBalance: number
  mySales: {
    pendingPayoutCents: number
    releasedPayoutCents: number
    [key: string]: unknown
  }
  myPurchases: {
    totalSpentCents: number
    [key: string]: unknown
  }
  myLeases: Record<string, unknown>
  myReviews: Record<string, unknown>
  myStudySheets: Record<string, unknown>
}

export type WithdrawalStatus = 'PENDING' | 'APPROVED' | 'REJECTED'

export interface WithdrawalDto {
  id: number
  sellerId: number
  amount: number
  status: WithdrawalStatus
  reviewedById?: number
  reviewedAt?: string
  createdAt: string
  updatedAt: string
}
