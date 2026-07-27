import { Link } from 'react-router-dom'

function Footer() {
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
        <Link to="/admin" className="admin-link">Admin</Link>
      </div>
    </footer>
  )
}

export default Footer
