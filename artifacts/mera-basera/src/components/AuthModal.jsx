import { useState } from 'react';
import { sb } from '../lib/supabase';

export default function AuthModal({ open, onClose }) {
  const [tab, setTab] = useState('signup');
  const [role, setRole] = useState('Student');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [suName, setSuName] = useState('');
  const [suCollege, setSuCollege] = useState('');
  const [suEmail, setSuEmail] = useState('');
  const [suPassword, setSuPassword] = useState('');
  const [liEmail, setLiEmail] = useState('');
  const [liPassword, setLiPassword] = useState('');

  if (!open) return null;

  async function handleSignup(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const { error: err } = await sb.auth.signUp({
  email: suEmail,
  password: suPassword,
  options: {
    data: {
      role,
      name: suName,
      college_or_business: suCollege,
    },
  },
});

if (err) {
  setError(err.message);
  setLoading(false);
  return;
}

setLoading(false);
onClose();
  }

  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error: err } = await sb.auth.signInWithPassword({
      email: liEmail,
      password: liPassword,
    });

    setLoading(false);

    if (err) {
      setError(err.message);
      return;
    }

    onClose();
  }

  return (
    <div className="overlay open" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 440 }}>
        <button className="modal-close" onClick={onClose}>✕</button>
        <div className="modal-head">
          <div className="room-type">ACCOUNT</div>
          <h2>{tab === 'signup' ? 'Welcome to Mera Basera' : 'Welcome back'}</h2>
          <div className="locality">Sign up to save listings, register a room, and more</div>
        </div>
        <div className="auth-tabs">
          <div className={`auth-tab ${tab === 'signup' ? 'active' : ''}`} onClick={() => setTab('signup')}>Sign Up</div>
          <div className={`auth-tab ${tab === 'login' ? 'active' : ''}`} onClick={() => setTab('login')}>Login</div>
        </div>
        <div className="modal-body">
          {error && <div className="auth-error" style={{ display: 'block' }}>{error}</div>}

          {tab === 'signup' ? (
            <form onSubmit={handleSignup}>
              <div className="form-group">
                <label>I am a</label>
                <div className="role-select">
                  <div className={`role-option ${role === 'Student' ? 'selected' : ''}`} onClick={() => setRole('Student')}>🎓 Student</div>
                  <div className={`role-option ${role === 'Owner' ? 'selected' : ''}`} onClick={() => setRole('Owner')}>🔑 Owner</div>
                </div>
              </div>
              <div className="form-group">
                <label>Your name</label>
                <input type="text" required value={suName} onChange={e => setSuName(e.target.value)} placeholder="e.g. Ayush Sharma" />
              </div>
              <div className="form-group">
                <label>{role === 'Student' ? 'College name' : 'Business / PG name'}</label>
                <input type="text" value={suCollege} onChange={e => setSuCollege(e.target.value)} placeholder="e.g. Ambalika University" />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input type="email" required value={suEmail} onChange={e => setSuEmail(e.target.value)} placeholder="you@example.com" />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input type="password" required minLength={6} value={suPassword} onChange={e => setSuPassword(e.target.value)} placeholder="At least 6 characters" />
              </div>
              <button type="submit" className="btn-submit" disabled={loading}>{loading ? 'Creating account...' : 'Create account'}</button>
            </form>
          ) : (
            <form onSubmit={handleLogin}>
              <div className="form-group">
                <label>Email</label>
                <input type="email" required value={liEmail} onChange={e => setLiEmail(e.target.value)} placeholder="you@example.com" />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input type="password" required value={liPassword} onChange={e => setLiPassword(e.target.value)} placeholder="Your password" />
              </div>
              <button type="submit" className="btn-submit" disabled={loading}>{loading ? 'Logging in...' : 'Log in'}</button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
