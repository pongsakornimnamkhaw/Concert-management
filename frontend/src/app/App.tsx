import { useState } from 'react'
import { Route, Routes } from 'react-router-dom'
import ConsertReportPage from '@/ConsertReportPage'

// B6728786 - Frontend (Ticket Booking & Auth Guards)
import LoginPage from '@/features/auth/pages/CustomerLogin'
import ForgotPasswordPage from '@/features/auth/pages/CustomerForgotPassword'
import ResetPasswordPage from '@/features/auth/pages/CustomerResetPassword'
import RegisterPage from '@/features/auth/pages/CustomerRegister'
import EmployeeLoginPage from '@/features/auth/pages/EmployeeLogin'
import CustomerRouteGuard from '@/features/auth/components/CustomerRouteGuard'
import EmployeeRouteGuard from '@/features/auth/components/EmployeeRouteGuard'
import HomePage from '@/features/concert/pages/Home'
import EventsPage from '@/features/concert/pages/Events'
import IntroPage from '@/features/concert/pages/Intro'
import EventDetailPage from '@/features/concert/pages/EventDetail'
import ZoneSelectionPage from '@/features/booking/pages/ZoneSelection'
import SeatSelectionPage from '@/features/booking/pages/SeatSelection'
import CustomerAccountPage from '@/features/booking/pages/CustomerAccount'
import CustomerPromotionsPage from '@/features/promotion/pages/CustomerPromotions'
import CustomerPromotionDetailPage from '@/features/promotion/pages/CustomerPromotionDetail'
import SalesBookingManagementPage from '@/features/booking/pages/SalesBookingManagement'

// B6707651 - Frontend (Concert Management)
import Layout from '@/layouts/backoffice/Layout'
import DashboardPage from '@/features/concert/pages/ConcertDashboard'
import AddConcertPage from '@/features/concert/pages/AddConcert'
import EditConcertPage from '@/features/concert/pages/EditConcert'
import ResponsibilityPage from '@/features/concert/pages/Responsibility'
import ConcertStatusPage from '@/features/concert/pages/ConcertStatus'
import DocumentsPage from '@/features/concert/pages/AddDocument'
import EditHistoryPage from '@/features/concert/pages/ConcertEditHistory'
import SearchConcertPage from '@/features/ticketPlanning/TicketPlanningModule'
import ConcertSearchPage from '@/features/concert/pages/SearchConcert'
import ArtistDashboardPage from '@/features/artist/pages/ArtistDashboard'
import ArtistInfoPage from '@/features/artist/pages/ArtistInfo'
import InvitationPage from '@/features/artist/pages/ArtistInvitation'
import PerformanceSchedulePage from '@/features/artist/pages/PerformanceSchedule'
import EditPerformancePage from '@/features/artist/pages/EditPerformance'
import PerformanceDetailPage from '@/features/artist/pages/PerformanceDetail'
import ArtistRequirementsPage from '@/features/artist/pages/ArtistRequirement'
import ArtistEditHistoryPage from '@/features/artist/pages/ArtistEditHistory'
import ArtistSearchPage from '@/features/artist/pages/ArtistSearch'
import ArtistDetailPage from '@/features/artist/pages/ArtistDetail'

import VenueSeatsViewPage from '@/features/booking/pages/VenueSeatsView'

import RegistrationModule from '@/features/eventRegistration/EventRegistrationModule'

// B6717537 - Frontend (Promotions & Employees)
import PromotionLayout from '@/layouts/backoffice/PromotionLayout'
import PromotionListPage from '@/features/promotion/pages/PromotionList'
import PromotionDetailPage from '@/features/promotion/pages/PromotionDetail'
import PromotionFormPage from '@/features/promotion/pages/PromotionForm'
import PromotionApprovalPage from '@/features/promotion/pages/PromotionApproval'
import UsageHistoryPage from '@/features/userManagement/pages/UsageHistory'
import EmployeeListPage from '@/features/userManagement/pages/EmployeeList'
import EmployeeFormPage from '@/features/userManagement/pages/EmployeeForm'
import EmployeeAccountPage from '@/features/userManagement/pages/EmployeeAccount'
import EmployeePasswordRecoveryPage from '@/features/auth/pages/EmployeePasswordRecovery'
import EmployeePasswordSetupPage from '@/features/auth/pages/EmployeePasswordSetup'
import type { EditHistoryEntry } from '@/features/promotion/types/promotion'

// B6733377 - External Contact
import ExternalContactLayout from '@/components/_frontend/ExternalContactLayout'
import { ContactHQ } from '@/pages/Customer/ContactHQ'
import { SponsorForm } from '@/pages/Customer/SponsorForm'
import { PlanningForm } from '@/pages/Customer/PlanningForm'
import { TicketingSupport } from '@/pages/Customer/TicketingSupport'
import { GeneralInquiryForm } from '@/pages/Customer/GeneralInquiryForm'

function App() {
  const [editHistory, setEditHistory] = useState<EditHistoryEntry[]>([])

  const handleAddHistory = (entry: EditHistoryEntry) =>
    setEditHistory((prev) => [entry, ...prev].slice(0, 50))

  return (
    <Routes>
      {/* B6728786 - Ticket Booking Routes */}
      <Route path="/" element={<IntroPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/employee/login" element={<EmployeeLoginPage />} />
      <Route path="/staff/login" element={<EmployeeLoginPage />} />
      <Route path="/employee/forgot-password" element={<EmployeePasswordRecoveryPage />} />
      <Route path="/employee/setup-password" element={<EmployeePasswordSetupPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/home" element={<HomePage />} />
      <Route path="/events" element={<EventsPage />} />
      <Route path="/offers" element={<CustomerPromotionsPage />} />
      <Route path="/offers/:id" element={<CustomerPromotionDetailPage />} />
      <Route path="/event-detail" element={<EventDetailPage />} />
      <Route path="/event/:id" element={<EventDetailPage />} />
      <Route path="/event/:id/zones" element={<ZoneSelectionPage />} />

      {/* Customer Protected Activities (ต้อง Login ก่อนทำรายการ) */}
      <Route path="/event/:id/seats/:zone" element={<CustomerRouteGuard><SeatSelectionPage /></CustomerRouteGuard>} />
      <Route path="/my-tickets" element={<CustomerRouteGuard><CustomerAccountPage mode="tickets" /></CustomerRouteGuard>} />
      <Route path="/purchase-history" element={<CustomerRouteGuard><CustomerAccountPage mode="history" /></CustomerRouteGuard>} />
      <Route path="/profile/edit" element={<CustomerRouteGuard><CustomerAccountPage mode="profile" /></CustomerRouteGuard>} />
      <Route path="/change-password" element={<CustomerRouteGuard><CustomerAccountPage mode="password" /></CustomerRouteGuard>} />

      {/* Sales Officer - Booking & Payment Verification (final document SA.docx: U4, UP2, UP3, UP5) */}
      <Route path="/sales/bookings" element={<EmployeeRouteGuard module="sales"><Layout title="จัดการการจองและตรวจสอบการชำระเงิน"><SalesBookingManagementPage /></Layout></EmployeeRouteGuard>} />
      <Route path="/sales-bookings" element={<EmployeeRouteGuard module="sales"><Layout title="จัดการการจองและตรวจสอบการชำระเงิน"><SalesBookingManagementPage /></Layout></EmployeeRouteGuard>} />
      <Route path="/payment-verification" element={<EmployeeRouteGuard module="sales"><Layout title="จัดการการจองและตรวจสอบการชำระเงิน"><SalesBookingManagementPage /></Layout></EmployeeRouteGuard>} />

      {/* B6707651 - Concert Management Routes */}
      <Route path="/dashboard" element={<EmployeeRouteGuard module="dashboard"><Layout title="ข้อมูลงานคอนเสิร์ตทั้งหมด" showBack={false}><DashboardPage /></Layout></EmployeeRouteGuard>} />
      <Route path="/add-concert" element={<EmployeeRouteGuard feature="concert.create" required="edit"><Layout title="ข้อมูลงานคอนเสิร์ต"><AddConcertPage /></Layout></EmployeeRouteGuard>} />
      <Route path="/edit-concert" element={<EmployeeRouteGuard feature="concert.edit" required="edit"><Layout title="ข้อมูลงานคอนเสิร์ต"><EditConcertPage /></Layout></EmployeeRouteGuard>} />
      <Route path="/responsibility" element={<EmployeeRouteGuard feature="concert.assignment"><Layout title="ข้อมูลงานคอนเสิร์ต"><ResponsibilityPage /></Layout></EmployeeRouteGuard>} />
      <Route path="/concert-status" element={<EmployeeRouteGuard feature="concert.status" required="edit"><Layout title="ข้อมูลงานคอนเสิร์ต"><ConcertStatusPage /></Layout></EmployeeRouteGuard>} />
      <Route path="/documents" element={<EmployeeRouteGuard feature="concert.documents"><Layout title="ข้อมูลงานคอนเสิร์ต"><DocumentsPage /></Layout></EmployeeRouteGuard>} />
      <Route path="/edit-history" element={<EmployeeRouteGuard feature="concert.history"><Layout title="ข้อมูลงานคอนเสิร์ต"><EditHistoryPage /></Layout></EmployeeRouteGuard>} />
      <Route path="/search-concert" element={<EmployeeRouteGuard module="concert_catalog"><Layout title="วางแผนจำหน่ายบัตร"><SearchConcertPage /></Layout></EmployeeRouteGuard>} />
      <Route path="/concert-search" element={<EmployeeRouteGuard feature="concert.search"><Layout title="ค้นหาคอนเสิร์ต"><ConcertSearchPage /></Layout></EmployeeRouteGuard>} />
      <Route path="/artist-dashboard" element={<EmployeeRouteGuard feature="artist.dashboard"><Layout title="ข้อมูลศิลปินและการแสดงทั้งหมด"><ArtistDashboardPage /></Layout></EmployeeRouteGuard>} />
      <Route path="/artist-search" element={<EmployeeRouteGuard feature="artist.search"><Layout title="ค้นหาศิลปินและการแสดง" showBack={false}><ArtistSearchPage /></Layout></EmployeeRouteGuard>} />
      <Route path="/artists/:id" element={<EmployeeRouteGuard feature="artist.search"><Layout title="รายละเอียดข้อมูลศิลปิน"><ArtistDetailPage /></Layout></EmployeeRouteGuard>} />
      <Route path="/artist-info" element={<EmployeeRouteGuard feature="artist.manage" required="edit"><Layout title="ข้อมูลศิลปินและตารางการแสดง"><ArtistInfoPage /></Layout></EmployeeRouteGuard>} />
      <Route path="/invitation" element={<EmployeeRouteGuard feature="artist.invitation"><Layout title="ข้อมูลศิลปินและตารางการแสดง"><InvitationPage /></Layout></EmployeeRouteGuard>} />
      <Route path="/performance-schedule" element={<EmployeeRouteGuard feature="artist.schedule.view"><Layout title="ข้อมูลศิลปินและตารางการแสดง"><PerformanceSchedulePage /></Layout></EmployeeRouteGuard>} />
      <Route path="/edit-performance" element={<EmployeeRouteGuard feature="artist.performance.manage" required="edit"><Layout title="ข้อมูลศิลปินและตารางการแสดง"><EditPerformancePage /></Layout></EmployeeRouteGuard>} />
      <Route path="/performance-detail" element={<EmployeeRouteGuard feature="artist.performance.manage"><Layout title="ข้อมูลศิลปินและตารางการแสดง"><PerformanceDetailPage /></Layout></EmployeeRouteGuard>} />
      <Route path="/artist-requirements" element={<EmployeeRouteGuard feature="artist.performance.manage" required="edit"><Layout title="ข้อมูลศิลปินและตารางการแสดง"><ArtistRequirementsPage /></Layout></EmployeeRouteGuard>} />
      <Route path="/artist-edit-history" element={<EmployeeRouteGuard feature="artist.history"><Layout title="ข้อมูลศิลปินและตารางการแสดง"><ArtistEditHistoryPage /></Layout></EmployeeRouteGuard>} />

      {/* B6708856 - seats & registration */}
      <Route path="/venues-seats/*" element={<EmployeeRouteGuard module="venues"><Layout title="ห้องสถานที่และที่นั่ง"><VenueSeatsViewPage /></Layout></EmployeeRouteGuard>} />
      <Route path="/event-registration" element={<EmployeeRouteGuard module="registration"><Layout title="ลงทะเบียนเข้างาน"><RegistrationModule /></Layout></EmployeeRouteGuard>} />

      {/* B6717537 - Promotion & Employee Routes */}
      <Route path="/promotions" element={<EmployeeRouteGuard module="promotions"><PromotionLayout><PromotionListPage editHistory={editHistory} onAddHistory={handleAddHistory} /></PromotionLayout></EmployeeRouteGuard>} />
      <Route path="/promotions/new" element={<EmployeeRouteGuard module="promotions" required="edit"><PromotionLayout><PromotionFormPage /></PromotionLayout></EmployeeRouteGuard>} />
      <Route path="/promotions/:id" element={<EmployeeRouteGuard module="promotions"><PromotionLayout><PromotionDetailPage /></PromotionLayout></EmployeeRouteGuard>} />
      <Route path="/promotions/:id/edit" element={<EmployeeRouteGuard module="promotions" required="edit"><PromotionLayout><PromotionFormPage /></PromotionLayout></EmployeeRouteGuard>} />
      <Route path="/approvals" element={<EmployeeRouteGuard module="promotion_approvals"><PromotionLayout><PromotionApprovalPage /></PromotionLayout></EmployeeRouteGuard>} />
      <Route path="/history" element={<EmployeeRouteGuard module="audit"><PromotionLayout><UsageHistoryPage /></PromotionLayout></EmployeeRouteGuard>} />
      <Route path="/employees" element={<EmployeeRouteGuard module="employees"><PromotionLayout><EmployeeListPage /></PromotionLayout></EmployeeRouteGuard>} />
      <Route path="/employees/new" element={<EmployeeRouteGuard module="employees"><PromotionLayout><EmployeeFormPage /></PromotionLayout></EmployeeRouteGuard>} />
      <Route path="/employees/:id/edit" element={<EmployeeRouteGuard module="employees"><PromotionLayout><EmployeeFormPage /></PromotionLayout></EmployeeRouteGuard>} />
      <Route path="/employee/account" element={<EmployeeRouteGuard><PromotionLayout><EmployeeAccountPage /></PromotionLayout></EmployeeRouteGuard>} />

      {/* B6733377 - Concert Report System */}
      <Route path="/report/*" element={<EmployeeRouteGuard feature="report.view"><Layout title="รายการคอนเสิร์ตที่เสร็จสิ้นแล้ว" showBack={false}><ConsertReportPage /></Layout></EmployeeRouteGuard>} />

      {/* B6733377 - External Contact */}
      <Route path="/contact" element={<ExternalContactLayout />}>
        <Route index element={<ContactHQ />} />
        <Route path="sponsor" element={<SponsorForm subTab="request" />} />
        <Route path="sponsor/status" element={<SponsorForm subTab="status" />} />
        <Route path="planning" element={<PlanningForm subTab="details" />} />
        <Route path="planning/status" element={<PlanningForm subTab="status" />} />
        <Route path="ticketing" element={<TicketingSupport subTab="request" />} />
        <Route path="ticketing/summary" element={<TicketingSupport subTab="summary" />} />
        <Route path="general" element={<GeneralInquiryForm />} />
      </Route>
    </Routes>
  )
}

export default App
