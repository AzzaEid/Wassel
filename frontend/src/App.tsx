import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import PaymentPage from './pages/PaymentPage'
import AdminPanel from './pages/AdminPanel'
import DeliveryCompanyPage from './pages/DeliveryCompanyPage'
import DriverPage from './pages/DriverPage'
import LandingPage from './pages/LandingPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/pay/:orderId" element={<PaymentPage />} />
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="/delivery-company" element={<DeliveryCompanyPage />} />
        <Route path="/driver" element={<DriverPage />} />
      </Routes>
    </BrowserRouter>
  )
}
