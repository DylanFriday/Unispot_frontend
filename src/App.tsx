import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import AppLayout from './layouts/AppLayout'
import ProtectedRoute from './routes/ProtectedRoute'
import RoleRoute from './routes/RoleRoute'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ForbiddenPage from './pages/ForbiddenPage'
import NotFoundPage from './pages/NotFoundPage'
import ModerationPage from './pages/ModerationPage'
import StudySheetsPublicPage from './pages/StudySheetsPublicPage'
import LeaseListingsPublicPage from './pages/LeaseListingsPublicPage'
import CourseReviewsPage from './pages/reviews/CourseReviewsPage'
import StudentStudySheetsMinePage from './pages/StudentStudySheetsMinePage'
import StudentStudySheetsNewPage from './pages/StudentStudySheetsNewPage'
import StudentStudySheetsEditPage from './pages/StudentStudySheetsEditPage'
import StudentLeaseListingsMinePage from './pages/StudentLeaseListingsMinePage'
import StudentLeaseListingsNewPage from './pages/StudentLeaseListingsNewPage'
import StudySheetModerationPage from './pages/moderation/StudySheetModerationPage'
import LeaseModerationPage from './pages/moderation/LeaseModerationPage'
import PaymentsPage from './pages/admin/PaymentsPage'
import LeaseMarketplacePage from './pages/leases/LeaseMarketplacePage'
import MyLeaseListingsPage from './pages/leases/MyLeaseListingsPage'
import CoursesPage from './pages/courses/CoursesPage'
import ReviewModerationPage from './pages/moderation/ReviewModerationPage'
import TeacherReviewModerationPage from './pages/moderation/TeacherReviewModerationPage'
import TeacherSuggestionModerationPage from './pages/moderation/TeacherSuggestionModerationPage'
import WalletPage from './pages/wallet/WalletPage'
import DashboardPage from './pages/dashboard/DashboardPage'
import MyReviewsPage from './pages/reviews/MyReviewsPage'
import AdminWithdrawalsPage from './pages/admin/AdminWithdrawalsPage'
import ProfilePage from './pages/profile/ProfilePage'

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <AppLayout>
              <HomePage />
            </AppLayout>
          }
        />
        <Route
          path="/login"
          element={
            <AppLayout>
              <LoginPage />
            </AppLayout>
          }
        />
        <Route
          path="/register"
          element={
            <AppLayout>
              <RegisterPage />
            </AppLayout>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <AppLayout>
                <DashboardPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/*"
          element={
            <ProtectedRoute>
              <Navigate to="/dashboard" replace />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/study-sheets/mine"
          element={
            <ProtectedRoute>
              <AppLayout>
                <StudentStudySheetsMinePage />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/study-sheets/new"
          element={
            <ProtectedRoute>
              <AppLayout>
                <StudentStudySheetsNewPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/study-sheets/create"
          element={
            <ProtectedRoute>
              <RoleRoute allow={['STUDENT']}>
                <AppLayout>
                  <StudentStudySheetsNewPage />
                </AppLayout>
              </RoleRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/study-sheets/:id/edit"
          element={
            <ProtectedRoute>
              <AppLayout>
                <StudentStudySheetsEditPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/lease-listings/mine"
          element={
            <ProtectedRoute>
              <AppLayout>
                <StudentLeaseListingsMinePage />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/lease-listings/new"
          element={
            <ProtectedRoute>
              <AppLayout>
                <StudentLeaseListingsNewPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/moderation/*"
          element={
            <ProtectedRoute>
              <RoleRoute allow={['STAFF', 'ADMIN']}>
                <AppLayout>
                  <ModerationPage />
                </AppLayout>
              </RoleRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/moderation/study-sheets"
          element={
            <ProtectedRoute>
              <RoleRoute allow={['STAFF', 'ADMIN']}>
                <AppLayout>
                  <StudySheetModerationPage />
                </AppLayout>
              </RoleRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/moderation/lease-listings"
          element={
            <ProtectedRoute>
              <RoleRoute allow={['STAFF', 'ADMIN']}>
                <AppLayout>
                  <LeaseModerationPage />
                </AppLayout>
              </RoleRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/moderation/reviews"
          element={
            <ProtectedRoute>
              <RoleRoute allow={['STAFF', 'ADMIN']}>
                <AppLayout>
                  <ReviewModerationPage />
                </AppLayout>
              </RoleRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/moderation/teacher-reviews"
          element={
            <ProtectedRoute>
              <RoleRoute allow={['STAFF', 'ADMIN']}>
                <AppLayout>
                  <TeacherReviewModerationPage />
                </AppLayout>
              </RoleRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/moderation/teacher-suggestions"
          element={
            <ProtectedRoute>
              <RoleRoute allow={['STAFF', 'ADMIN']}>
                <AppLayout>
                  <TeacherSuggestionModerationPage />
                </AppLayout>
              </RoleRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <RoleRoute allow={['ADMIN']}>
                <AppLayout>
                  <PaymentsPage />
                </AppLayout>
              </RoleRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/payments"
          element={
            <ProtectedRoute>
              <RoleRoute allow={['ADMIN']}>
                <AppLayout>
                  <PaymentsPage />
                </AppLayout>
              </RoleRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/withdrawals"
          element={
            <ProtectedRoute>
              <RoleRoute allow={['ADMIN']}>
                <AppLayout>
                  <AdminWithdrawalsPage />
                </AppLayout>
              </RoleRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/forbidden"
          element={
            <AppLayout>
              <ForbiddenPage />
            </AppLayout>
          }
        />
        <Route
          path="/study-sheets"
          element={
            <AppLayout>
              <StudySheetsPublicPage />
            </AppLayout>
          }
        />
        <Route
          path="/lease-listings"
          element={
            <AppLayout>
              <LeaseListingsPublicPage />
            </AppLayout>
          }
        />
        <Route
          path="/leases"
          element={
            <AppLayout>
              <LeaseMarketplacePage />
            </AppLayout>
          }
        />
        <Route
          path="/leases/mine"
          element={
            <ProtectedRoute>
              <RoleRoute allow={['STUDENT']}>
                <AppLayout>
                  <MyLeaseListingsPage />
                </AppLayout>
              </RoleRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/wallet"
          element={
            <ProtectedRoute>
              <RoleRoute allow={['STUDENT']}>
                <AppLayout>
                  <WalletPage />
                </AppLayout>
              </RoleRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <AppLayout>
                <ProfilePage />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/courses/:courseId/reviews"
          element={
            <AppLayout>
              <CourseReviewsPage />
            </AppLayout>
          }
        />
        <Route
          path="/reviews/mine"
          element={
            <ProtectedRoute>
              <RoleRoute allow={['STUDENT']}>
                <AppLayout>
                  <MyReviewsPage />
                </AppLayout>
              </RoleRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/courses"
          element={
            <AppLayout>
              <CoursesPage />
            </AppLayout>
          }
        />
        <Route
          path="*"
          element={
            <AppLayout>
              <NotFoundPage />
            </AppLayout>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}

export default App
