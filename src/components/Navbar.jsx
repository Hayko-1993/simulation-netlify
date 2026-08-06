import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import LogoMark from './LogoMark'

function Navbar() {
  const [open, setOpen] = useState(false)
  const location = useLocation()
  const onHome = location.pathname === '/'

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="brand" onClick={() => setOpen(false)}>
          <LogoMark size={32} />
          <div className="brand-text">
            <span className="brand-mark">SUPER</span>
            <span className="brand-sub">Dispatching Services</span>
          </div>
        </Link>

        <button
          type="button"
          className="nav-toggle"
          aria-label="Toggle menu"
          onClick={() => setOpen((v) => !v)}
        >
          <span />
          <span />
          <span />
        </button>

        <div className={`nav-links ${open ? 'open' : ''}`}>
          {onHome ? (
            <>
              <a href="#services" onClick={() => setOpen(false)}>Load Types</a>
              <a href="#why-us" onClick={() => setOpen(false)}>Why Us</a>
              <a href="#contact" onClick={() => setOpen(false)}>Contact</a>
            </>
          ) : (
            <Link to="/" onClick={() => setOpen(false)}>Home</Link>
          )}
          <Link to="/carrier-login" onClick={() => setOpen(false)}>Carrier Login</Link>
          <Link to="/carrier-signup" className="nav-cta" onClick={() => setOpen(false)}>
            Become a Carrier
          </Link>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
