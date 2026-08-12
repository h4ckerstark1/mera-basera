import { Link } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';

export default function Nav({ onLoginClick }) {
  const { user, profile, logout } = useAuth();

  return (
    <nav>
      <Link to="/" className="logo" style={{ textDecoration: 'none' }}>
        <div className="logo-mark">M</div>
        <div>Mera Basera
          <span className="logo-sub">STUDENT ROOM &amp; PG FINDER</span>
        </div>
      </Link>
      <div>
        <a href="#results">Search Rooms</a>
        <a href="#owner">Are you an Owner?</a>
        {user ? (
          <span className="user-chip">
            <Link to="/dashboard">📊 Dashboard</Link> 👋 {profile ? profile.name : user.email}
            <button onClick={logout}>Logout</button>
          </span>
        ) : (
          <a href="#" onClick={(e) => { e.preventDefault(); onLoginClick(); }}>Login / Sign Up</a>
        )}
      </div>
    </nav>
  );
}
