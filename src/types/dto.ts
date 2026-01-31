export type Role = 'STUDENT' | 'STAFF' | 'ADMIN'

export interface MeResponse {
  id: number
  role: Role
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
  priceCents: number
  status: StudySheetStatus
  createdAt: string
  updatedAt: string
  courseId: number
  ownerId: number
}

export type LeaseListingStatus =
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED'
  | 'TRANSFERRED'

export interface LeaseListingDto {
  id: number
  title: string
  description: string
  location: string
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
  promptpayPayload: string
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
