import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { sb } from '../lib/supabase';
import { useAuth } from '../lib/AuthContext';

export default function Dashboard() {
  const { user, profile, logout, loading } = useAuth();
  const [favs, setFavs] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [myRoommateListing, setMyRoommateListing] = useState(null);
  const [editingRoommate, setEditingRoommate] = useState(false);
  const [rmForm, setRmForm] = useState({ name: '', college: '', budget: '', gender: 'Male', preferences: '', phone: '' });
  const [savingRoommate, setSavingRoommate] = useState(false);

  useEffect(() => {
    if (user) {
      loadFavorites();
      loadMyRoommateListing();
    }
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

  async function loadMyRoommateListing() {
    const { data } = await sb.from('roommates').select('*').eq('user_id', user.id).maybeSingle();
    setMyRoommateListing(data || null);
    if (data) {
      setRmForm({
        name: data.name, college: data.college, budget: data.budget,
        gender: data.gender, preferences: data.preferences || '', phone: data.phone,
      });
    }
  }

  function startEditRoommate() {
    setEditingRoommate(true);
  }

  async function saveRoommateListing(e) {
    e.preventDefault();
    setSavingRoommate(true);
    const payload = {
      name: rmForm.name, college: rmForm.college, budget: parseInt(rmForm.budget, 10),
      gender: rmForm.gender, preferences: rmForm.preferences, phone: rmForm.phone,
    };
    if (myRoommateListing) {
      await sb.from('roommates').update(payload).eq('id', myRoommateListing.id).eq('user_id', user.id);
    } else {
      await sb.from('roommates').insert({ ...payload, user_id: user.id });
    }
    setSavingRoommate(false);
    setEditingRoommate(false);
    loadMyRoommateListing();
  }

  async function deleteRoommateListing() {
    if (!confirm('Delete your roommate listing? This cannot be undone.')) return;
    await sb.from('roommates').delete().eq('id', myRoommateListing.id).eq('user_id', user.id);
    setMyRoommateListing(null);
    setRmForm({ name: '', college: '', budget: '', gender: 'Male', preferences: '', phone: '' });
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
              <div className="fav-grid" style={{ marginBottom: 40 }}>
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

            <div className="section-head">
              <h2>🏠 My Roommate Listing</h2>
            </div>

            {!myRoommateListing && !editingRoommate && (
              <div className="empty-state">
                <h3 style={{ marginBottom: 8 }}>You haven't listed yourself yet</h3>
                <p>Add yourself to the roommate finder so other students can find you.</p>
                <button className="btn-submit" style={{ width: 'auto', padding: '10px 20px', marginTop: 14 }} onClick={startEditRoommate}>+ Add my listing</button>
              </div>
            )}

            {myRoommateListing && !editingRoommate && (
              <div className="fav-card" style={{ marginBottom: 40, maxWidth: 400 }}>
                <div className="fav-body">
                  <h3>{myRoommateListing.name}</h3>
                  <div className="locality">{myRoommateListing.college} · {myRoommateListing.gender}</div>
                  <div className="price" style={{ fontSize: '1.1rem' }}>₹{Number(myRoommateListing.budget).toLocaleString('en-IN')}<span style={{ fontSize: '0.7rem', fontWeight: 400, color: '#888' }}> /month budget</span></div>
                  {myRoommateListing.preferences && <div className="locality" style={{ marginTop: 6 }}>{myRoommateListing.preferences}</div>}
                  <div className="fav-actions" style={{ marginTop: 12 }}>
                    <button className="btn-contact" onClick={startEditRoommate}>Edit</button>
                    <button className="btn-unsave" onClick={deleteRoommateListing}>✕</button>
                  </div>
                </div>
              </div>
            )}

            {editingRoommate && (
              <div className="card-form" style={{ maxWidth: 460, marginBottom: 40 }}>
                <form onSubmit={saveRoommateListing}>
                  <div className="form-group"><label>Your name</label><input required value={rmForm.name} onChange={e => setRmForm({ ...rmForm, name: e.target.value })} /></div>
                  <div className="form-group"><label>College</label><input required value={rmForm.college} onChange={e => setRmForm({ ...rmForm, college: e.target.value })} /></div>
                  <div className="form-row">
                    <div className="form-group"><label>Monthly budget (₹)</label><input type="number" required value={rmForm.budget} onChange={e => setRmForm({ ...rmForm, budget: e.target.value })} /></div>
                    <div className="form-group"><label>Gender</label>
                      <select value={rmForm.gender} onChange={e => setRmForm({ ...rmForm, gender: e.target.value })}>
                        <option value="Male">Male</option><option value="Female">Female</option>
                      </select>
                    </div>
                  </div>
                  <div className="form-group"><label>Preferences (comma-separated)</label><input value={rmForm.preferences} onChange={e => setRmForm({ ...rmForm, preferences: e.target.value })} placeholder="e.g. Non-smoker, early sleeper" /></div>
                  <div className="form-group"><label>WhatsApp number</label><input required value={rmForm.phone} onChange={e => setRmForm({ ...rmForm, phone: e.target.value })} /></div>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button type="submit" className="btn-submit" disabled={savingRoommate}>{savingRoommate ? 'Saving...' : 'Save'}</button>
                    <button type="button" className="btn-unsave" style={{ padding: '13px 20px' }} onClick={() => setEditingRoommate(false)}>Cancel</button>
                  </div>
                </form>
              </div>
            )}
          </>
        )}
      </div>

      <footer>Mera Basera — Student Room &amp; PG Finder.</footer>
    </>
  );
}
