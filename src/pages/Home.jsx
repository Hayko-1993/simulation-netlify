import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

const apiUrl = import.meta.env.VITE_API_URL ?? ''

const loadTypes = [
  {
    title: 'Dry Van',
    desc: 'Steady, high-volume freight for 53\' dry van trailers across regional and OTR lanes.',
  },
  {
    title: 'Refrigerated (Reefer)',
    desc: 'Temperature-controlled loads for food, beverage, and pharma shippers — competitive reefer rates.',
  },
  {
    title: 'Flatbed & Step Deck',
    desc: 'Construction materials, machinery, and oversized freight with experienced flatbed shippers.',
  },
  {
    title: 'Hotshot',
    desc: 'Time-sensitive smaller loads for hotshot and box truck operators looking for quick turnarounds.',
  },
  {
    title: 'Power Only',
    desc: 'Drop-and-hook and power-only opportunities to keep your trucks moving without downtime.',
  },
  {
    title: 'Expedited / LTL',
    desc: 'Fast-moving partial and full truckload freight with tight, predictable delivery windows.',
  },
]

const whyUs = [
  {
    title: 'Secure Carrier Logins',
    desc: 'Every login is protected with two-factor authentication, so your account stays safe.',
  },
  {
    title: 'Vetted Shippers Only',
    desc: 'Every load comes from a verified shipper — no double brokering, no surprises at the dock.',
  },
  {
    title: 'Dedicated Dispatch Support',
    desc: 'A real person you can call. Our team helps plan lanes, backhauls, and keep trucks loaded.',
  },
  {
    title: 'Transparent Rates',
    desc: 'No hidden fees or rate games. What we quote is what you get on your rate confirmation.',
  },
]

function Home() {
  const [activeCarriers, setActiveCarriers] = useState(null)

  useEffect(() => {
    fetch(`${apiUrl}/api/stats`)
      .then((res) => res.json())
      .then((data) => setActiveCarriers(data.activeCarriers))
      .catch(() => setActiveCarriers(null))
  }, [])

  return (
    <>
      <section className="hero">
        <div className="hero-content">
          <h1>Steady Freight. Secure Partnerships.</h1>
          <p>
            Super Dispatching Services connects vetted shippers with reliable
            carrier companies — backed by a secure, two-factor protected
            carrier portal.
          </p>
          <div className="hero-actions">
            <Link to="/carrier-signup" className="btn btn-primary">
              Become a Carrier Partner
            </Link>
            <a href="#services" className="btn btn-outline">
              View Load Types
            </a>
            <Link to="/carrier-login" className="btn btn-outline">
              Carrier Login
            </Link>
          </div>
        </div>
      </section>

      <section className="stats">
        <div className="stat">
          <span className="stat-num">3,100+</span>
          <span className="stat-label">Loads Booked Monthly</span>
        </div>
        <div className="stat">
          <span className="stat-num">{activeCarriers ?? '—'}</span>
          <span className="stat-label">Active Carrier Partners</span>
        </div>
        <div className="stat">
          <span className="stat-num">48</span>
          <span className="stat-label">States Covered</span>
        </div>
        <div className="stat">
          <span className="stat-num">24/7</span>
          <span className="stat-label">Dispatch Support</span>
        </div>
      </section>

      <section className="section" id="services">
        <div className="section-header">
          <h2>Loads For Every Type of Carrier</h2>
          <p>
            Whatever you haul, we have shippers who need it moved. Tell us
            your equipment and lanes, and we'll match you with the right
            freight.
          </p>
        </div>
        <div className="card-grid">
          {loadTypes.map((load) => (
            <div className="card" key={load.title}>
              <h3>{load.title}</h3>
              <p>{load.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="section alt" id="why-us">
        <div className="section-header">
          <h2>Why Carriers Choose Summit</h2>
          <p>
            We only work with carriers who run clean, compliant operations —
            and in return, we make sure every load is worth your time.
          </p>
        </div>
        <div className="card-grid">
          {whyUs.map((item) => (
            <div className="card" key={item.title}>
              <h3>{item.title}</h3>
              <p>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="cta-band">
        <h2>Ready to Keep Your Trucks Loaded?</h2>
        <p>
          Join our network of vetted carrier partners. Sign up in minutes and
          our dispatch team will reach out with available loads on your
          lanes.
        </p>
        <Link to="/carrier-signup" className="btn btn-primary">
          Sign Up as a Carrier
        </Link>
      </section>
    </>
  )
}

export default Home
