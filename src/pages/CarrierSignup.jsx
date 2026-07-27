import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const apiUrl = import.meta.env.VITE_API_URL ?? ''

const equipmentOptions = [
  'Dry Van', 'Reefer', 'Flatbed', 'Step Deck', 'Power Only', 'Box Truck', 'Hotshot',
]

const regionOptions = [
  'Northeast', 'Southeast', 'Midwest', 'Southwest', 'West Coast', 'Pacific Northwest',
  'Mountain West', 'Texas Triangle', 'Gulf Coast', 'Canada', 'Mexico', 'Nationwide',
]

const initialForm = {
  companyLegalName: '',
  mcNumber: '',
  dotNumber: '',
  contactName: '',
  phone: '',
  email: '',
  password: '',
  confirmPassword: '',
  equipment: [],
  preferredLanes: [],
}

function CarrierSignup() {
  const navigate = useNavigate()
  const [form, setForm] = useState(initialForm)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const updateField = (field, value) => {
    setForm((f) => ({ ...f, [field]: value }))
  }

  const toggleListValue = (field, value) => {
    setForm((f) => {
      const list = f[field]
      return {
        ...f,
        [field]: list.includes(value) ? list.filter((v) => v !== value) : [...list, value],
      }
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitError('')

    if (form.password !== form.confirmPassword) {
      setSubmitError('Passwords do not match.')
      return
    }
    if (form.equipment.length === 0) {
      setSubmitError('Select at least one equipment type.')
      return
    }
    if (form.preferredLanes.length === 0) {
      setSubmitError('Select at least one preferred region.')
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch(`${apiUrl}/api/carriers/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Registration failed.')
      setSubmitted(true)
    } catch (err) {
      setSubmitError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="form-page">
        <div className="form-card">
          <h1>Application Submitted</h1>
          <p className="muted">
            Thanks for applying to become a Super Dispatching Services carrier
            partner. Our team will review your application, and you can log
            in any time using the Carrier Login on the home page.
          </p>
          <button className="btn btn-primary" onClick={() => navigate('/')}>
            Back to Home
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="form-page">
      <div className="form-card">
        <h1>Carrier Sign-Up</h1>
        <p className="muted">
          Create your carrier portal account. After signing up, you'll log in
          with your email and password, plus a 6-digit code sent to your
          phone.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-field">
              <label htmlFor="companyLegalName">Company Legal Name</label>
              <input
                id="companyLegalName"
                value={form.companyLegalName}
                onChange={(e) => updateField('companyLegalName', e.target.value)}
                required
              />
            </div>
            <div className="form-field">
              <label htmlFor="contactName">Primary Contact Name</label>
              <input
                id="contactName"
                value={form.contactName}
                onChange={(e) => updateField('contactName', e.target.value)}
                required
              />
            </div>
            <div className="form-field">
              <label htmlFor="mcNumber">MC Number</label>
              <input
                id="mcNumber"
                value={form.mcNumber}
                onChange={(e) => updateField('mcNumber', e.target.value)}
                required
              />
            </div>
            <div className="form-field">
              <label htmlFor="dotNumber">USDOT Number</label>
              <input
                id="dotNumber"
                value={form.dotNumber}
                onChange={(e) => updateField('dotNumber', e.target.value)}
                required
              />
            </div>
            <div className="form-field">
              <label htmlFor="phone">Phone Number</label>
              <input
                id="phone"
                type="tel"
                placeholder="For 2FA verification codes"
                value={form.phone}
                onChange={(e) => updateField('phone', e.target.value)}
                required
              />
            </div>
            <div className="form-field">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => updateField('email', e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-field">
            <label>Equipment Type</label>
            <div className="checkbox-grid">
              {equipmentOptions.map((option) => (
                <div
                  key={option}
                  className={`checkbox-tile ${form.equipment.includes(option) ? 'selected' : ''}`}
                  onClick={() => toggleListValue('equipment', option)}
                >
                  {option}
                </div>
              ))}
            </div>
          </div>

          <div className="form-field">
            <label>Preferred Lanes / Regions</label>
            <div className="checkbox-grid">
              {regionOptions.map((option) => (
                <div
                  key={option}
                  className={`checkbox-tile ${form.preferredLanes.includes(option) ? 'selected' : ''}`}
                  onClick={() => toggleListValue('preferredLanes', option)}
                >
                  {option}
                </div>
              ))}
            </div>
          </div>

          <div className="form-grid">
            <div className="form-field">
              <label htmlFor="password">Create Password</label>
              <input
                id="password"
                type="password"
                value={form.password}
                onChange={(e) => updateField('password', e.target.value)}
                required
              />
            </div>
            <div className="form-field">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                id="confirmPassword"
                type="password"
                value={form.confirmPassword}
                onChange={(e) => updateField('confirmPassword', e.target.value)}
                required
              />
            </div>
          </div>

          {submitError && <span className="field-error">{submitError}</span>}

          <div className="form-actions">
            <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
              {submitting ? 'Submitting...' : 'Submit Application'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CarrierSignup
