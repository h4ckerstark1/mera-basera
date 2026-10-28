import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { sb } from '../lib/supabase';
import { useAuth } from '../lib/AuthContext';
import ListingCard from '../components/ListingCard';
import DetailModal from '../components/DetailModal';
import RoommateModal from '../components/RoommateModal';

const quickSearches = ['Ambalika University', 'Lucknow University', 'IIT Kanpur'];

const cityCards = [
  { name: 'Lucknow', detail: 'Ambalika University and nearby campuses', tone: 'lucknow' },
  { name: 'Kanpur', detail: 'IIT Kanpur neighbourhoods', tone: 'kanpur' },
  { name: 'New Delhi', detail: 'DU North Campus and beyond', tone: 'delhi' },
  { name: 'Jaipur', detail: 'Malviya Nagar and Jagatpura', tone: 'jaipur' },
  { name: 'Pune', detail: 'Student life, sorted', tone: 'pune' },
];

const amenityGroups = [
  {
    category: 'Room & furniture',
    items: ['Bed', 'Study Table', 'Wardrobe', 'Furnished', 'Attached Bathroom', 'Fan', 'AC', 'Geyser', 'Balcony', 'TV'],
  },
  {
    category: 'Food & kitchen',
    items: ['Wi-Fi', 'Food Included', 'Breakfast', 'Kitchen Access', 'Refrigerator', 'RO/Drinking Water', 'Cooking Allowed', 'Washing Machine'],
  },
  {
    category: 'Safety & security',
    items: ['CCTV', 'Security Guard', 'Secure Entry', 'Power Backup', 'Fire Safety', '24×7 Entry'],
  },
  {
    category: 'Parking & location',
    items: ['Bike Parking', 'Car Parking', 'Lift', 'Near Public Transport', 'Near College', 'Nearby Shops/Market'],
  },
  {
    category: 'Services',
    items: ['Housekeeping', 'Laundry Service', 'Regular Cleaning', 'Hot Water', 'Common Area', 'Garden/Terrace'],
  },
  {
    category: 'Student friendly',
    items: ['Study Room', 'Quiet Hours', 'Visitors Allowed', 'No Curfew', 'Short-Term Stay', 'Room Sharing Allowed'],
  },
];

function FeatureIcon({ children }) {
  return <span className="mb-feature-icon" aria-hidden="true">{children}</span>;
}

export default function Home({ onNeedAuth }) {
  const { user } = useAuth();
  const [listings, setListings] = useState([]);
  const [listingsStatus, setListingsStatus] = useState('loading');
  const [query, setQuery] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [budget, setBudget] = useState('');
  const [roomType, setRoomType] = useState('');
  const [verifiedOnly, setVerifiedOnly] = useState('');
  const [maxDistance, setMaxDistance] = useState('');
  const [subscription, setSubscription] = useState(null);
  const [subscriptionLoading, setSubscriptionLoading] = useState(true);
  const [minRent, setMinRent] = useState('');
  const [maxRent, setMaxRent] = useState('');
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const [sortBy, setSortBy] = useState('premium');
  const [premiumVerified, setPremiumVerified] = useState(false);
  const [favoriteIds, setFavoriteIds] = useState(new Set());
  const [selectedListing, setSelectedListing] = useState(null);
  const [roommateOpen, setRoommateOpen] = useState(false);
  const [feedback, setFeedback] = useState([]);
  const [fbForm, setFbForm] = useState({ name: '', role: 'Student', message: '' });
  const [fbOpen, setFbOpen] = useState(false);
  const [fbSuccess, setFbSuccess] = useState(false);

  useEffect(() => {
    async function loadSubscription() {
      if (!user) {
        setSubscription(null);
        setSubscriptionLoading(false);
        return;
      }

      setSubscriptionLoading(true);
      const { data, error } = await sb
        .from('subscriptions')
        .select('plan, status')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Subscription load error:', error);
        setSubscription(null);
      } else {
        setSubscription(data || null);
      }
      setSubscriptionLoading(false);
    }

    loadSubscription();
  }, [user]);

  useEffect(() => {
    loadListings();
    loadFeedback();
  }, []);

  useEffect(() => {
    if (user) loadFavorites();
    else setFavoriteIds(new Set());
  }, [user]);

  async function loadListings() {
    setListingsStatus('loading');

    try {
      const API_BASE = import.meta.env.VITE_API_BASE_URL;
      const listingsUrl = API_BASE
        ? `${API_BASE.replace(/\/$/, '')}/api/listings`
        : '/api/listings';

      const res = await fetch(listingsUrl);
      if (!res.ok) throw new Error(`Failed to fetch listings (HTTP ${res.status})`);
      const data = await res.json();
      if (!Array.isArray(data) || data.some((row) => !row || typeof row !== 'object' || Array.isArray(row))) {
        throw new Error('Listings response must be an array of listing objects');
      }

      setListings(data.map((row) => ({
        id: row.id,
        college: row.collage,
        city: row.city,
        name: row.name,
        type: row.room_type,
        rent: Number(row.rent),
        distance: Number(row.distance_km) || 0,
        amenities: Array.isArray(row.amenities_json)
          ? row.amenities_json
          : (row.amenities ? String(row.amenities).split(',').map((s) => s.trim()).filter(Boolean) : []),
        verified: row.verified === true,
        isPremium: row.is_premium === true,
        phone: row.phone || '',
        photoUrl: row.photo_url || null,
      })));
      setListingsStatus('success');
    } catch (error) {
      console.error('Failed to load listings:', error);
      setListings([]);
      setListingsStatus('error');
    }
  }

  async function loadFeedback() {
    const { data, error } = await sb
      .from('feedback')
      .select('*')
      .eq('approved', true)
      .order('id', { ascending: false });

    if (error) console.error('Feedback load error:', error);
    setFeedback(data || []);
  }

  async function loadFavorites() {
    const { data, error } = await sb.from('favorites').select('listing_id').eq('user_id', user.id);
    if (error) console.error('Favorites load error:', error);
    setFavoriteIds(new Set((data || []).map((favorite) => favorite.listing_id)));
  }

  async function toggleFavorite(listingId) {
    if (!user) {
      onNeedAuth();
      return;
    }

    const { data: currentSubscription } = await sb
      .from('subscriptions')
      .select('plan, status')
      .eq('user_id', user.id)
      .maybeSingle();

    const next = new Set(favoriteIds);

    if (next.has(listingId)) {
      await sb.from('favorites').delete().eq('user_id', user.id).eq('listing_id', listingId);
      next.delete(listingId);
      setFavoriteIds(next);
      return;
    }

    if (
      (!['standard', 'premium'].includes(currentSubscription?.plan) || currentSubscription?.status !== 'active') &&
      next.size >= 5
    ) {
      alert('Free plan mein maximum 5 listings save kar sakte ho. Unlimited favorites ke liye Pro plan lein.');
      return;
    }

    const { error } = await sb.from('favorites').insert({
      user_id: user.id,
      listing_id: listingId,
    });

    if (error) {
      console.error('Failed to save favorite:', error);
      alert('Favorite save nahi ho paya. Please try again.');
      return;
    }

    next.add(listingId);
    setFavoriteIds(next);
  }

  async function submitFeedback(event) {
    event.preventDefault();
    const { error } = await sb.from('feedback').insert({ ...fbForm, approved: false });

    if (error) {
      console.error('Feedback submit error:', error);
      return;
    }

    setFbSuccess(true);
    setFbForm({ name: '', role: 'Student', message: '' });
  }

  const isPro = ['standard', 'premium'].includes(subscription?.plan) && subscription?.status === 'active';

  function scrollToResults() {
    window.setTimeout(() => {
      document.getElementById('results')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 0);
  }

  function runSearch(value = searchInput) {
    const nextQuery = value.trim();
    setSearchInput(value);
    setQuery(nextQuery);
    if (nextQuery) scrollToResults();
  }

  function handleSearch(event) {
    event.preventDefault();
    runSearch(searchInput);
  }

  function quickSearch(name) {
    runSearch(name);
  }

  const hasActiveFilters = Boolean(
    budget ||
    roomType ||
    verifiedOnly ||
    minRent ||
    maxRent ||
    (isPro && (premiumVerified || maxDistance || selectedAmenities.length > 0))
  );
  const hasSearchCriteria = Boolean(query || hasActiveFilters);

  let filtered = query
    ? listings.filter((listing) => (
      String(listing.college || '').toLowerCase().includes(query.toLowerCase()) ||
      String(listing.city || '').toLowerCase().includes(query.toLowerCase())
    ))
    : hasActiveFilters
      ? listings
      : [];

  if (budget) filtered = filtered.filter((listing) => listing.rent <= parseInt(budget, 10));
  if (roomType) filtered = filtered.filter((listing) => listing.type === roomType);
  if (verifiedOnly) filtered = filtered.filter((listing) => listing.verified);
  if (isPro && premiumVerified) filtered = filtered.filter((listing) => listing.verified && listing.isPremium);
  if (isPro && maxDistance) filtered = filtered.filter((listing) => listing.distance <= Number(maxDistance));
  if (isPro && selectedAmenities.length > 0) {
    filtered = filtered.filter((listing) => selectedAmenities.every((amenity) => listing.amenities.includes(amenity)));
  }
  if (minRent) filtered = filtered.filter((listing) => listing.rent >= Number(minRent));
  if (maxRent) filtered = filtered.filter((listing) => listing.rent <= Number(maxRent));

  if (sortBy === 'rent_low') {
    filtered = [...filtered].sort((a, b) => a.rent - b.rent);
  } else if (sortBy === 'rent_high') {
    filtered = [...filtered].sort((a, b) => b.rent - a.rent);
  } else if (sortBy === 'distance') {
    filtered = [...filtered].sort((a, b) => a.distance - b.distance);
  } else {
    filtered = [...filtered].sort((a, b) => (b.isPremium === true) - (a.isPremium === true));
  }

  return (
    <main className="mb-home" id="top">
      <section className="mb-hero">
        <div className="mb-hero-shade" aria-hidden="true" />
        <div className="mb-hero-grid" aria-hidden="true" />
        <div className="mb-container mb-hero-inner">
          <div className="mb-trust-badge"><FeatureIcon>✓</FeatureIcon> Trusted by students. Verified by us.</div>
          <h1>Find a <em>home away from home</em> near your college</h1>
          <p className="mb-hero-copy">
            The easier way to find a room that feels right. Browse real listings close to campus, with details you can trust.
          </p>
          <form className="mb-search-form" onSubmit={handleSearch}>
            <label className="mb-search-input">
              <FeatureIcon>⌕</FeatureIcon>
              <input
                type="search"
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder="Enter your college name — e.g. Ambalika University"
                aria-label="College name"
              />
            </label>
            <button type="submit" className="mb-search-button">Search <span aria-hidden="true">→</span></button>
          </form>
          <div className="mb-suggestions">
            <span>Try:</span>
            {quickSearches.map((name) => (
              <button type="button" key={name} onClick={() => quickSearch(name)}>{name}</button>
            ))}
          </div>
          <div className="mb-hero-features">
            <div><FeatureIcon>✓</FeatureIcon><span><strong>Verified listings</strong><small>Rooms checked by us</small></span></div>
            <div><FeatureIcon>⌖</FeatureIcon><span><strong>Near your college</strong><small>Stay close to campus</small></span></div>
            <div><FeatureIcon>◷</FeatureIcon><span><strong>Save time &amp; money</strong><small>No endless searching</small></span></div>
            <div><FeatureIcon>◎</FeatureIcon><span><strong>Student trusted</strong><small>Built for your routine</small></span></div>
          </div>
        </div>
      </section>

      <section className="mb-results-section" id="results">
        <div className="mb-container">
          <div className="mb-section-heading mb-results-heading">
            <div>
              <span className="mb-eyebrow">Live listings, less noise</span>
              <h2>{query ? `Rooms near “${query}”` : 'Start with your college'}</h2>
            </div>
            <p>
              {listingsStatus === 'loading'
                ? 'Loading live listings…'
                : listingsStatus === 'error'
                  ? 'Live listings could not be loaded.'
                  : listings.length === 0
                    ? 'No listings are available yet.'
                    : hasSearchCriteria
                      ? `${filtered.length} matching listing${filtered.length === 1 ? '' : 's'} from the live database`
                      : 'Search a college or city above to see actual rooms and PGs.'}
            </p>
          </div>

          <div className="mb-filter-row">
            <select value={budget} onChange={(event) => setBudget(event.target.value)} aria-label="Budget">
              <option value="">Budget — any</option>
              <option value="5000">Up to ₹5000</option>
              <option value="7000">Up to ₹7000</option>
              <option value="10000">Up to ₹10000</option>
            </select>
            <select value={roomType} onChange={(event) => setRoomType(event.target.value)} aria-label="Room type">
              <option value="">Room type — any</option>
              <option value="Single">Single sharing</option>
              <option value="Double">Double sharing</option>
              <option value="Triple">Triple sharing</option>
            </select>
            <select value={verifiedOnly} onChange={(event) => setVerifiedOnly(event.target.value)} aria-label="Verification">
              <option value="">All listings</option>
              <option value="yes">Verified only</option>
            </select>
          </div>

          {!subscriptionLoading && isPro && (
            <div className="pro-filters mb-pro-filters">
              <div className="pro-filter-title">Pro filters</div>
              <input type="number" min="0" placeholder="Min rent ₹" value={minRent} onChange={(event) => setMinRent(event.target.value)} />
              <input type="number" min="0" placeholder="Max rent ₹" value={maxRent} onChange={(event) => setMaxRent(event.target.value)} />
              <select value={maxDistance} onChange={(event) => setMaxDistance(event.target.value)} aria-label="Maximum distance">
                <option value="">Distance — any</option>
                <option value="1">Within 1 km</option>
                <option value="2">Within 2 km</option>
                <option value="5">Within 5 km</option>
                <option value="10">Within 10 km</option>
              </select>
              <select value={sortBy} onChange={(event) => setSortBy(event.target.value)} aria-label="Sort listings">
                <option value="premium">Premium first</option>
                <option value="rent_low">Rent: Low to High</option>
                <option value="rent_high">Rent: High to Low</option>
                <option value="distance">Distance: Nearest First</option>
              </select>
              <label className="mb-pro-check"><input type="checkbox" checked={premiumVerified} onChange={(event) => setPremiumVerified(event.target.checked)} /> Premium verified only</label>
              <div className="amenities-filter">
                <div className="amenities-title">Amenities</div>
                {amenityGroups.map((group) => (
                  <div className="amenity-group" key={group.category}>
                    <div className="amenity-group-title">{group.category}</div>
                    <div className="amenity-group-items">
                      {group.items.map((amenity) => (
                        <label key={amenity}>
                          <input
                            type="checkbox"
                            checked={selectedAmenities.includes(amenity)}
                            onChange={() => setSelectedAmenities((previous) => (
                              previous.includes(amenity)
                                ? previous.filter((item) => item !== amenity)
                                : [...previous, amenity]
                            ))}
                          />
                          {amenity}
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mb-listing-grid">
            {listingsStatus === 'loading' ? (
              <div className="mb-search-prompt" role="status" aria-live="polite">
                <span className="mb-prompt-mark" aria-hidden="true">…</span>
                <h3>Loading live listings…</h3>
                <p>We’re fetching the latest rooms and PGs. Please wait a moment.</p>
              </div>
            ) : listingsStatus === 'error' ? (
              <div className="mb-search-prompt" role="alert">
                <span className="mb-prompt-mark" aria-hidden="true">!</span>
                <h3>We couldn’t load the listings.</h3>
                <p>Please check your connection and try again. No listings are being shown as search results.</p>
                <button className="mb-retry-button" type="button" onClick={loadListings}>Retry</button>
              </div>
            ) : listings.length === 0 ? (
              <div className="mb-search-prompt">
                <span className="mb-prompt-mark" aria-hidden="true">⌂</span>
                <h3>No listings are available yet.</h3>
                <p>Please check back soon for rooms and PGs near your college.</p>
              </div>
            ) : !hasSearchCriteria ? (
              <div className="mb-search-prompt">
                <span className="mb-prompt-mark">⌕</span>
                <h3>Your next room starts with a search.</h3>
                <p>Enter a college or choose one of the popular searches to browse live listings.</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="mb-search-prompt">
                <span className="mb-prompt-mark">—</span>
                <h3>No listings found for this search.</h3>
                <p>Try a different college or city, like “Ambalika University” or “Kanpur”.</p>
              </div>
            ) : (
              filtered.map((listing, index) => (
                <ListingCard
                  key={listing.id}
                  listing={listing}
                  index={index}
                  isFavorited={favoriteIds.has(listing.id)}
                  onToggleFavorite={toggleFavorite}
                  onClick={(id) => setSelectedListing(filtered.find((item) => item.id === id))}
                />
              ))
            )}
          </div>
        </div>
      </section>

      <section className="mb-value-band" aria-label="Mera Basera value statements">
        <div className="mb-container mb-value-grid">
          <div><strong>{listings.length || 'Live'}</strong><span>{listings.length ? 'rooms loaded from the live API' : 'rooms fetched from the live API'}</span></div>
          <div><strong>₹0</strong><span>to browse and compare stays</span></div>
          <div><strong>Live</strong><span>college, rent and distance filters</span></div>
          <div><strong>Real</strong><span>owner listings and contact details</span></div>
        </div>
      </section>

      <section className="mb-section mb-cities" id="cities">
        <div className="mb-container">
          <div className="mb-section-heading">
            <div><span className="mb-eyebrow">Where students are moving</span><h2>Find your next chapter in the right neighbourhood.</h2></div>
            <p>Start with a city, then let the existing listing search show you what is actually available.</p>
          </div>
          <div className="mb-city-grid">
            {cityCards.map((city, index) => (
              <button
                type="button"
                key={city.name}
                className={`mb-city-card mb-city-${city.tone} ${index === 0 ? 'mb-city-large' : ''}`}
                onClick={() => quickSearch(city.name)}
              >
                <span className="mb-city-count">Search live listings</span>
                <strong>{city.name}</strong>
                <small>{city.detail}</small>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="mb-section mb-process" id="how-it-works">
        <div className="mb-container mb-process-layout">
          <div className="mb-process-intro">
            <span className="mb-eyebrow">A calmer way to move</span>
            <h2>Good homes shouldn’t be hard to find.</h2>
            <p>We keep the path from college search to owner contact simple, while your existing filters and account features do the real work.</p>
            <a className="mb-text-link" href="#results">Browse live stays <span aria-hidden="true">→</span></a>
          </div>
          <div className="mb-steps">
            <div><span>01</span><div><h3>Tell us where you study</h3><p>Search your college or city to bring relevant listings into one clear view.</p></div></div>
            <div><span>02</span><div><h3>Compare places that pass the check</h3><p>Use rent, distance, amenities and verified filters without losing the existing plan rules.</p></div></div>
            <div><span>03</span><div><h3>Visit, ask, and settle in</h3><p>Open a listing, save it to your account, or contact the owner through the existing flow.</p></div></div>
          </div>
        </div>
      </section>

      <section className="mb-section mb-testimonials">
        <div className="mb-container">
          <div className="mb-section-heading">
            <div><span className="mb-eyebrow">From the community</span><h2>What people are saying.</h2></div>
            <button className="mb-outline-button" type="button" onClick={() => setFbOpen(true)}>Share feedback <span aria-hidden="true">↗</span></button>
          </div>
          <div className="mb-testimonial-grid">
            {feedback.length === 0 ? (
              <div className="mb-feedback-empty">Approved feedback from students and owners will appear here.</div>
            ) : feedback.slice(0, 3).map((item) => (
              <article className="mb-testimonial-card" key={item.id}>
                <span className="mb-quote-mark">“</span>
                <p>{item.message}</p>
                <strong>{item.name}</strong>
                <small>{item.role}</small>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mb-owner-cta" id="owners">
        <div className="mb-container mb-owner-flex">
          <div><span className="mb-eyebrow mb-eyebrow-dark">Have a room or PG to share?</span><h2>Help a student feel at home.</h2><p>Register your property through the existing owner flow and reach students looking for a trusted place.</p></div>
          <Link className="mb-owner-button" to="/register-owner">List your property <span aria-hidden="true">→</span></Link>
        </div>
      </section>

      <footer className="mb-footer">
        <div className="mb-container mb-footer-grid">
          <div><Link className="mb-brand mb-footer-brand" to="/"><span className="mb-brand-mark">M</span><span className="mb-brand-copy"><span className="mb-brand-name">Mera Basera</span><span className="mb-brand-sub">Student room &amp; PG finder</span></span></Link><p>A little less searching. A lot more feeling at home. Find real rooms near college with the tools you already use.</p></div>
          <div><h3>Explore</h3><a href="#results">Find rooms</a><a href="#cities">Popular cities</a><a href="#how-it-works">How it works</a></div>
          <div><h3>For owners</h3><Link to="/register-owner">Register a room</Link><Link to="/owner-dashboard">Owner dashboard</Link><Link to="/dashboard">Your dashboard</Link></div>
          <div><h3>Community</h3><button type="button" onClick={() => setFbOpen(true)}>Give feedback</button><button type="button" onClick={() => setRoommateOpen(true)}>Find a roommate</button><a href="#top">Back to top ↑</a></div>
        </div>
        <div className="mb-container mb-footer-bottom"><span>© 2025 Mera Basera. Made for the move.</span><span>Built with care in India.</span></div>
      </footer>

      {selectedListing && <DetailModal listing={selectedListing} onClose={() => setSelectedListing(null)} />}
      <RoommateModal open={roommateOpen} onClose={() => setRoommateOpen(false)} onNeedAuth={onNeedAuth} />

      {fbOpen && (
        <div className="overlay open" onClick={(event) => event.target === event.currentTarget && setFbOpen(false)}>
          <div className="modal mb-feedback-modal">
            <button className="modal-close" onClick={() => { setFbOpen(false); setFbSuccess(false); }}>✕</button>
            <div className="modal-head"><div className="room-type">FEEDBACK</div><h2>Tell us what you think</h2><div className="locality">We read every message — good or bad</div></div>
            {!fbSuccess ? (
              <div className="modal-body">
                <form onSubmit={submitFeedback}>
                  <div className="form-group"><label>Your name</label><input required value={fbForm.name} onChange={(event) => setFbForm({ ...fbForm, name: event.target.value })} placeholder="e.g. Ayush Sharma" /></div>
                  <div className="form-group"><label>You are a</label><select value={fbForm.role} onChange={(event) => setFbForm({ ...fbForm, role: event.target.value })}><option value="Student">Student</option><option value="Room/PG Owner">Room/PG Owner</option></select></div>
                  <div className="form-group"><label>Your feedback</label><textarea required value={fbForm.message} onChange={(event) => setFbForm({ ...fbForm, message: event.target.value })} placeholder="What did you think of Mera Basera?" rows="4" /></div>
                  <button type="submit" className="btn-submit">Submit feedback</button>
                </form>
              </div>
            ) : (
              <div className="form-success show"><div className="tick">✓</div><h3>Thank you!</h3><p>Your feedback has been recorded for review.</p><button className="btn-submit" style={{ marginTop: 20 }} onClick={() => { setFbOpen(false); setFbSuccess(false); }}>Got it</button></div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}