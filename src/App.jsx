import { Navigate, Route, Routes } from 'react-router-dom'
import PublicLayout from './layouts/PublicLayout'
import AdminLayout from './layouts/AdminLayout'
import ProtectedRoute from './routes/ProtectedRoute'
import Login from './components/Login'
import Register from './components/Register'
import PublicHome from './pages/public/PublicHome'
import AccommodationsPage from './pages/public/AccommodationsPage'
import AccommodationDetailPage from './pages/public/AccommodationDetailPage'
import CheckoutPage from './pages/public/CheckoutPage'
import ReservationConfirmationPage from './pages/public/ReservationConfirmationPage'
import MisReservasPage from './pages/public/MisReservasPage'
import PagosPage from './pages/public/PagosPage'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminModuleRoute from './pages/admin/AdminModuleRoute'
import AdminModuleFormPage from './pages/admin/AdminModuleFormPage'

function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route index element={<PublicHome />} />
        <Route path="alojamientos" element={<AccommodationsPage />} />
        <Route path="alojamientos/:sucursalGuid" element={<AccommodationDetailPage />} />
        <Route path="checkout" element={<CheckoutPage />} />
        <Route path="reserva/:reservaGuid" element={<ReservationConfirmationPage />} />
        <Route path="habitaciones" element={<Navigate to="/alojamientos" replace />} />
        <Route path="reserva" element={<Navigate to="/alojamientos" replace />} />
        <Route path="pagos" element={<PagosPage />} />
        <Route path="mis-reservas" element={<MisReservasPage />} />
      </Route>

      <Route path="login" element={<Login />} />
      <Route path="register" element={<Register />} />

      <Route path="admin" element={<ProtectedRoute allowedRoles={['ADMINISTRADOR', 'ADMIN', 'OPERATIVO', 'DESK_SERVICE']} />}>
        <Route element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path=":moduleKey/nuevo" element={<AdminModuleFormPage />} />
          <Route path=":moduleKey/:recordId/editar" element={<AdminModuleFormPage />} />
          <Route path=":moduleKey" element={<AdminModuleRoute />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
