import { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { sb } from '../lib/supabase';
import { useAuth } from '../lib/AuthContext';

const API_BASE = 'https://mera-basera-backend.onrender.com/api';

export default function OwnerDashboard() {
  const { user, profile, loading, logout } = useAuth();
  const [listings, setListings] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ name: '', collage: '', city: '', room_type: 'Single', rent: '', distance_km: '', phone: '', amenities: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user && profile?.role === 'Owner') loadMyListings();
  }, [user, profile]);

  async function getToken() {
    const { data } = await sb.auth.getSession();
    return data.session?.access_token;
  }

  async function loadMyListings() {
    setFetching(true);
    const token = await getToken();
    const res = await fetch(`${API_BASE}/listings/mine`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      const data = await res.json();
      setListings(data);
    }
    setFetching(false);
  }

  function startEdit(listing) {
    setEditingId(listing.id);
    setForm({
      name: listing.name, collage: listing.collage, city: listing.city,
      room_type: listing.room_type, rent: listing.rent, distance_km: listing.distance_km,
      phone: listing.phone, amenities: listing.amenities || '',
    });
    setShowAddForm(true);
  }

  function startAdd() {
    setEditingId(null);
    setForm({ name: '', collage: '', city: '', room_type: 'Single', rent: '', distance_km: '', phone: '', amenities: '' });
    setShowAddForm(true);
  }

  async function submitForm(e) {
    e.preventDefault();
    setSaving(true);
    const token = await getToken();
    const url = editingId ? `${API_BASE}/listings/${editingId}` : `${API_BASE}/listings`;
    const method = editingId ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        name: form.name, collage: form.collage, city: form.city, room_type: form.room_type,
        rent: parseInt(form.rent, 10), distance_km: parseFloat(form.distance_km),
        phone: form.phone, amenities: form.amenities,
      }),
    });

    setSaving(false);
    if (res.ok) {
      setShowAddForm(false);
      loadMyListings();
    } else {
      const data = await res.json();
      alert(data.error || 'Something went wrong');
    }
  }

  async function deleteListing(id) {
    if (!confirm('Are you sure you want to delete this listing? This cannot be undone.')) return;
    const token = await getToken();
    const res = await fetch(`${API_BASE}/listings/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      setListings(listings.filter(l => l.id !== id));
    } else {
      alert('Could not delete listing');
    }
  }

  if (loading) return null;
  if (!user) return <Navigate to="/" replace />;
  if (profile?.role !== 'Owner') return <Navigate to="/" replace />;

  const total = listings.length;
  const verifiedCount = listings.filter(l => l.verified).length;
  const pendingCount = total - verifiedCount;

  return (
    <>
      <nav>
        <Link to="/" className="logo" style={{ textDecoration: 'none' }}>
          <div className="logo-mark">M</div>
          <div>Mera Basera<span className="logo-sub">STUDENT ROOM &amp; PG FINDER</span></div>
        </Link>
        <Link to="/" className="back">← Back to search</Link>
      </nav>

      <div className="page-wrap" style={{ maxWidth: 960 }}>
        <div className="profile-card">
          <div className="profile-info">
            <h1>{profile.name}</h1>
            <span className="role-tag">{profile.role}</span>
            <p>{profile.college_or_business}</p>
          </div>
          <button className="logout-btn" onClick={logout}>Logout</button>
        </div>

        <div className="fav-grid" style={{ marginBottom: 30 }}>
          <div className="fav-card" style={{ padding: 20, textAlign: 'center' }}>
            <div className="price" style={{ fontSize: '1.8rem' }}>{total}</div>
            <div className="locality">Total Listings</div>
          </div>
          <div className="fav-card" style={{ padding: 20, textAlign: 'center' }}>
            <div className="price" style={{ fontSize: '1.8rem', color: '#2F6F6B' }}>{verifiedCount}</div>
            <div className="locality">Verified</div>
          </div>
          <div className="fav-card" style={{ padding: 20, textAlign: 'center' }}>
            <div className="price" style={{ fontSize: '1.8rem', color: '#D6573F' }}>{pendingCount}</div>
            <div className="locality">Pending</div>
          </div>
        </div>

        <div className="section-head">
          <h2>My Listings</h2>
          <button className="btn-submit" style={{ width: 'auto', padding: '8px 18px' }} onClick={startAdd}>+ Add Listing</button>
        </div>

        {fetching ? null : listings.length === 0 ? (
          <div className="empty-state">
            <h3 style={{ marginBottom: 8 }}>No listings yet</h3>
            <p>Add your first property to start reaching students.</p>
          </div>
        ) : (
          <div className="fav-grid">
            {listings.map(l => (
              <div className="fav-card" key={l.id}>
                {l.photo_url ? <img src={l.photo_url} className="fav-photo" alt="" /> : <div className="fav-photo-placeholder">M</div>}
                <div className="fav-body">
                  <h3>{l.name}</h3>
                  <div className="locality">{l.collage}, {l.city} — {l.room_type}</div>
                  <div className="price">₹{Number(l.rent).toLocaleString('en-IN')}<span style={{ fontSize: '0.7rem', fontWeight: 400, color: '#888' }}> /month</span></div>
                  <div style={{ marginBottom: 10 }}>
                    {l.verified
                      ? <span className="verified-badge">✓ VERIFIED</span>
                      : <span className="not-verified">Pending</span>}
                  </div>
                  <div className="fav-actions">
                    <button className="btn-contact" onClick={() => startEdit(l)}>Edit</button>
                    <button className="btn-unsave" onClick={() => deleteListing(l.id)}>✕</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showAddForm && (
        <div className="overlay open" onClick={(e) => e.target === e.currentTarget && setShowAddForm(false)}>
          <div className="modal" style={{ maxWidth: 460 }}>
            <button className="modal-close" onClick={() => setShowAddForm(false)}>✕</button>
            <div className="modal-head">
              <div className="room-type">{editingId ? 'EDIT LISTING' : 'ADD LISTING'}</div>
              <h2>{editingId ? 'Update your property' : 'Register a new property'}</h2>
            </div>
            <div className="modal-body">
              <form onSubmit={submitForm}>
                <div className="form-group"><label>Property/PG name</label><input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
                <div className="form-group"><label>College</label><input required value={form.collage} onChange={e => setForm({ ...form, collage: e.target.value })} /></div>
                <div className="form-row">
                  <div className="form-group"><label>City</label><input required value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} /></div>
                  <div className="form-group"><label>Distance (km)</label><input type="number" step="0.1" required value={form.distance_km} onChange={e => setForm({ ...form, distance_km: e.target.value })} /></div>
                </div>
                <div className="form-row">
                  <div className="form-group"><label>Room type</label>
                    <select value={form.room_type} onChange={e => setForm({ ...form, room_type: e.target.value })}>
                      <option value="Single">Single</option><option value="Double">Double</option><option value="Triple">Triple</option>
                    </select>
                  </div>
                  <div className="form-group"><label>Rent (₹/month)</label><input type="number" required value={form.rent} onChange={e => setForm({ ...form, rent: e.target.value })} /></div>
                </div>
                <div className="form-group"><label>Amenities (comma-separated)</label><input value={form.amenities} onChange={e => setForm({ ...form, amenities: e.target.value })} placeholder="WiFi,Meals,AC" /></div>
                <div className="form-group"><label>WhatsApp number</label><input required value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></div>
                <button type="submit" className="btn-submit" disabled={saving}>{saving ? 'Saving...' : editingId ? 'Update listing' : 'Create listing'}</button>
              </form>
            </div>
          </div>
        </div>
      )}

      <footer>Mera Basera — Student Room &amp; PG Finder.</footer>
    </>
  );
}
