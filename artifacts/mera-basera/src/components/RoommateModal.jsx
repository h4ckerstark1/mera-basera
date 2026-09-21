import { useState, useEffect } from 'react';
import { sb, mapRoommateRow, seedRoommates } from '../lib/supabase';
import { useAuth } from '../lib/AuthContext';

export default function RoommateModal({ open, onClose, onNeedAuth }) {
  const { user } = useAuth();
  const [tab, setTab] = useState('browse');
  const [roommates, setRoommates] = useState([]);
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState({ name: '', college: '', budget: '', gender: 'Male', prefs: '', phone: '' });

  useEffect(() => {
    if (open && tab === 'browse') loadRoommates();
  }, [open, tab]);

  async function loadRoommates() {
    let { data } = await sb.from('roommates').select('*').order('id');
    if (data && data.length === 0) {
      await sb.from('roommates').insert(seedRoommates);
      const res = await sb.from('roommates').select('*').order('id');
      data = res.data || [];
    }
    setRoommates((data || []).map(mapRoommateRow));
  }

  function goToAddTab() {
    if (!user) {
      onClose();
      onNeedAuth();
      return;
    }
    setTab('add');
    setSuccess(false);
  }

  async function submit(e) {
    e.preventDefault();
    if (!user) {
      onClose();
      onNeedAuth();
      return;
    }
    await sb.from('roommates').insert({
      name: form.name, college: form.college, budget: parseInt(form.budget),
      gender: form.gender, preferences: form.prefs, phone: form.phone,
      user_id: user.id,
    });
    setSuccess(true);
    setForm({ name: '', college: '', budget: '', gender: 'Male', prefs: '', phone: '' });
  }

  if (!open) return null;

  return (
    <div className="overlay open" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 520 }}>
        <button className="modal-close" onClick={onClose}>✕</button>
        <div className="modal-head">
          <div className="room-type">ROOMMATE FINDER</div>
          <h2>Find someone to share with</h2>
          <div className="locality">Browse students looking for a roommate, or add yourself</div>
        </div>
        <div className="rm-tabs">
          <div className={`rm-tab ${tab === 'browse' ? 'active' : ''}`} onClick={() => setTab('browse')}>Browse</div>
          <div className={`rm-tab ${tab === 'add' ? 'active' : ''}`} onClick={goToAddTab}>Add myself</div>
        </div>

        {tab === 'browse' && (
          <div className="rm-list">
            {roommates.length === 0 ? (
              <div className="rm-empty">No one has listed themselves yet. Be the first!</div>
            ) : roommates.map(r => (
              <div className="rm-card" key={r.id}>
                <div className="rm-card-top">
                  <h4>{r.name}</h4>
                  <div className="rm-budget">Budget: ₹{r.budget.toLocaleString('en-IN')}/mo</div>
                </div>
                <div className="rm-meta">{r.college} · {r.gender}</div>
                <div className="rm-tags">{r.prefs.map((p, i) => <span key={i}>{p}</span>)}</div>
                <a className="btn-contact" style={{ display: 'block' }} href={`https://wa.me/${r.phone}?text=Hi%2C%20I%20saw%20your%20roommate%20listing%20on%20Mera%20Basera`} target="_blank" rel="noreferrer">Contact on WhatsApp</a>
              </div>
            ))}
          </div>
        )}

        {tab === 'add' && !success && (
          <div className="modal-body">
            <div className="form-note">✅ Your listing is saved to a real database — it'll be visible to anyone who visits this site.</div>
            <form onSubmit={submit}>
              <div className="form-group"><label>Your name</label><input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Rahul Verma" /></div>
              <div className="form-group"><label>College</label><input required value={form.college} onChange={e => setForm({ ...form, college: e.target.value })} placeholder="e.g. Ambalika University" /></div>
              <div className="form-row">
                <div className="form-group"><label>Monthly budget (₹)</label><input type="number" required value={form.budget} onChange={e => setForm({ ...form, budget: e.target.value })} placeholder="e.g. 4000" /></div>
                <div className="form-group"><label>Gender</label>
                  <select value={form.gender} onChange={e => setForm({ ...form, gender: e.target.value })}>
                    <option value="Male">Male</option><option value="Female">Female</option>
                  </select>
                </div>
              </div>
              <div className="form-group"><label>Preferences (comma-separated)</label><input value={form.prefs} onChange={e => setForm({ ...form, prefs: e.target.value })} placeholder="e.g. Non-smoker, early sleeper" /></div>
              <div className="form-group"><label>WhatsApp number</label><input required value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="e.g. 919999999999" /></div>
              <button type="submit" className="btn-submit">Add my listing</button>
            </form>
          </div>
        )}

        {tab === 'add' && success && (
          <div className="form-success show">
            <div className="tick">✅</div>
            <h3>You're on the list!</h3>
            <p>Other students looking for a roommate can now see your listing and reach out.</p>
            <button className="btn-submit" style={{ marginTop: 20 }} onClick={onClose}>Got it</button>
          </div>
        )}
      </div>
    </div>
  );
}
