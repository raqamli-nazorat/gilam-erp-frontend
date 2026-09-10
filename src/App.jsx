import { useEffect } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { useSelector } from 'react-redux'
import ProtectedRoute from '@/components/ProtectedRoute'
import AppLayout from '@/components/layout/AppLayout'
import LoginPage from '@/pages/Login/LoginPage'
import ReceiptsListPage from '@/pages/Receipts/ReceiptsListPage'
import ReceiptDetailPage from '@/pages/Receipts/ReceiptDetailPage'
import BookingsListPage from '@/pages/Bookings/BookingsListPage'
import BookingDetailPage from '@/pages/Bookings/BookingDetailPage'
import SalesListPage from '@/pages/Sales/SalesListPage'
import SaleDetailPage from '@/pages/Sales/SaleDetailPage'
import ReturnsListPage from '@/pages/Returns/ReturnsListPage'
import ReturnDetailPage from '@/pages/Returns/ReturnDetailPage'
import QaytarishKirimiListPage from '@/pages/QaytarishKirimi/QaytarishKirimiListPage'
import QaytarishKirimiDetailPage from '@/pages/QaytarishKirimi/QaytarishKirimiDetailPage'
import ExpensesListPage from '@/pages/Expenses/ExpensesListPage'
import PayrollCalcPage from '@/pages/Payroll/PayrollCalcPage'
import AdvancesPage from '@/pages/Payroll/AdvancesPage'
import TimesheetPage from '@/pages/Payroll/TimesheetPage'
import KassaWorkspacePage from '@/pages/Kassa/KassaWorkspacePage'
import KassaOperationsPage from '@/pages/Kassa/KassaOperationsPage'
import KassaDayEndPage from '@/pages/Kassa/KassaDayEndPage'
import HisobotlarIndexPage from '@/pages/Hisobotlar/HisobotlarIndexPage'
import HisobotRunnerPage from '@/pages/Hisobotlar/HisobotRunnerPage'
import BalansPage from '@/pages/Balans/BalansPage'
import KontragentBalansPage from '@/pages/Balans/KontragentBalansPage'
import MalumotnomaDetailPage from '@/pages/Malumotnomalar/MalumotnomaDetailPage'
import TashkilotlarListPage from '@/pages/Tashkilotlar/TashkilotlarListPage'
import TashkilotDetailPage from '@/pages/Tashkilotlar/TashkilotDetailPage'
import FiliallarListPage from '@/pages/Filiallar/FiliallarListPage'
import FilialDetailPage from '@/pages/Filiallar/FilialDetailPage'
import FilialXodimlarPage from '@/pages/Filiallar/FilialXodimlarPage'
import FilialOmborlarPage from '@/pages/Filiallar/FilialOmborlarPage'
import FilialOmborDetailPage from '@/pages/Filiallar/FilialOmborDetailPage'
import FilialMijozlarPage from '@/pages/Filiallar/FilialMijozlarPage'
import FilialSavdoPage from '@/pages/Filiallar/FilialSavdoPage'
import FoydalanuvchilarListPage from '@/pages/Foydalanuvchilar/FoydalanuvchilarListPage'
import FoydalanuvchilarDetailPage from '@/pages/Foydalanuvchilar/FoydalanuvchilarDetailPage'
import RollarPage from '@/pages/Foydalanuvchilar/RollarPage'
import ProfilPage from '@/pages/Profil/ProfilPage'
import DashboardPage from '@/pages/Dashboard/DashboardPage'
import AuditJurnaliPage from '@/pages/AuditJurnali/AuditJurnaliPage'
import { TooltipProvider } from '@/components/ui/tooltip'

function App() {
  const theme = useSelector((state) => state.ui.theme)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  return (
    <TooltipProvider delayDuration={200}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/" element={<Navigate to="/tovarlar-kirimi" replace />} />
          <Route path="/tovarlar-kirimi" element={<ReceiptsListPage />} />
          <Route path="/tovarlar-kirimi/yangi" element={<ReceiptDetailPage isNew />} />
          <Route path="/tovarlar-kirimi/:id" element={<ReceiptDetailPage />} />
          <Route path="/bron-tovarlar" element={<BookingsListPage />} />
          <Route path="/bron-tovarlar/yangi" element={<BookingDetailPage isNew />} />
          <Route path="/bron-tovarlar/:id" element={<BookingDetailPage />} />
          <Route path="/tovarlar-savdosi" element={<SalesListPage />} />
          <Route path="/tovarlar-savdosi/yangi" element={<SaleDetailPage isNew />} />
          <Route path="/tovarlar-savdosi/:id" element={<SaleDetailPage />} />
          <Route path="/tovarlar-qaytarishi" element={<ReturnsListPage />} />
          <Route path="/tovarlar-qaytarishi/yangi" element={<ReturnDetailPage isNew />} />
          <Route path="/tovarlar-qaytarishi/:id" element={<ReturnDetailPage />} />
          <Route path="/qaytarish-kirimi" element={<QaytarishKirimiListPage />} />
          <Route path="/qaytarish-kirimi/yangi" element={<QaytarishKirimiDetailPage isNew />} />
          <Route path="/qaytarish-kirimi/:id" element={<QaytarishKirimiDetailPage />} />
          <Route path="/xarajatlar" element={<ExpensesListPage />} />
          <Route path="/ish-haqi" element={<PayrollCalcPage />} />
          <Route path="/ish-haqi/avans" element={<AdvancesPage />} />
          <Route path="/ish-haqi/tabel" element={<TimesheetPage />} />
          <Route path="/kassa" element={<KassaWorkspacePage />} />
          <Route path="/kassa/operatsiyalar" element={<KassaOperationsPage />} />
          <Route path="/kassa/kun-yakuni" element={<KassaDayEndPage />} />
          <Route path="/hisobotlar" element={<HisobotlarIndexPage />} />
          <Route path="/hisobotlar/:slug" element={<HisobotRunnerPage />} />
          <Route path="/balans" element={<BalansPage />} />
          <Route path="/balans/kontragent/:id" element={<KontragentBalansPage />} />
          <Route path="/malumotnomalar" element={<Navigate to="/malumotnomalar/rollar" replace />} />
          <Route path="/malumotnomalar/rollar" element={<RollarPage />} />
          <Route path="/malumotnomalar/sifatlar" element={<MalumotnomaDetailPage slug="sifatlar" />} />
          <Route path="/malumotnomalar/ranglar" element={<MalumotnomaDetailPage slug="ranglar" />} />
          <Route path="/malumotnomalar/olchov-birliklari" element={<MalumotnomaDetailPage slug="olchov-birliklari" />} />
          <Route path="/malumotnomalar/lavozimlar" element={<MalumotnomaDetailPage slug="lavozimlar" />} />
          <Route path="/malumotnomalar/kontragent-turlari" element={<MalumotnomaDetailPage slug="kontragent-turlari" />} />
          <Route path="/malumotnomalar/:slug" element={<MalumotnomaDetailPage />} />
          <Route path="/tashkilotlar" element={<TashkilotlarListPage />} />
          <Route path="/tashkilotlar/:id" element={<TashkilotDetailPage />} />
          <Route path="/filiallar" element={<FiliallarListPage />} />
          <Route path="/filiallar/:id" element={<FilialDetailPage />} />
          <Route path="/filiallar/:id/xodimlar" element={<FilialXodimlarPage />} />
          <Route path="/filiallar/:id/omborlar" element={<FilialOmborlarPage />} />
          <Route path="/filiallar/:id/omborlar/:omborId" element={<FilialOmborDetailPage />} />
          <Route path="/filiallar/:id/mijozlar" element={<FilialMijozlarPage />} />
          <Route path="/filiallar/:id/savdo" element={<FilialSavdoPage />} />
          <Route path="/foydalanuvchilar" element={<FoydalanuvchilarListPage />} />
          <Route path="/foydalanuvchilar/rollar" element={<Navigate to="/malumotnomalar/rollar" replace />} />
          <Route path="/foydalanuvchilar/:id" element={<FoydalanuvchilarDetailPage />} />
          <Route path="/profil" element={<ProfilPage />} />
          <Route path="/boshqaruv-paneli" element={<DashboardPage />} />
          <Route path="/audit-jurnali" element={<AuditJurnaliPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </TooltipProvider>
  )
}

export default App
