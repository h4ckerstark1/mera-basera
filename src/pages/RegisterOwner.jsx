import { useState } from 'react';
import { Link } from 'react-router-dom';
import { sb } from '../lib/supabase';

export default function RegisterOwner() {
  const [form, setForm] = useState({ name: '', college: '', city: '', distance: '', type: 'Single', rent: '', phone: '' });
  const [amenities, setAmenities] = useState([]);
  const [photo, setPhoto] = useState(null);
  const [success, setSuccess] = useState(false);
  const [saving, setSaving] = useState(false);

  function toggleAmenity(a) {
    setAmenities(prev => prev.includes(a) ? prev.filter(x => x !== a) : [...prev, a]);
  }

  async function submit(e) {
    e.preventDefault();
    setSaving(true);
    let photoUrl = null;
    if (photo) {
      const ext = photo.name.split('.').pop();
      const path = `${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
      const { error: upErr } = await sb.storage.from('room-photos').upload(path, photo);
      if (!upErr) {
        const { data } = sb.storage.from('room-photos').getPublicUrl(path);
        photoUrl = data.publicUrl;
      }
    }
    await sb.from('listings').insert({
      college: form.college, city: form.city, name: form.name,
      room_type: form.type, rent: parseInt(form.rent), distance_km: parseFloat(form.distance),
      amenities: amenities.length ? amenities.join(',') : 'WiFi',
      verified: false, is_premium: false, phone: form.phone, photo_url: photoUrl,
    });
    setSaving(false);
    setSuccess(true);
  }

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
        <div className="intro">
          <h1>List your room or PG — free</h1>
          <p>Reach college students looking for a place to stay near their campus. Takes about 2 minutes.</p>
        </div>

        <div className="card-form">
          {!success ? (
            <>
              <div className="form-note">✅ Your listing is saved to a real database — it'll be visible to anyone who visits Mera Basera.</div>
              <form onSubmit={submit}>
                <div className="form-group"><label>Property/PG name</label><input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Sharma PG for Boys" /></div>
                <div className="form-group"><label>Which college is it near?</label><input required value={form.college} onChange={e => setForm({ ...form, college: e.target.value })} placeholder="e.g. Ambalika University" /></div>
                <div className="form-row">
                  <div className="form-group"><label>City</label><input required value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} placeholder="e.g. Lucknow" /></div>
                  <div className="form-group"><label>Distance from college (km)</label><input type="number" step="0.1" required value={form.distance} onChange={e => setForm({ ...form, distance: e.target.value })} placeholder="e.g. 0.8" /></div>
                </div>
                <div className="form-row">
                  <div className="form-group"><label>Room type</label>
                    <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                      <option value="Single">Single sharing</option>
                      <option value="Double">Double sharing</option>
                      <option value="Triple">Triple sharing</option>
                    </select>
                  </div>
                  <div className="form-group"><label>Rent (₹/month)</label><input type="number" required value={form.rent} onChange={e => setForm({ ...form, rent: e.target.value })} placeholder="e.g. 6000" /></div>
                </div>
                <div className="form-group">
                  <label>Amenities</label>
                  <div className="amenity-check">
                    {['WiFi', 'Meals', 'Laundry', 'AC'].map(a => (
                      <label key={a}><input type="checkbox" checked={amenities.includes(a)} onChange={() => toggleAmenity(a)} /> {a}</label>
                    ))}
                  </div>
                </div>
                <div className="form-group"><label>WhatsApp number (students will contact you here)</label><input required value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="e.g. 919999999999" /></div>
                <div className="form-group"><label>Photo of the room (optional, but helps a lot!)</label><input type="file" accept="image/*" onChange={e => setPhoto(e.target.files[0])} /></div>
                <button type="submit" className="btn-submit" disabled={saving}>{saving ? 'Saving...' : 'Register property'}</button>
              </form>
            </>
          ) : (
            <div className="form-success show">
              <div className="tick">✅</div>
              <h3>Registered!</h3>
              <p>Your property has been added to Mera Basera. Students searching your college will now see your listing.</p>
              <Link to="/">Go to homepage</Link>
            </div>
          )}
        </div>

        <div className="why-list">
          <h3>Why list on Mera Basera?</h3>
          <div className="why-item"><div className="icon">🎓</div><p>Reach students actively searching for rooms near your college — no extra effort needed.</p></div>
          <div className="why-item"><div className="icon">💸</div><p>Listing is completely free. No hidden charges.</p></div>
          <div className="why-item"><div className="icon">✅</div><p>Verified listings build trust — students prefer contacting owners who show up as verified.</p></div>
        </div>
      </div>

      <footer>Mera Basera — Student Room &amp; PG Finder.</footer>
    </>
  );
}
