import { BrowserRouter, Routes, Route } from 'react-router-dom'
import AppShell from './layouts/AppShell'
import ProtectedRoute from './routes/ProtectedRoute'
import RoleRoute from './routes/RoleRoute'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ForbiddenPage from './pages/ForbiddenPage'
import NotFoundPage from './pages/NotFoundPage'
import StudentPage from './pages/StudentPage'
import ModerationPage from './pages/ModerationPage'
import StudySheetsPublicPage from './pages/StudySheetsPublicPage'
import LeaseListingsPublicPage from './pages/LeaseListingsPublicPage'
import CourseReviewsPage from './pages/CourseReviewsPage'
import StudentStudySheetsMinePage from './pages/StudentStudySheetsMinePage'
import StudentStudySheetsNewPage from './pages/StudentStudySheetsNewPage'
import StudentStudySheetsEditPage from './pages/StudentStudySheetsEditPage'
import StudentLeaseListingsMinePage from './pages/StudentLeaseListingsMinePage'
import StudentLeaseListingsNewPage from './pages/StudentLeaseListingsNewPage'
import StudySheetModerationPage from './pages/moderation/StudySheetModerationPage'
import LeaseModerationPage from './pages/moderation/LeaseModerationPage'
import AdminDashboardPage from './pages/admin/AdminDashboardPage'
import PaymentsPage from './pages/admin/PaymentsPage'
import LeaseMarketplacePage from './pages/leases/LeaseMarketplacePage'
import MyLeaseListingsPage from './pages/leases/MyLeaseListingsPage'

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <AppShell>
              <HomePage />
            </AppShell>
          }
        />
        <Route
          path="/login"
          element={
            <AppShell>
              <LoginPage />
            </AppShell>
          }
        />
        <Route
          path="/register"
          element={
            <AppShell>
              <RegisterPage />
            </AppShell>
          }
        />
        <Route
          path="/student/*"
          element={
            <ProtectedRoute>
              <AppShell>
                <StudentPage />
              </AppShell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/study-sheets/mine"
          element={
            <ProtectedRoute>
              <AppShell>
                <StudentStudySheetsMinePage />
              </AppShell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/study-sheets/new"
          element={
            <ProtectedRoute>
              <AppShell>
                <StudentStudySheetsNewPage />
              </AppShell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/study-sheets/:id/edit"
          element={
            <ProtectedRoute>
              <AppShell>
                <StudentStudySheetsEditPage />
              </AppShell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/lease-listings/mine"
          element={
            <ProtectedRoute>
              <AppShell>
                <StudentLeaseListingsMinePage />
              </AppShell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/lease-listings/new"
          element={
            <ProtectedRoute>
              <AppShell>
                <StudentLeaseListingsNewPage />
              </AppShell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/moderation/*"
          element={
            <ProtectedRoute>
              <RoleRoute allow={['STAFF', 'ADMIN']}>
                <AppShell>
                  <ModerationPage />
                </AppShell>
              </RoleRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/moderation/study-sheets"
          element={
            <ProtectedRoute>
              <RoleRoute allow={['STAFF', 'ADMIN']}>
                <AppShell>
                  <StudySheetModerationPage />
                </AppShell>
              </RoleRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/moderation/lease-listings"
          element={
            <ProtectedRoute>
              <RoleRoute allow={['STAFF', 'ADMIN']}>
                <AppShell>
                  <LeaseModerationPage />
                </AppShell>
              </RoleRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute>
              <RoleRoute allow={['ADMIN']}>
                <AppShell>
                  <AdminDashboardPage />
                </AppShell>
              </RoleRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/payments"
          element={
            <ProtectedRoute>
              <RoleRoute allow={['ADMIN']}>
                <AppShell>
                  <PaymentsPage />
                </AppShell>
              </RoleRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/forbidden"
          element={
            <AppShell>
              <ForbiddenPage />
            </AppShell>
          }
        />
        <Route
          path="/study-sheets"
          element={
            <AppShell>
              <StudySheetsPublicPage />
            </AppShell>
          }
        />
        <Route
          path="/lease-listings"
          element={
            <AppShell>
              <LeaseListingsPublicPage />
            </AppShell>
          }
        />
        <Route
          path="/leases"
          element={
            <AppShell>
              <LeaseMarketplacePage />
            </AppShell>
          }
        />
        <Route
          path="/leases/mine"
          element={
            <ProtectedRoute>
              <RoleRoute allow={['STUDENT']}>
                <AppShell>
                  <MyLeaseListingsPage />
                </AppShell>
              </RoleRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/courses/:id/reviews"
          element={
            <AppShell>
              <CourseReviewsPage />
            </AppShell>
          }
        />
        <Route
          path="*"
          element={
            <AppShell>
              <NotFoundPage />
            </AppShell>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}

export default App
