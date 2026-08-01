import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import StepIndicator from './components/StepIndicator';
import FineLookup from './components/FineLookup';
import FineDetails from './components/FineDetails';
import PaymentForm from './components/PaymentForm';
import PaymentSuccess from './components/PaymentSuccess';
import { apiService } from './services/api';
import { authService } from './services/authService';

/**
 * NTFMS Driver Web Portal — Main Application
 */
export default function App() {
  // ── States ────────────────────────────────────────────────
  const [theme, setTheme] = useState('dark');
  const [step, setStep] = useState('lookup'); // lookup | details | payment | confirmation
  const [fine, setFine] = useState(null);
  const [paymentResult, setPaymentResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // ── Auth States ──────────────────────────────────────────
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [userFines, setUserFines] = useState([]);
  const [licenseInput, setLicenseInput] = useState('');
  const [vehicleInput, setVehicleInput] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  // ── Theme & Auth Initialization ──────────────────────────
  useEffect(() => {
    const savedTheme = localStorage.getItem('ntfms_driver_theme') || 'dark';
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);

    // Listen to Firebase Auth
    const unsubscribe = authService.onAuthStateChanged(async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        await fetchProfileAndFines(firebaseUser.uid);
      } else {
        setProfile(null);
        setUserFines([]);
      }
    });

    return () => unsubscribe();
  }, []);

  const fetchProfileAndFines = async (uid) => {
    try {
      const p = await authService.getDriverProfile(uid);
      setProfile(p);
      if (p && p.licenseNumber) {
        const fines = await apiService.getFinesByLicense(p.licenseNumber);
        setUserFines(fines);
      }
    } catch (err) {
      console.error('Error fetching driver profile/fines:', err);
    }
  };

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem('ntfms_driver_theme', nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
  };

  // ── Auth Handlers ─────────────────────────────────────────
  const handleGoogleLogin = async () => {
    try {
      await authService.loginWithGoogle();
    } catch (err) {
      setError(err.message || 'Google Login failed.');
    }
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
      handleReset();
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!licenseInput.trim() || !vehicleInput.trim()) return;

    setSavingProfile(true);
    try {
      const updated = {
        ...profile,
        licenseNumber: licenseInput.trim().toUpperCase(),
        vehicleNo: vehicleInput.trim().toUpperCase(),
      };
      await authService.updateDriverProfile(user.uid, updated);
      setProfile(updated);
      const fines = await apiService.getFinesByLicense(updated.licenseNumber);
      setUserFines(fines);
    } catch (err) {
      setError('Failed to update driver registry profile.');
    } finally {
      setSavingProfile(false);
    }
  };

  // ── Fine Lookup / Payment Handlers ───────────────────────

  const handleFineLookup = async (refNo, categoryId) => {
    setLoading(true);
    setError('');

    try {
      const result = await apiService.lookupFine(refNo, categoryId);
      setFine(result);
      setStep('details');
    } catch (err) {
      setError(err.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectUserFine = async (userFine) => {
    setLoading(true);
    setError('');
    try {
      const result = await apiService.lookupFine(userFine.refNo, userFine.category);
      setFine(result);
      setStep('details');
    } catch (err) {
      setError(err.message || 'Failed to pull fine registry record.');
    } finally {
      setLoading(false);
    }
  };

  const handleProceedToPayment = () => {
    setStep('payment');
    setError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePayment = async (cardDetails) => {
    setLoading(true);
    setError('');

    try {
      const result = await apiService.processPayment(fine.refNo, cardDetails);
      setPaymentResult(result);
      setStep('confirmation');
      
      // If user is logged in, refresh fines list
      if (user && profile && profile.licenseNumber) {
        fetchProfileAndFines(user.uid);
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setError(err.message || 'Payment failed. Please check your card details.');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToDetails = () => {
    setStep('details');
    setError('');
  };

  const handleReset = () => {
    setStep('lookup');
    setFine(null);
    setPaymentResult(null);
    setError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getIndicatorStep = () => {
    switch (step) {
      case 'lookup':
      case 'details':
        return 'lookup';
      case 'payment':
        return 'payment';
      case 'confirmation':
        return 'confirmation';
      default:
        return 'lookup';
    }
  };

  // Calculate user fines stats
  const pendingUserFines = userFines.filter(f => f.status !== 'Paid');
  const paidUserFines = userFines.filter(f => f.status === 'Paid');
  const totalAmountDue = pendingUserFines.reduce((sum, f) => sum + (f.amount || 0), 0);

  // ── Render Content ───────────────────────────────────────
  const renderContent = () => {
    switch (step) {
      case 'lookup':
        return (
          <div style={styles.dashboardContainer}>
            {user ? (
              <div style={styles.driverSection}>
                {/* 1. Missing profile setup prompt */}
                {(!profile || !profile.licenseNumber) ? (
                  <div className="glass-panel" style={styles.profileSetupCard}>
                    <h3 style={styles.sectionTitle}>Link License to Account</h3>
                    <p style={styles.setupText}>
                      Please configure your Driving License ID and registered vehicle to lookup and pay your traffic violations.
                    </p>
                    <form onSubmit={handleSaveProfile} style={styles.setupForm}>
                      <input 
                        type="text" 
                        placeholder="Driving License (e.g. B1234567)" 
                        value={licenseInput}
                        onChange={(e) => setLicenseInput(e.target.value)}
                        style={styles.formInput}
                        required
                      />
                      <input 
                        type="text" 
                        placeholder="Vehicle Plate (e.g. WP-CB-1245)" 
                        value={vehicleInput}
                        onChange={(e) => setVehicleInput(e.target.value)}
                        style={styles.formInput}
                        required
                      />
                      <button type="submit" className="btn btn-accent" disabled={savingProfile}>
                        {savingProfile ? 'Saving...' : 'Link Profile'}
                      </button>
                    </form>
                  </div>
                ) : (
                  // 2. Main Driver Dashboard
                  <div style={styles.dashboardLayout}>
                    {/* Stats Header */}
                    <div style={styles.statsRow}>
                      <div className="glass-panel" style={styles.statBox}>
                        <span style={styles.statLabel}>Total Violations</span>
                        <span style={styles.statVal}>{userFines.length}</span>
                      </div>
                      <div className="glass-panel" style={styles.statBox}>
                        <span style={styles.statLabel}>Pending Settlement</span>
                        <span style={styles.statVal} className="text-accent">{pendingUserFines.length}</span>
                      </div>
                      <div className="glass-panel" style={styles.statBox}>
                        <span style={styles.statLabel}>Total Due</span>
                        <span style={styles.statVal} style={{ color: 'var(--danger)' }}>
                          Rs. {totalAmountDue.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {/* Fines Grid list */}
                    <div className="glass-panel" style={styles.finesContainer}>
                      <h3 style={styles.finesTitle}>My Traffic Fines</h3>
                      {userFines.length === 0 ? (
                        <p style={styles.emptyText}>No traffic violations registered to your license.</p>
                      ) : (
                        <div style={styles.tableWrapper}>
                          <table style={styles.table}>
                            <thead>
                              <tr>
                                <th>Reference</th>
                                <th>Category</th>
                                <th>Issued Date</th>
                                <th>Fine Amount</th>
                                <th>Status</th>
                                <th>Action</th>
                              </tr>
                            </thead>
                            <tbody>
                              {userFines.map((f) => (
                                <tr key={f.refNo}>
                                  <td style={{ fontWeight: 'bold' }}>{f.refNo}</td>
                                  <td>{f.category}</td>
                                  <td>{new Date(f.issuedAt).toLocaleDateString()}</td>
                                  <td style={{ fontWeight: 'bold' }}>Rs. {f.amount?.toLocaleString()}</td>
                                  <td>
                                    <span style={f.status === 'Paid' ? styles.statusPaid : styles.statusPending}>
                                      {f.status}
                                    </span>
                                  </td>
                                  <td>
                                    <button 
                                      onClick={() => handleSelectUserFine(f)} 
                                      className="btn btn-secondary"
                                      style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                                    >
                                      {f.status === 'Paid' ? 'Receipt' : 'Pay Now'}
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                <div style={{ marginTop: '24px', textAlign: 'center' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Or query a fine manually using details</span>
                </div>
              </div>
            ) : null}

            {/* Standard lookup always available underneath or if not logged in */}
            <FineLookup
              onFineFound={handleFineLookup}
              loading={loading}
              error={error}
            />
          </div>
        );

      case 'details':
        return (
          <FineDetails
            fine={fine}
            onProceedToPayment={handleProceedToPayment}
            onReset={handleReset}
          />
        );

      case 'payment':
        return (
          <PaymentForm
            fine={fine}
            onPaymentSuccess={handlePayment}
            onBack={handleBackToDetails}
            loading={loading}
          />
        );

      case 'confirmation':
        return (
          <PaymentSuccess
            result={paymentResult}
            onReset={handleReset}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div style={styles.app}>
      <Header 
        theme={theme} 
        toggleTheme={toggleTheme} 
        user={user}
        onLogin={handleGoogleLogin}
        onLogout={handleLogout}
      />

      <main style={styles.main}>
        {/* Step Progress Indicator */}
        <div style={styles.stepSection}>
          <StepIndicator currentStep={getIndicatorStep()} />
        </div>

        {/* Content */}
        <div style={styles.content}>
          {renderContent()}
        </div>
      </main>

      <Footer />
    </div>
  );
}

const styles = {
  app: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: 'var(--bg-base)',
    transition: 'background-color 0.3s ease',
  },
  main: {
    flex: 1,
    maxWidth: '1100px',
    margin: '0 auto',
    width: '100%',
    padding: '36px 24px 40px 24px',
  },
  stepSection: {
    marginBottom: '20px',
  },
  content: {
    minHeight: '400px',
  },
  dashboardContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  profileSetupCard: {
    padding: '28px',
    borderRadius: '16px',
    maxWidth: '480px',
    margin: '0 auto',
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: '1.25rem',
    fontWeight: 'bold',
    marginBottom: '8px',
  },
  setupText: {
    fontSize: '0.88rem',
    color: 'var(--text-muted)',
    marginBottom: '20px',
    lineHeight: 1.5,
  },
  setupForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  formInput: {
    padding: '12px',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid var(--border-subtle)',
    borderRadius: '8px',
    color: 'var(--text-main)',
    fontSize: '0.9rem',
    outline: 'none',
  },
  dashboardLayout: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  statsRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px',
  },
  statBox: {
    padding: '20px',
    borderRadius: '12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  statLabel: {
    fontSize: '0.78rem',
    fontWeight: '600',
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
  },
  statVal: {
    fontSize: '1.5rem',
    fontWeight: '800',
  },
  finesContainer: {
    padding: '24px',
    borderRadius: '16px',
  },
  finesTitle: {
    fontSize: '1.1rem',
    fontWeight: '800',
    marginBottom: '16px',
  },
  emptyText: {
    color: 'var(--text-muted)',
    fontSize: '0.9rem',
    textAlign: 'center',
    padding: '20px',
  },
  tableWrapper: {
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '0.9rem',
    textAlign: 'left',
  },
  statusPaid: {
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    color: '#10b981',
    padding: '4px 8px',
    borderRadius: '20px',
    fontWeight: 'bold',
    fontSize: '0.75rem',
  },
  statusPending: {
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    color: '#f59e0b',
    padding: '4px 8px',
    borderRadius: '20px',
    fontWeight: 'bold',
    fontSize: '0.75rem',
  }
};
