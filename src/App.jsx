import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import Footer from './components/Footer'
import Home from './pages/Home'
import CarrierSignup from './pages/CarrierSignup'
import CarrierLoginPage from './pages/CarrierLoginPage'
import Admin from './pages/Admin'

function App() {
  const location = useLocation()
  const hideFooter = ['/carrier-login', '/admin'].includes(location.pathname)

  return (
    <>
      <main>
        <Routes>
          <Route path="/" element={<Navigate to="/carrier-login" replace />} />
          <Route path="/carrier-signup" element={<CarrierSignup />} />
          <Route path="/carrier-login" element={<CarrierLoginPage />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </main>
      {!hideFooter && <Footer />}
    </>
  )
}

export default App
