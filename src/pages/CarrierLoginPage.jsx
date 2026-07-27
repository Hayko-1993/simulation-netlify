import { useRef, useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import LogoMark from '../components/LogoMark'
import CarrierPortal from '../components/CarrierPortal'

const apiUrl = import.meta.env.VITE_API_URL ?? ''
const STORAGE_KEY = 'summit_carrier_session'

function CarrierLoginPage() {
  const [session, setSession] = useState(() => {
    const saved = sessionStorage.getItem(STORAGE_KEY)
    return saved ? JSON.parse(saved) : null
  })
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [touched, setTouched] = useState({ email: false, password: false })

  useEffect(() => {
    fetch(`${apiUrl}/api/track/visit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ page: 'carrier-login', referrer: document.referrer }),
    }).catch(() => {})
  }, [])

  const [stage, setStage] = useState('credentials') // 'credentials' | 'verify'
  const [carrierId, setCarrierId] = useState(null)
  const [phoneHint, setPhoneHint] = useState('')
  const [code, setCode] = useState(['', '', '', '', '', ''])
  const codeRefs = useRef([])

  const handleCredentialsSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!email.includes('@')) {
      setError('Please enter a valid email address.')
      return
    }

    setLoading(true)
    try {
      const res = await fetch(`${apiUrl}/api/carriers/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Login failed.')

      setCarrierId(data.carrierId ?? null)
      setPhoneHint(data.phoneHint)
      await new Promise((resolve) => setTimeout(resolve, 5000))
      setStage('verify')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleCodeChange = (index, value) => {
    if (!/^\d?$/.test(value)) return
    const next = [...code]
    next[index] = value
    setCode(next)
    if (value && index < 5) codeRefs.current[index + 1]?.focus()
  }

  const handleCodeKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      codeRefs.current[index - 1]?.focus()
    }
  }

  const handleVerifySubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch(`${apiUrl}/api/carriers/verify-2fa`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ carrierId, code: code.join('') }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Verification failed.')

      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data))
      setSession(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    sessionStorage.removeItem(STORAGE_KEY)
    setSession(null)
    setEmail('')
    setPassword('')
    setStage('credentials')
    setCode(['', '', '', '', '', ''])
  }

  return (
    <div className="login-page">
      <div className="login-topbar">
        <span />
        {!session && (
          <Link to="/carrier-signup" className="btn btn-outline-dark btn-sm">
            Sign Up
          </Link>
        )}
      </div>

      <div className="login-main">
        {session ? (
          <CarrierPortal session={session} onLogout={handleLogout} />
        ) : stage === 'credentials' ? (
          <div className="login-card">
            <h1>Carrier TMS</h1>

            <form onSubmit={handleCredentialsSubmit} noValidate>
              <div className="form-field">
                <label htmlFor="loginEmail">Email</label>
                <input
                  id="loginEmail"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={() => setTouched((t) => ({ ...t, email: true }))}
                  className={touched.email && !email ? 'input-error' : ''}
                  autoFocus
                />
                {touched.email && !email && (
                  <span className="field-inline-error">Enter email</span>
                )}
              </div>

              <div className="form-field">
                <label htmlFor="loginPassword">Password</label>
                <div className="password-field">
                  <input
                    id="loginPassword"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onBlur={() => setTouched((t) => ({ ...t, password: true }))}
                    className={touched.password && !password ? 'input-error' : ''}
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label="Toggle password visibility"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      {showPassword ? (
                        <>
                          <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
                          <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
                          <line x1="1" y1="1" x2="23" y2="23" />
                        </>
                      ) : (
                        <>
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                          <circle cx="12" cy="12" r="3" />
                        </>
                      )}
                    </svg>
                  </button>
                </div>
                {touched.password && !password && (
                  <span className="field-inline-error">Enter password</span>
                )}
              </div>

              {error && <span className="field-error">{error}</span>}

              <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
                {loading ? 'Logging in...' : 'Log In'}
              </button>
            </form>

            <div className="login-links-row">
              <a href="#forgot-password">Forgot password?</a>
              <a href="#contact-support">Contact support</a>
            </div>
          </div>
        ) : (
          <div className="login-card verify-card">
            <div className="verify-header">
              <button type="button" className="verify-back" onClick={() => setStage('credentials')}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 12H5M12 5l-7 7 7 7" />
                </svg>
              </button>
              <h1>Check your inbox!</h1>
            </div>

            <p className="verify-desc">
              We've sent you a temporary 6-digit login code at{' '}
              <strong>{email}</strong>. Please enter this code to login to your account.
            </p>

            <form onSubmit={handleVerifySubmit}>
              <div className="form-field">
                <label htmlFor="verifyCode">Verification Code</label>
                <input
                  id="verifyCode"
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={code.join('')}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '').slice(0, 6)
                    setCode(val.split('').concat(Array(6 - val.length).fill('')))
                  }}
                  className={error ? 'input-error' : ''}
                  autoFocus
                  placeholder=""
                />
                {error && <span className="field-inline-error">Enter Verification Code</span>}
              </div>

              <p className="verify-resend">
                Didn't receive a code? Check your spam folder.<br />
                <a href="#resend">Resend code.</a>
              </p>

              <button type="submit" className="btn btn-primary btn-block verify-submit" disabled={loading}>
                {loading ? 'Verifying...' : 'Log In'}
              </button>
            </form>

            <div style={{ textAlign: 'center', marginTop: 14 }}>
              <a href="#sms" className="verify-sms-link">Receive Code via SMS(Text Message)</a>
            </div>
          </div>
        )}
      </div>

      {!session && (
        <>
          <p className="login-legal">
            By signing in, you agree to Super Dispatching Services's{' '}
            <a href="#terms">Terms &amp; Conditions</a> and <a href="#privacy">Privacy Policy</a>
          </p>
          <p className="login-copyright">
            &copy; {new Date().getFullYear()} Super Dispatching Services. All rights reserved.
          </p>
        </>
      )}
    </div>
  )
}

export default CarrierLoginPage
