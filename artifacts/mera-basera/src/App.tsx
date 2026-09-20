import { type CSSProperties, type FormEvent, type ReactNode, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { Route, Switch, useLocation, Router as WouterRouter } from 'wouter';
import {
  ArrowRight,
  Clock3,
  MapPin,
  Menu,
  Search,
  ShieldCheck,
  Sparkles,
  UsersRound,
  X,
} from 'lucide-react';

const queryClient = new QueryClient();

const colleges = [
  { name: 'Ambalika University', city: 'Lucknow', count: '84 verified stays' },
  { name: 'IIT Kanpur', city: 'Kanpur', count: '52 verified stays' },
  { name: 'Delhi University', city: 'New Delhi', count: '128 verified stays' },
];

function Brand() {
  return (
    <a className="brand" href="#top" data-testid="link-brand">
      <span className="brand-mark">M</span>
      <span className="brand-copy">
        <span className="brand-name">Mera Basera</span>
        <span className="brand-tag">Student room &amp; PG finder</span>
      </span>
    </a>
  );
}

function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [college, setCollege] = useState('');
  const [searched, setSearched] = useState('');
  const [notice, setNotice] = useState('');
  const [email, setEmail] = useState('');

  const showNotice = (message: string) => {
    setNotice(message);
    window.setTimeout(() => setNotice(''), 3500);
  };

  const jump = (target: string) => {
    setMenuOpen(false);
    document.getElementById(target)?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const value = college.trim();
    if (!value) {
      showNotice('Start with a college name to see nearby verified stays.');
      return;
    }
    setSearched(value);
    document.getElementById('discover')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const chooseSuggestion = (value: string) => {
    setCollege(value);
    setSearched(value);
  };

  const handleSubscribe = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!email.includes('@')) {
      showNotice('Please enter a valid email address.');
      return;
    }
    setEmail('');
    showNotice('You are on the list. We will share the good finds.');
  };

  return (
    <div className="mb-page" id="top">
      <section className="hero">
        <header className="topbar">
          <div className="mb-container topbar-inner">
            <Brand />
            <nav className={`nav ${menuOpen ? 'open' : ''}`} aria-label="Main navigation">
              <a href="#discover" className="nav-active" data-testid="link-search-rooms" onClick={() => setMenuOpen(false)}>Search rooms</a>
              <button type="button" data-testid="button-owner-nav" onClick={() => jump('owners')}>Are you an owner?</button>
              <button type="button" data-testid="button-login" onClick={() => showNotice('Student accounts are coming soon. You can explore verified stays today.')}>Login / Sign up</button>
            </nav>
            <button className="mobile-menu" type="button" aria-label="Toggle menu" data-testid="button-mobile-menu" onClick={() => setMenuOpen((open) => !open)}>
              {menuOpen ? <X size={21} /> : <Menu size={21} />}
            </button>
          </div>
        </header>
        <div className="mb-container">
          <div className="hero-content">
            <div className="trust-pill fade-up"><ShieldCheck size={13} /> Trusted by students. Verified by us.</div>
            <h1 className="fade-up delay-1">Find a <em>home away<br />from home</em> near<br />your college</h1>
            <p className="hero-copy fade-up delay-2">The easier way to find a room that feels right. Browse verified rooms and PGs close to campus, with people you can trust.</p>
            <form className="fade-up delay-3" onSubmit={handleSearch} data-testid="form-college-search">
              <div className="search-shell">
                <label className="search-field">
                  <Search size={18} aria-hidden="true" />
                  <input
                    type="search"
                    value={college}
                    onChange={(event) => setCollege(event.target.value)}
                    placeholder="Enter your college name — e.g. Ambalika University"
                    aria-label="College name"
                    data-testid="input-college-search"
                  />
                </label>
                <button className="search-button" type="submit" data-testid="button-search">
                  Search <ArrowRight size={15} />
                </button>
              </div>
              <div className="suggestions">
                <span>Try:</span>
                {colleges.map((item) => (
                  <button key={item.name} className="suggestion" type="button" onClick={() => chooseSuggestion(item.name)} data-testid={`button-suggestion-${item.city.toLowerCase()}`}>
                    {item.name}
                  </button>
                ))}
              </div>
            </form>
            {searched && (
              <div className="search-result" data-testid="status-search-result">
                <div><strong>Good news near {searched}</strong><span>We found verified stays ready to explore.</span></div>
                <button type="button" onClick={() => jump('discover')} data-testid="button-view-results">View stays</button>
              </div>
            )}
          </div>
          <div className="hero-bottom">
            <div className="hero-feature"><ShieldCheck className="feature-icon" size={21} /><div><strong>Verified listings</strong><span>100% checked rooms &amp; PGs</span></div></div>
            <div className="hero-feature"><MapPin className="feature-icon" size={21} /><div><strong>Near your college</strong><span>Stay close to your campus</span></div></div>
            <div className="hero-feature"><Clock3 className="feature-icon" size={21} /><div><strong>Save time &amp; money</strong><span>No endless searching</span></div></div>
            <div className="hero-feature"><UsersRound className="feature-icon" size={21} /><div><strong>Student trusted</strong><span>Chosen by your community</span></div></div>
          </div>
        </div>
      </section>

      <section className="stats-band" aria-label="Mera Basera at a glance">
        <div className="mb-container stat-grid">
          <div className="stat"><div className="stat-number">2,400+</div><div className="stat-label">verified rooms listed</div></div>
          <div className="stat"><div className="stat-number">18</div><div className="stat-label">student cities covered</div></div>
          <div className="stat"><div className="stat-number">4.8/5</div><div className="stat-label">student satisfaction</div></div>
          <div className="stat"><div className="stat-number">₹0</div><div className="stat-label">to start your search</div></div>
        </div>
      </section>

      <section className="section cities" id="discover">
        <div className="mb-container">
          <div className="section-heading">
            <div><span className="eyebrow">Where students are moving</span><h2>Find your next chapter<br />in the right neighbourhood.</h2></div>
            <p>From a quiet lane near campus to a shared flat in the heart of the city, start with a place that matches your everyday.</p>
          </div>
          <div className="city-grid">
            {[
              ['Lucknow', 'Ambalika University & more', '84 stays', 'large'],
              ['Kanpur', 'IIT Kanpur neighbourhoods', '52 stays', ''],
              ['New Delhi', 'DU North Campus', '128 stays', ''],
              ['Jaipur', 'Malviya Nagar & Jagatpura', '71 stays', ''],
              ['Pune', 'Student life, sorted', '96 stays', ''],
            ].map(([city, detail, count, className]) => (
              <button key={city} type="button" className={`city-card ${className}`} onClick={() => { setCollege(`${city} colleges`); showNotice(`Showing the best verified stays around ${city}.`); }} style={{ '--city-gradient': 'linear-gradient(135deg, #223b5d, #9b754b)' } as CSSProperties} data-testid={`card-city-${city.toLowerCase().replaceAll(' ', '-')}`}>
                <div className="city-content"><span>{count}</span><h3>{city}</h3><p>{detail}</p></div>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="section process" id="how-it-works">
        <div className="mb-container process-layout">
          <div className="process-intro">
            <span className="eyebrow">A calmer way to move</span>
            <h2>Good homes<br />shouldn't be<br />hard to find.</h2>
            <p>We remove the guesswork from your room search, so you can spend less time comparing listings and more time looking forward to campus life.</p>
            <a className="process-link" href="#discover" data-testid="link-browse-stays">Browse verified stays <ArrowRight size={14} /></a>
          </div>
          <div className="steps">
            <div className="step"><span className="step-number">01</span><div><h3>Tell us where you study</h3><p>Search your college and we’ll bring every suitable room and PG into one clear view.</p></div></div>
            <div className="step"><span className="step-number">02</span><div><h3>Compare places that pass the check</h3><p>See honest details on rent, distance, amenities and the people behind each listing.</p></div></div>
            <div className="step"><span className="step-number">03</span><div><h3>Visit, ask, and settle in</h3><p>Connect directly with owners, schedule a visit and choose the place that feels like yours.</p></div></div>
          </div>
        </div>
      </section>

      <section className="section quote-section">
        <div className="mb-container quote-grid">
          <div>
            <div className="quote-mark">“</div>
            <p className="quote">I stopped asking everyone in my class where to live. Three good options, one evening, and I found my room.</p>
            <div className="quote-author"><span className="avatar">AS</span><div><strong>Ananya Singh</strong><span>First year, Lucknow</span></div></div>
          </div>
          <div className="quote-note"><span><Sparkles size={13} /> The Mera Basera promise</span><h3>A room for your routine, not just your rent.</h3></div>
        </div>
      </section>

      <section className="owner-cta" id="owners">
        <div className="mb-container owner-flex">
          <div><span className="eyebrow" style={{ color: 'rgba(20,29,48,.7)' }}>Have a room to share?</span><h2>Help a student<br />feel at home.</h2><p>List your room or PG with Mera Basera and reach students looking for a trusted place.</p></div>
          <button className="owner-button" type="button" onClick={() => showNotice('Owner listings are opening soon. Leave your details and we will be in touch.')} data-testid="button-list-property">List your property <ArrowRight size={15} /></button>
        </div>
      </section>

      <footer className="footer">
        <div className="mb-container footer-grid">
          <div><Brand /><p className="footer-copy">A little less searching. A lot more feeling at home. Mera Basera helps students find trustworthy rooms near college.</p></div>
          <div><h4>Explore</h4><a href="#discover" data-testid="link-footer-cities">Popular cities</a><a href="#how-it-works" data-testid="link-footer-how">How it works</a><a href="#owners" data-testid="link-footer-owners">For owners</a></div>
          <div><h4>Company</h4><button className="footer-link" type="button" onClick={() => showNotice('We are a small team making student moves feel simpler.')}>Our story</button><button className="footer-link" type="button" onClick={() => showNotice('Write to hello@merabasera.in and we will get back to you.')}>Contact</button><button className="footer-link" type="button" onClick={() => showNotice('Your trust matters. Our privacy note is coming soon.')}>Privacy</button></div>
          <div><h4>Stay in the know</h4><p className="newsletter">New cities, useful moving tips, and rooms worth knowing about.</p><form className="subscribe" onSubmit={handleSubscribe} data-testid="form-newsletter"><input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Your email" aria-label="Email address" data-testid="input-newsletter-email" /><button type="submit" data-testid="button-subscribe">Join</button></form></div>
        </div>
        <div className="mb-container footer-bottom"><span>© 2025 Mera Basera. Made for the move.</span><span>Built with care in India.</span></div>
      </footer>
      {notice && <div className="feedback" role="status" data-testid="status-feedback"><strong>Mera Basera</strong>{notice}</div>}
    </div>
  );
}

function Router() {
  return (
    <RoutedErrorBoundary>
      <Switch>
        <Route path="/" component={Home} />
        <Route component={NotFound} />
      </Switch>
    </RoutedErrorBoundary>
  );
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;