import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { sb } from '../lib/supabase';
import { useAuth } from '../lib/AuthContext';

export default function StudentPro() {
  const { user } = useAuth();

  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSubscription() {
      if (!user) {
        setSubscription(null);
        setLoading(false);
        return;
      }

      setLoading(true);

      const { data, error } = await sb
        .from('subscriptions')
        .select('plan, status, started_at, expires_at')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Subscription load error:', error);
        setSubscription(null);
      } else {
        setSubscription(data || null);
      }

      setLoading(false);
    }

    loadSubscription();
  }, [user]);

  const isStandard =
    subscription?.plan === 'standard' &&
    subscription?.status === 'active';

  const isPremium =
    subscription?.plan === 'premium' &&
    subscription?.status === 'active';

  const handleTestUpgrade = async (plan) => {
    const { data, error } = await sb.rpc(
      'test_upgrade_subscription',
      { target_plan: plan }
    );

    if (error) {
      console.error('Upgrade error:', error);
      alert(error.message);
      return;
    }

    alert(`Successfully upgraded to ${plan.toUpperCase()}!`);
    window.location.reload();
  };

  return (
    <main className="student-pro-page">

      {/* HERO */}
      <section className="student-pro-hero">
        <div className="student-pro-badge">
          👑 Mera Basera Premium
        </div>

        <h1>
          Find Better. Save More.
          <span> Go Premium.</span>
        </h1>

        <p>
          Choose the plan that fits your student journey — from finding
          your room to discovering better tools for your student life.
        </p>

        {!user ? (
          <Link to="/login" className="student-pro-main-btn">
            Login to Continue
          </Link>
        ) : isPremium ? (
          <div className="student-pro-active">
            ✓ You are already a Premium member
          </div>
        ) : (
          <button
            className="student-pro-main-btn"
            onClick={() =>
              alert('Upgrade system next step mein connect hoga.')
            }
          >
            Upgrade to Premium
          </button>
        )}
      </section>

      {/* THREE PLANS */}
      <section className="student-pro-plans">

        {/* FREE */}
        <div className="student-pro-plan free-plan">
          <div className="plan-header">
            <div>
              <span className="plan-label">FREE</span>
              <h2>Student Free</h2>
            </div>

            {(!subscription || subscription?.plan === 'free') && (
              <span className="current-plan">CURRENT</span>
            )}
          </div>

          <div className="plan-price">
            ₹0 <span>/ forever</span>
          </div>

          <p className="plan-description">
            Essential features to start your room-search journey.
          </p>

          <ul className="plan-features">
            <li>✓ Search nearby rooms & PGs</li>
            <li>✓ Basic room filters</li>
            <li>✓ Verified listings filter</li>
            <li>✓ Roommate finder</li>
            <li>✓ Save up to 5 favorites</li>
            <li>✓ Basic contact history</li>
          </ul>
        </div>

        {/* STANDARD */}
        <div className="student-pro-plan standard-plan">
          <div className="plan-header">
            <div>
              <span className="plan-label">⭐ STANDARD</span>
              <h2>Standard</h2>
            </div>

            {isStandard && (
              <span className="current-plan">
                CURRENT
              </span>
            )}
          </div>

          <div className="plan-price">
            ₹49 <span>/ month</span>
          </div>

          <p className="plan-description">
            Advanced room-search tools for students who want more control.
          </p>

          <ul className="plan-features">
            <li>✓ Everything in Free</li>
            <li>✓ Unlimited favorites</li>
            <li>✓ Premium + Verified listings</li>
            <li>✓ Advanced rent filters</li>
            <li>✓ Distance-based filtering</li>
            <li>✓ Advanced amenities filters</li>
            <li>✓ Priority roommate discovery</li>
            <li>✓ Better contact & enquiry tracking</li>
            <li>✓ Early access to new features</li>
          </ul>

          {user && !isStandard && !isPremium && (
            <button
              className="student-pro-upgrade-btn standard-upgrade-btn"
              onClick={() =>
                handleTestUpgrade('standard')
              }
            >
              Upgrade to Standard →
            </button>
          )}
        </div>

        {/* PREMIUM */}
        <div className="student-pro-plan premium-plan">

          <div className="premium-popular">
            👑 COMPLETE STUDENT EXPERIENCE
          </div>

          <div className="plan-header">
            <div>
              <span className="plan-label premium-label">
                👑 PREMIUM
              </span>
              <h2>Premium</h2>
            </div>

            {isPremium && (
              <span className="current-plan premium-current">
                CURRENT
              </span>
            )}
          </div>

          <div className="plan-price">
            ₹99 <span>/ month</span>
          </div>

          <p className="plan-description">
            The complete Mera Basera experience for room, career and study.
          </p>

          <ul className="plan-features premium-features">

            <li>✓ Everything in Standard</li>

            <li className="feature-section">
            </li>

            <li className="feature-section">
              ⏱️ <strong>Padhai Timer</strong>
            </li>

            <li className="feature-section">
              🔔 <strong>Smart Alerts</strong>
            </li>

            <li>✓ New room matching your preferences</li>
            <li>✓ Price drop</li>
            <li>✓ New verified property</li>
            <li>✓ New roommate match</li>
            <li>✓ Subscription expiry reminder</li>

            <li className="feature-section">
              🚀 <strong>Premium Perks</strong>
            </li>

            <li>✓ Early access to new Mera Basera features</li>
            <li>✓ Premium badge on student profile</li>
            <li>✓ Priority support</li>
            <li>✓ Ad-free experience</li>

          </ul>

          {user && !isPremium && (
            <button
              className="student-pro-upgrade-btn premium-upgrade-btn"
              onClick={() =>
                handleTestUpgrade('premium')
              }
            >
              Upgrade to Premium →
            </button>
          )}

        </div>

      </section>

      {/* SUBSCRIPTION STATUS */}
      {user && !loading && subscription && (
        <section className="student-pro-status">
          <h2>Your Subscription</h2>

          <div className="student-pro-status-card">

            <div>
              <span>Current Plan</span>

              <strong>
                {subscription.plan === 'premium'
                  ? '👑 Premium'
                  : subscription.plan === 'standard'
                  ? '⭐ Standard'
                  : '🆓 Free'}
              </strong>
            </div>

            <div>
              <span>Status</span>
              <strong>{subscription.status}</strong>
            </div>

            {subscription.expires_at && (
              <div>
                <span>Expires</span>
                <strong>
                  {new Date(
                    subscription.expires_at
                  ).toLocaleDateString('en-IN')}
                </strong>
              </div>
            )}

          </div>
        </section>
      )}

      {/* CTA */}
      <section className="student-pro-cta">
        <h2>One platform. Your complete student journey.</h2>

        <p>
          Find your room, explore your career and build a better
          study routine with Mera Basera.
        </p>

        <Link to="/" className="student-pro-secondary-btn">
          ← Back to Room Search
        </Link>
      </section>

    </main>
  );
}
