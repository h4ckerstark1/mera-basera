import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { sb } from '../lib/supabase';
import { useAuth } from '../lib/AuthContext';

export default function Dashboard() {
  const { user, profile, logout, loading } = useAuth();
  const [favs, setFavs] = useState([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (user) loadFavorites();
  }, [user]);

  async function loadFavorites() {
    setFetching(true);
    const { data } = await sb
      .from('favorites')
      .select('listing_id, listings(*)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    setFavs(data || []);
    setFetching(false);
  }

  async function removeFavorite(listingId) {
    await sb.from('favorites').delete().eq('user_id', user.id).eq('listing_id', listingId);
    setFavs(favs.filter(f => f.listing_id !== listingId));
  }

  if (loading) return null;

  return (
    <>
      <nav>
        <Link to="/" className="logo" style={{ textDecoration: 'none' }}>
          <div className="logo-mark">M</div>
          <div>Mera Basera<span className="logo-sub">STUDENT ROOM &amp; PG FINDER</span></div>
        </Link>
        <Link to="/" className="back">← Back to search</Link>
      </nav>

      <div className="page-wrap">
        {!user ? (
          <div className="empty-state">
            <h3 style={{ marginBottom: 8 }}>You need to log in first</h3>
            <p>Please go to the homepage and log in to see your dashboard.</p>
            <p style={{ marginTop: 14 }}><Link to="/">← Go to homepage</Link></p>
          </div>
        ) : (
          <>
            <div className="profile-card">
              <div className="profile-info">
                <h1>{profile ? profile.name : user.email}</h1>
                <span className="role-tag">{profile ? profile.role : '—'}</span>
                <p>{profile && profile.college_or_business ? profile.college_or_business : user.email}</p>
              </div>
              <button className="logout-btn" onClick={logout}>Logout</button>
            </div>

            <div className="section-head">
              <h2>❤️ Saved Listings</h2>
              <div className="count">{favs.length} saved</div>
            </div>

            {fetching ? null : favs.length === 0 ? (
              <div className="empty-state">
                <h3 style={{ marginBottom: 8 }}>No saved listings yet</h3>
                <p>Browse rooms on the homepage and tap ♡ to save your favorites here.</p>
                <p style={{ marginTop: 14 }}><Link to="/">← Browse listings</Link></p>
              </div>
            ) : (
              <div className="fav-grid">
                {favs.map(f => {
                  const l = f.listings;
                  if (!l) return null;
                  return (
                    <div className="fav-card" key={l.id}>
                      {l.photo_url
                        ? <img src={l.photo_url} className="fav-photo" alt="" />
                        : <div className="fav-photo-placeholder">M</div>}
                      <div className="fav-body">
                        <h3>{l.name}</h3>
                        <div className="locality">{l.college}, {l.city} · {l.distance_km} km away</div>
                        <div className="price">₹{Number(l.rent).toLocaleString('en-IN')}<span style={{ fontSize: '0.7rem', fontWeight: 400, color: '#888' }}> /month</span></div>
                        <div className="fav-actions">
                          <a className="btn-contact" href={`https://wa.me/${l.phone || '919999999999'}?text=Hi%2C%20I%27d%20like%20more%20information%20about%20${encodeURIComponent(l.name)}`} target="_blank" rel="noreferrer">WhatsApp</a>
                          <button className="btn-unsave" onClick={() => removeFavorite(l.id)} title="Remove">✕</button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>

      <footer>Mera Basera — Student Room &amp; PG Finder.</footer>
    </>
  );
}
