import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './lib/AuthContext';
import Nav from './components/Nav';
import AuthModal from './components/AuthModal';
import Home from './pages/Home';
import RegisterOwner from './pages/RegisterOwner';
import Dashboard from './pages/Dashboard';
import OwnerDashboard from './pages/OwnerDashboard';
import { useState } from 'react';

function HomeWithNav() {
  const [authOpen, setAuthOpen] = useState(false);
  return (
    <>
      <Nav onLoginClick={() => setAuthOpen(true)} />
      <Home onNeedAuth={() => setAuthOpen(true)} />
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomeWithNav />} />
          <Route path="/register-owner" element={<RegisterOwner />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/owner-dashboard" element={<OwnerDashboard />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
