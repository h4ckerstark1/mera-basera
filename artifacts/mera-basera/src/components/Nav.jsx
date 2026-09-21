import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';

export default function Nav({ onLoginClick }) {
  const { user, profile, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="mb-nav">
      <div className="mb-nav-inner">
        <Link to="/" className="mb-brand" onClick={() => setMenuOpen(false)}>
          <span className="mb-brand-mark">M</span>
          <span className="mb-brand-copy">
            <span className="mb-brand-name">Mera Basera</span>
            <span className="mb-brand-sub">Student room &amp; PG finder</span>
          </span>
        </Link>
        <button
          className="mb-menu-toggle"
          type="button"
          aria-label="Toggle navigation"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span />
          <span />
          <span />
        </button>
        <div className={`mb-nav-links ${menuOpen ? 'is-open' : ''}`}>
          <a href="#results" onClick={() => setMenuOpen(false)}>Search rooms</a>
          <Link to="/register-owner" onClick={() => setMenuOpen(false)}>Are you an owner?</Link>
          {user ? (
            <div className="mb-user-area">
              <Link to="/dashboard" onClick={() => setMenuOpen(false)}>Dashboard</Link>
              <span className="mb-user-name">{profile ? profile.name : user.email}</span>
              <button type="button" onClick={logout}>Logout</button>
            </div>
          ) : (
            <button type="button" className="mb-login-button" onClick={() => { setMenuOpen(false); onLoginClick(); }}>
              Login / Sign up
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
