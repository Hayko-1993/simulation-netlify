import { useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import Footer from './components/Footer'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import CarrierSignup from './pages/CarrierSignup'
import CarrierLoginPage from './pages/CarrierLoginPage'
import Admin from './pages/Admin'
import { ensureAdminOrigin } from './config/admin'

function App() {
  const location = useLocation()
  const hideFooter = ['/carrier-login', '/admin'].includes(location.pathname)
  const showNavbar = ['/', '/carrier-signup'].includes(location.pathname)

  useEffect(() => {
    ensureAdminOrigin()
  }, [location.pathname, location.search, location.hash])

  return (
    <>
      {showNavbar && <Navbar />}
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
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
