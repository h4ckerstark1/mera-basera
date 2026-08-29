import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { sb } from '../lib/supabase';
import { useAuth } from '../lib/AuthContext';
import ListingCard from '../components/ListingCard';
import DetailModal from '../components/DetailModal';
import RoommateModal from '../components/RoommateModal';

export default function Home({ onNeedAuth }) {
  const { user } = useAuth();
  const [listings, setListings] = useState([]);
  const [query, setQuery] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [budget, setBudget] = useState('');
  const [roomType, setRoomType] = useState('');
  const [verifiedOnly, setVerifiedOnly] = useState('');
  const [favoriteIds, setFavoriteIds] = useState(new Set());
  const [selectedListing, setSelectedListing] = useState(null);
  const [roommateOpen, setRoommateOpen] = useState(false);

  const [feedback, setFeedback] = useState([]);
  const [fbForm, setFbForm] = useState({ name: '', role: 'Student', message: '' });
  const [fbOpen, setFbOpen] = useState(false);
  const [fbSuccess, setFbSuccess] = useState(false);

  useEffect(() => { loadListings(); loadFeedback(); }, []);
  useEffect(() => { if (user) loadFavorites(); else setFavoriteIds(new Set()); }, [user]);

  async function loadListings() {
  try {
    const res = await fetch('http://localhost:5000/api/listings');

    if (!res.ok) {
      throw new Error('Failed to fetch listings');
    }

    const data = await res.json();

    setListings(
      data.map(row => ({
        id: row.id,
        college: row.collage,
        city: row.city,
        name: row.name,
        type: row.room_type,
        rent: Number(row.rent),
        distance: row.distance_km,
        amenities: row.amenities
          ? String(row.amenities).split(',').map(s => s.trim()).filter(Boolean)
          : [],
        verified: row.verified,
        phone: row.phone || '',
        photoUrl: row.photo_url || null,
        isPremium: row.is_premium || false,
      }))
    );
  } catch (error) {
    console.error('Failed to load listings:', error);
    setListings([]);
  }
}

  async function loadFeedback() {
    const { data } = await sb.from('feedback').select('*').eq('approved', true).order('id', { ascending: false });
    setFeedback(data || []);
  }

  async function loadFavorites() {
    const { data } = await sb.from('favorites').select('listing_id').eq('user_id', user.id);
    setFavoriteIds(new Set((data || []).map(f => f.listing_id)));
  }

  async function toggleFavorite(listingId) {
    if (!user) { onNeedAuth(); return; }
    const next = new Set(favoriteIds);
    if (next.has(listingId)) {
      await sb.from('favorites').delete().eq('user_id', user.id).eq('listing_id', listingId);
      next.delete(listingId);
    } else {
      await sb.from('favorites').insert({ user_id: user.id, listing_id: listingId });
      next.add(listingId);
    }
    setFavoriteIds(next);
  }

  async function submitFeedback(e) {
    e.preventDefault();
    await sb.from('feedback').insert({ ...fbForm, approved: false });
    setFbSuccess(true);
    setFbForm({ name: '', role: 'Student', message: '' });
  }

  function runSearch() { setQuery(searchInput); }
  function quickSearch(name) { setSearchInput(name); setQuery(name); }

  let filtered = query ? listings : [];
  if (query) {
    const lower = query.toLowerCase();
    filtered = filtered.filter(r => r.college.toLowerCase().includes(lower) || r.city.toLowerCase().includes(lower));
  }
  if (budget) filtered = filtered.filter(r => r.rent <= parseInt(budget));
  if (roomType) filtered = filtered.filter(r => r.type === roomType);
  if (verifiedOnly) filtered = filtered.filter(r => r.verified);
  filtered = [...filtered].sort((a, b) => (b.isPremium === true) - (a.isPremium === true));

  return (
    <>
      <section className="hero">
        <div className="hero-dots hero-dots-tl"></div>
        <div className="hero-dots hero-dots-br"></div>
        <div className="hero-inner">
          <div className="trust-badge">🛡️ Trusted by Students. Verified by Us.</div>
          <h1>Find a <span>home away from home</span> near your college</h1>
          <p>Type your college name and instantly see verified rooms and PGs nearby — no wandering around, no wasted time.</p>
          <div className="search-box">
            <span className="search-icon">🔍</span>
            <input
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && runSearch()}
              placeholder="Enter your college name — e.g. Ambalika University, Lucknow"
            />
            <button onClick={runSearch}>Search</button>
          </div>
          <div className="search-hints">
            Try:
            <button onClick={() => quickSearch('Ambalika University')}>Ambalika University</button>
            <button onClick={() => quickSearch('Lucknow University')}>Lucknow University</button>
            <button onClick={() => quickSearch('IIT Kanpur')}>IIT Kanpur</button>
          </div>
          <div className="hero-features">
            <div className="hero-feature"><span className="hf-icon">🛡️</span><div><strong>Verified Listings</strong><small>100% verified rooms &amp; PGs</small></div></div>
            <div className="hero-feature"><span className="hf-icon">📍</span><div><strong>Near Your College</strong><small>Find stays close to campus</small></div></div>
            <div className="hero-feature"><span className="hf-icon">⏱️</span><div><strong>Save Time &amp; Money</strong><small>No more endless searching</small></div></div>
            <div className="hero-feature"><span className="hf-icon">👥</span><div><strong>Trusted by Students</strong><small>Loved by thousands</small></div></div>
          </div>
        </div>
      </section>

      <div className="results-wrap" id="results">
        <div className="results-header">
          <h2>{query ? `Rooms near "${query}"` : 'All available rooms'}</h2>
          <div className="count">{filtered.length} listings found</div>
        </div>
        <div className="filters">
          <select value={budget} onChange={e => setBudget(e.target.value)}>
            <option value="">Budget — any</option>
            <option value="5000">Up to ₹5000</option>
            <option value="7000">Up to ₹7000</option>
            <option value="10000">Up to ₹10000</option>
          </select>
          <select value={roomType} onChange={e => setRoomType(e.target.value)}>
            <option value="">Room type — any</option>
            <option value="Single">Single sharing</option>
            <option value="Double">Double sharing</option>
            <option value="Triple">Triple sharing</option>
          </select>
          <select value={verifiedOnly} onChange={e => setVerifiedOnly(e.target.value)}>
            <option value="">All listings</option>
            <option value="yes">Verified only</option>
          </select>
        </div>
        <div className="grid">
          {filtered.length === 0 ? (
            <div className="no-results" style={{ gridColumn: '1/-1' }}>
              <h3>No listings found</h3>
              <p>No owner has registered near this college yet. Try a different name, like "Ambalika University".</p>
            </div>
          ) : filtered.map((r, i) => (
            <ListingCard
              key={r.id} listing={r} index={i}
              isFavorited={favoriteIds.has(r.id)}
              onToggleFavorite={toggleFavorite}
              onClick={(id) => setSelectedListing(filtered.find(x => x.id === id))}
            />
          ))}
        </div>
      </div>

      <section className="strip">
        <div className="strip-inner">
          <div className="strip-card">
            <h3>🏠 Looking for a roommate?</h3>
            <p>Share a room with fellow students from your college — lower cost, and you won't be alone.</p>
            <a href="#" onClick={(e) => { e.preventDefault(); setRoommateOpen(true); }}>Find a roommate</a>
          </div>
          <div className="strip-card" id="owner">
            <h3>🔑 Are you a Room/PG owner?</h3>
            <p>List your property and reach students directly — verification adds extra trust.</p>
            <Link to="/register-owner">Register your room</Link>
          </div>
        </div>
      </section>

      <section className="testimonials">
        <div className="testimonials-inner">
          <div className="testimonials-head">
            <h2>What people are saying</h2>
            <button className="btn-feedback" onClick={() => setFbOpen(true)}>💬 Give Feedback</button>
          </div>
          <div className="testi-grid">
            {feedback.length === 0 ? (
              <div className="testi-empty">No feedback yet — be the first to share yours!</div>
            ) : feedback.map(f => (
              <div className="testi-card" key={f.id}>
                <div className="testi-quote">"{f.message}"</div>
                <div className="testi-author">{f.name}</div>
                <div className="testi-role">{f.role}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer>Mera Basera — Student Room &amp; PG Finder.</footer>

      {selectedListing && <DetailModal listing={selectedListing} onClose={() => setSelectedListing(null)} />}
      <RoommateModal open={roommateOpen} onClose={() => setRoommateOpen(false)} />

      {fbOpen && (
        <div className="overlay open" onClick={(e) => e.target === e.currentTarget && setFbOpen(false)}>
          <div className="modal" style={{ maxWidth: 460 }}>
            <button className="modal-close" onClick={() => { setFbOpen(false); setFbSuccess(false); }}>✕</button>
            <div className="modal-head">
              <div className="room-type">FEEDBACK</div>
              <h2>Tell us what you think</h2>
              <div className="locality">We read every message — good or bad</div>
            </div>
            {!fbSuccess ? (
              <div className="modal-body">
                <form onSubmit={submitFeedback}>
                  <div className="form-group"><label>Your name</label><input required value={fbForm.name} onChange={e => setFbForm({ ...fbForm, name: e.target.value })} placeholder="e.g. Ayush Sharma" /></div>
                  <div className="form-group"><label>You are a</label>
                    <select value={fbForm.role} onChange={e => setFbForm({ ...fbForm, role: e.target.value })}>
                      <option value="Student">Student</option>
                      <option value="Room/PG Owner">Room/PG Owner</option>
                    </select>
                  </div>
                  <div className="form-group"><label>Your feedback</label><input required value={fbForm.message} onChange={e => setFbForm({ ...fbForm, message: e.target.value })} placeholder="What did you think of Mera Basera?" /></div>
                  <button type="submit" className="btn-submit">Submit feedback</button>
                </form>
              </div>
            ) : (
              <div className="form-success show">
                <div className="tick">✅</div>
                <h3>Thank you!</h3>
                <p>Your feedback has been recorded. We appreciate you taking the time.</p>
                <button className="btn-submit" style={{ marginTop: 20 }} onClick={() => { setFbOpen(false); setFbSuccess(false); }}>Got it</button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
