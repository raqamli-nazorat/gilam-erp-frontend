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
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </TooltipProvider>
  )
}

export default App
