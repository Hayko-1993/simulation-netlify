import { Link } from 'react-router-dom'
import { ADMIN_URL } from '../config/admin'

function Footer() {
  const adminLink = ADMIN_URL.startsWith('http') ? (
    <a href={ADMIN_URL} className="admin-link" rel="noopener noreferrer">Admin</a>
  ) : (
    <Link to={ADMIN_URL} className="admin-link">Admin</Link>
  )

  return (
    <footer className="footer" id="contact">
      <div className="footer-inner">
        <div className="footer-col">
          <h4>Super Dispatching Services</h4>
          <p>Connecting reliable carriers with consistent, vetted freight across the country.</p>
          <p>MC#987654 &middot; USDOT#1234567</p>
        </div>
        <div className="footer-col">
          <h4>Contact</h4>
          <a href="mailto:dispatch@summitfreightlogistics.com">dispatch@summitfreightlogistics.com</a>
          <a href="tel:+18005551234">+1 (800) 555-1234</a>
        </div>
        <div className="footer-col">
          <h4>Carriers</h4>
          <Link to="/carrier-signup">Become a Carrier</Link>
          <Link to="/carrier-login">Carrier Login</Link>
        </div>
      </div>
      <div className="footer-bottom">
        <span>&copy; {new Date().getFullYear()} Super Dispatching Services. All rights reserved.</span>
        {adminLink}
      </div>
    </footer>
  )
}

export default Footer
