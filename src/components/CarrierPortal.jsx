function CarrierPortal({ session, onLogout }) {
  const { carrier } = session

  return (
    <section className="carrier-login-section" id="carrier-login">
      <div className="carrier-login-card carrier-portal">
        <div className="portal-header">
          <div>
            <h2>{carrier.company_legal_name}</h2>
            <p className="muted">{carrier.email}</p>
          </div>
          <button className="btn btn-outline-dark btn-sm" onClick={onLogout}>
            Log Out
          </button>
        </div>

        <p>
          Application Status:{' '}
          <span className={`status-badge status-${carrier.status}`}>{carrier.status}</span>
        </p>

        <h3>Company Info</h3>
        <dl>
          <dt>MC Number</dt><dd>{carrier.mc_number}</dd>
          <dt>USDOT Number</dt><dd>{carrier.dot_number}</dd>
          <dt>Primary Contact</dt><dd>{carrier.contact_name}</dd>
          <dt>Phone</dt><dd>{carrier.phone}</dd>
          <dt>Equipment</dt><dd>{carrier.equipment.join(', ') || '—'}</dd>
          <dt>Preferred Lanes</dt><dd>{carrier.preferred_lanes.join(', ') || '—'}</dd>
        </dl>
      </div>
    </section>
  )
}

export default CarrierPortal
