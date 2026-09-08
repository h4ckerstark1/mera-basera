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
    const res = await fetch('https://mera-basera-backend.onrender.com/api/listings');

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
    <div className="min-h-screen bg-[#F7F5EF] font-sans text-[#071426]">
      {/* HERO SECTION (Navbar Removed as per request) */}
      <div className="relative bg-[#071426] min-h-[90vh] flex flex-col overflow-hidden">
        {/* Right-Side Building Image with Gradient Overlay */}
        <div className="absolute inset-0 z-0 flex justify-end pointer-events-none">
          <div className="w-full lg:w-1/2 h-full relative">
            <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-[#071426] via-[#071426]/90 to-transparent z-10"></div>
            <img 
              src="https://images.unsplash.com/photo-1555854877-bab0e564b8d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80" 
              alt="Premium Student Housing" 
              className="object-cover w-full h-full opacity-50"
            />
          </div>
        </div>

        {/* HERO CONTENT */}
        <div className="relative z-20 flex-1 flex flex-col justify-center px-6 lg:px-12 max-w-4xl mt-12 lg:mt-0 pt-16 lg:pt-0">
          <div className="inline-flex items-center gap-2 bg-[#142544] border border-[#142544] px-4 py-1.5 rounded-full w-fit mb-6 shadow-lg">
            <span className="text-[#F5B72D]">🛡️</span>
            <span className="text-[#AEB8C8] text-sm font-medium">Trusted by Students. Verified by Us.</span>
          </div>

          <h2 className="text-5xl lg:text-7xl font-serif text-white font-bold leading-[1.1] mb-6">
            Find a <span className="text-[#F5B72D] italic">home away <br className="hidden lg:block"/> from home</span> near <br className="hidden lg:block"/> your college
          </h2>
          
          <p className="text-[#AEB8C8] text-lg lg:text-xl max-w-2xl mb-10 leading-relaxed">
            Type your college name and instantly see verified rooms and PGs nearby — no wandering around, no wasted time.
          </p>

          {/* SEARCH BAR */}
          <div className="bg-white p-2 rounded-full flex items-center shadow-2xl max-w-2xl w-full mb-6">
            <div className="pl-6 pr-3 text-gray-400">🔍</div>
            <input 
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && runSearch()}
              placeholder="Enter your college name — e.g. Ambalika University, Lucknow"
              className="flex-1 bg-transparent border-none outline-none text-[#071426] text-base lg:text-lg placeholder-gray-400 w-full"
            />
            <button 
              onClick={runSearch}
              className="bg-[#F5B72D] hover:bg-[#e0a626] text-[#071426] font-bold px-6 lg:px-8 py-3 lg:py-4 rounded-full transition shadow-md text-base lg:text-lg">
              Search
            </button>
          </div>

          {/* QUICK SEARCH */}
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <span className="text-[#AEB8C8]">Try:</span>
            {['Ambalika University', 'Lucknow University', 'IIT Kanpur'].map((college) => (
              <button 
                key={college}
                onClick={() => quickSearch(college)}
                className="border border-[#AEB8C8]/30 text-[#AEB8C8] hover:text-white hover:border-[#F5B72D] px-4 py-1.5 rounded-full transition bg-[#142544]/50 backdrop-blur-sm">
                {college}
              </button>
            ))}
          </div>
        </div>

        {/* TRUST FEATURES */}
        <div className="relative z-20 border-t border-white/10 bg-[#071426]/80 backdrop-blur-md mt-12 lg:mt-auto">
          <div className="px-6 lg:px-12 py-6 grid grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex flex-col"><span className="text-[#F5B72D] text-2xl mb-2">🛡️</span><h4 className="text-white font-semibold text-sm lg:text-base">Verified Listings</h4><p className="text-[#AEB8C8] text-xs lg:text-sm mt-1">100% verified rooms & PGs</p></div>
            <div className="flex flex-col"><span className="text-[#F5B72D] text-2xl mb-2">📍</span><h4 className="text-white font-semibold text-sm lg:text-base">Near Your College</h4><p className="text-[#AEB8C8] text-xs lg:text-sm mt-1">Find stays close to campus</p></div>
            <div className="flex flex-col"><span className="text-[#F5B72D] text-2xl mb-2">⏱️</span><h4 className="text-white font-semibold text-sm lg:text-base">Save Time & Money</h4><p className="text-[#AEB8C8] text-xs lg:text-sm mt-1">No more endless searching</p></div>
            <div className="flex flex-col"><span className="text-[#F5B72D] text-2xl mb-2">👥</span><h4 className="text-white font-semibold text-sm lg:text-base">Trusted by Students</h4><p className="text-[#AEB8C8] text-xs lg:text-sm mt-1">Loved by thousands</p></div>
          </div>
        </div>
      </div>

      {/* LISTINGS SECTION */}
      <div id="results" className="max-w-7xl mx-auto px-6 lg:px-12 py-16 lg:py-24">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-10 gap-4">
          <div>
            <h3 className="text-3xl lg:text-4xl font-extrabold text-[#071426] mb-2">{query ? `Rooms near "${query}"` : 'Find your perfect stay'}</h3>
            <p className="text-gray-600 text-lg">Verified rooms and PGs near your college</p>
          </div>
          <div className="text-[#071426] font-semibold bg-gray-200 px-4 py-2 rounded-lg text-sm flex items-center h-fit">
            {filtered.length} listings found
          </div>
        </div>

        {/* FILTERS */}
        <div className="flex flex-wrap gap-4 mb-10 pb-6 border-b border-gray-300">
          <select value={budget} onChange={e => setBudget(e.target.value)} className="px-4 py-2.5 bg-white border border-gray-300 rounded-lg shadow-sm outline-none text-[#071426] font-medium focus:border-[#F5B72D] cursor-pointer">
            <option value="">Budget — any</option>
            <option value="5000">Up to ₹5000</option>
            <option value="7000">Up to ₹7000</option>
            <option value="10000">Up to ₹10000</option>
          </select>
          <select value={roomType} onChange={e => setRoomType(e.target.value)} className="px-4 py-2.5 bg-white border border-gray-300 rounded-lg shadow-sm outline-none text-[#071426] font-medium focus:border-[#F5B72D] cursor-pointer">
            <option value="">Room type — any</option>
            <option value="Single">Single sharing</option>
            <option value="Double">Double sharing</option>
            <option value="Triple">Triple sharing</option>
          </select>
          <select value={verifiedOnly} onChange={e => setVerifiedOnly(e.target.value)} className="px-4 py-2.5 bg-white border border-gray-300 rounded-lg shadow-sm outline-none text-[#071426] font-medium focus:border-[#F5B72D] cursor-pointer">
            <option value="">All listings</option>
            <option value="yes">Verified only</option>
          </select>
        </div>

        {/* GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filtered.length === 0 ? (
            <div className="col-span-full bg-white p-12 text-center rounded-2xl border border-dashed border-gray-300 shadow-sm">
              <h3 className="text-xl font-bold text-[#071426] mb-2">No listings found</h3>
              <p className="text-gray-500">No owner has registered near this college yet. Try a different name, like "Ambalika University".</p>
            </div>
          ) : (
            filtered.map((r, i) => (
              <ListingCard
                key={r.id} listing={r} index={i}
                isFavorited={favoriteIds.has(r.id)}
                onToggleFavorite={toggleFavorite}
                onClick={(id) => setSelectedListing(filtered.find(x => x.id === id))}
              />
            ))
          )}
        </div>
      </div>

      {/* STRIP (Roommate & Owner) */}
      <section className="bg-white py-16 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-[#F7F5EF] p-8 rounded-2xl border border-gray-200 shadow-sm">
            <h3 className="text-2xl font-bold text-[#071426] mb-3">🏠 Looking for a roommate?</h3>
            <p className="text-gray-600 mb-6">Share a room with fellow students from your college — lower cost, and you won't be alone.</p>
            <a href="#" onClick={(e) => { e.preventDefault(); setRoommateOpen(true); }} className="inline-block bg-[#071426] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#142544] transition">Find a roommate</a>
          </div>
          <div className="bg-[#142544] p-8 rounded-2xl shadow-sm text-white">
            <h3 className="text-2xl font-bold text-white mb-3">🔑 Are you a Room/PG owner?</h3>
            <p className="text-[#AEB8C8] mb-6">List your property and reach students directly — verification adds extra trust.</p>
            <Link to="/register-owner" className="inline-block bg-[#F5B72D] text-[#071426] px-6 py-3 rounded-lg font-bold hover:bg-[#e0a626] transition">Register your room</Link>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-16 bg-[#F7F5EF]">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
            <h2 className="text-3xl font-extrabold text-[#071426]">What people are saying</h2>
            <button onClick={() => setFbOpen(true)} className="bg-white border border-gray-300 text-[#071426] px-5 py-2.5 rounded-full font-medium shadow-sm hover:border-[#F5B72D] transition flex items-center gap-2">
              💬 Give Feedback
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {feedback.length === 0 ? (
              <div className="col-span-full text-center text-gray-500 py-10 bg-white rounded-xl border border-dashed border-gray-300">
                No feedback yet — be the first to share yours!
              </div>
            ) : (
              feedback.map(f => (
                <div key={f.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                  <div className="text-gray-700 italic mb-4">"{f.message}"</div>
                  <div className="font-bold text-[#071426]">{f.name}</div>
                  <div className="text-sm text-[#F5B72D] font-medium">{f.role}</div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      <footer className="bg-[#071426] text-[#AEB8C8] text-center py-8 text-sm">
        Mera Basera — Student Room &amp; PG Finder.
      </footer>

      {/* MODALS */}
      {selectedListing && <DetailModal listing={selectedListing} onClose={() => setSelectedListing(null)} />}
      <RoommateModal open={roommateOpen} onClose={() => setRoommateOpen(false)} onNeedAuth={onNeedAuth} />

      {/* FEEDBACK MODAL RE-STYLED */}
      {fbOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={(e) => e.target === e.currentTarget && setFbOpen(false)}>
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden relative shadow-2xl">
            <button className="absolute top-4 right-4 text-gray-400 hover:text-white text-xl font-bold z-10" onClick={() => { setFbOpen(false); setFbSuccess(false); }}>✕</button>
            <div className="bg-[#142544] p-6 text-white pt-8">
              <div className="text-[#F5B72D] text-xs font-bold tracking-widest mb-1">FEEDBACK</div>
              <h2 className="text-2xl font-bold mb-1">Tell us what you think</h2>
              <div className="text-[#AEB8C8] text-sm">We read every message — good or bad</div>
            </div>
            
            <div className="p-6">
              {!fbSuccess ? (
                <form onSubmit={submitFeedback} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Your name</label>
                    <input required value={fbForm.name} onChange={e => setFbForm({ ...fbForm, name: e.target.value })} placeholder="e.g. Ayush Sharma" className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:border-[#142544]" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">You are a</label>
                    <select value={fbForm.role} onChange={e => setFbForm({ ...fbForm, role: e.target.value })} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:border-[#142544]">
                      <option value="Student">Student</option>
                      <option value="Room/PG Owner">Room/PG Owner</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Your feedback</label>
                    <textarea required value={fbForm.message} onChange={e => setFbForm({ ...fbForm, message: e.target.value })} placeholder="What did you think of Mera Basera?" className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:border-[#142544] min-h-[100px]"></textarea>
                  </div>
                  <button type="submit" className="w-full bg-[#F5B72D] text-[#071426] font-bold py-3 rounded-lg hover:bg-[#e0a626] transition mt-2">Submit feedback</button>
                </form>
              ) : (
                <div className="text-center py-6">
                  <div className="text-5xl mb-4">✅</div>
                  <h3 className="text-2xl font-bold text-[#071426] mb-2">Thank you!</h3>
                  <p className="text-gray-600 mb-6">Your feedback has been recorded. We appreciate you taking the time.</p>
                  <button onClick={() => { setFbOpen(false); setFbSuccess(false); }} className="w-full bg-[#142544] text-white font-bold py-3 rounded-lg hover:bg-[#071426] transition">Got it</button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );

}