import { iconFor } from '../lib/supabase';

export default function ListingCard({ listing, index, isFavorited, onToggleFavorite, onClick }) {
  const r = listing;
  return (
    <div
      className="card"
      style={{ animationDelay: `${Math.min(index * 0.06, 0.5)}s` }}
      onClick={() => onClick(r.id)}
    >
      {r.photoUrl && <img src={r.photoUrl} alt={r.name} className="card-photo" />}
      <div className="card-top">
        <div className="punch-hole"></div>
        <div className="badges-stack">
          {r.isPremium && <div className="premium-badge">⭐ PREMIUM</div>}
          {r.verified
            ? <div className="verified-badge">✓ VERIFIED</div>
            : <div className="not-verified">Verification pending</div>}
        </div>
        <div className="room-type">{r.type} sharing</div>
        <h3>{r.name}</h3>
        <div className="locality">{r.college}, {r.city}</div>
      </div>
      <div className="tear-line"></div>
      <div className="card-body">
        <div className="price-row">
          <div className="price">₹{r.rent.toLocaleString('en-IN')}<span> /month</span></div>
          <div className="distance">📍 {r.distance} km from college</div>
        </div>
        <div className="amenities">
          {r.amenities.map((a, i) => <span key={i}>{iconFor(a)} {a}</span>)}
        </div>
        <div className="card-actions">
          <a
            className="btn-contact"
            href={`https://wa.me/${r.phone}?text=Hi%2C%20I%27d%20like%20more%20information%20about%20${encodeURIComponent(r.name)}`}
            target="_blank" rel="noreferrer"
            onClick={(e) => e.stopPropagation()}
          >
            Contact on WhatsApp
          </a>
          <button
            className={`btn-save ${isFavorited ? 'saved' : ''}`}
            title="Save"
            onClick={(e) => { e.stopPropagation(); onToggleFavorite(r.id); }}
          >
            {isFavorited ? '♥' : '♡'}
          </button>
        </div>
      </div>
    </div>
  );
}
