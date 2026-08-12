import { iconFor } from '../lib/supabase';

export default function DetailModal({ listing, onClose }) {
  if (!listing) return null;
  const r = listing;
  const fillPct = Math.min(100, (r.distance / 3) * 100);
  const minutes = Math.max(2, Math.round(r.distance * 12));

  return (
    <div className="overlay open" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <button className="modal-close" onClick={onClose}>✕</button>
        {r.photoUrl && <img src={r.photoUrl} className="card-photo" style={{ height: 200 }} alt="" />}
        <div className="modal-head">
          <div className="room-type">{r.type} sharing</div>
          <h2>{r.name}</h2>
          <div className="locality">{r.college}, {r.city}</div>
        </div>
        <div className="distance-panel">
          <div className="label">Distance from college</div>
          <div className="distance-row">
            <div className="distance-big">{r.distance}<span> km</span></div>
            <div className="distance-track">
              <span className="start-marker">🎓</span>
              <div className="distance-fill" style={{ width: `${fillPct}%` }}></div>
              <span className="end-marker">🏠</span>
            </div>
          </div>
          <div className="distance-note">About {minutes} minutes from college on foot or by auto.</div>
        </div>
        <div className="modal-body">
          <div className="price-row">
            <div className="price">₹{r.rent.toLocaleString('en-IN')}<span style={{ fontSize: '0.8rem', fontWeight: 400, color: '#888' }}> /month</span></div>
          </div>
          <div className="amenities">
            {r.amenities.map((a, i) => <span key={i}>{iconFor(a)} {a}</span>)}
          </div>
          <div className="card-actions">
            <a
              className="btn-contact"
              href={`https://wa.me/${r.phone}?text=Hi%2C%20I%27d%20like%20more%20information%20about%20${encodeURIComponent(r.name)}`}
              target="_blank" rel="noreferrer"
            >
              Contact on WhatsApp
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
