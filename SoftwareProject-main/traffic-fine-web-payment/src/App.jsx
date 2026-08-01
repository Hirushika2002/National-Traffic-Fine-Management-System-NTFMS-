import { useState, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { FineProvider } from './context/FineContext';
import LookupPage from './pages/LookupPage';
import DetailsPage from './pages/DetailsPage';
import PaymentPage from './pages/PaymentPage';
import ReceiptPage from './pages/ReceiptPage';
import { Shield, Sun, Moon } from 'lucide-react';

function StepIndicator() {
  const location = useLocation();
  const path = location.pathname;

  const steps = [
    { label: '1', paths: ['/'] },
    { label: '2', paths: ['/details'] },
    { label: '3', paths: ['/payment'] },
    { label: '4', paths: ['/receipt'] },
  ];

  const getStepClass = (stepPaths) => {
    const isCurrent = stepPaths.includes(path);
    const currentIndex = steps.findIndex(s => s.paths.includes(path));
    const stepIndex = steps.findIndex(s => s.paths.includes(stepPaths[0]));

    if (isCurrent) return 'step-node step-node--active';
    if (stepIndex < currentIndex) return 'step-node step-node--completed';
    return 'step-node';
  };

  return (
    <div className="step-indicator-container" style={{ maxWidth: '400px', width: '100%', margin: '20px auto 10px' }}>
      <div className="step-indicator">
        {steps.map((s, idx) => (
          <div key={idx} className={getStepClass(s.paths)}>
            {s.label}
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: '600', marginTop: '6px' }}>
        <span style={{ textAlign: 'center', width: '60px' }}>Lookup</span>
        <span style={{ textAlign: 'center', width: '60px' }}>Details</span>
        <span style={{ textAlign: 'center', width: '60px' }}>Payment</span>
        <span style={{ textAlign: 'center', width: '60px' }}>Receipt</span>
      </div>
    </div>
  );
}

export default function App() {
  // Theme Management
  const [theme, setTheme] = useState(() => localStorage.getItem('ntfms_payment_theme') || 'dark');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('ntfms_payment_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  return (
    <FineProvider>
      <header className="app-header">
        <div className="app-header__brand">
          <div className="app-header__logo-container">
            <Shield size={20} color="var(--accent)" />
          </div>
          <div className="app-header__text">
            <span className="app-header__title">NTFMS Portal</span>
            <span className="app-header__subtitle">Sri Lanka Police Department</span>
          </div>
        </div>

        <button onClick={toggleTheme} className="theme-toggle-header" title="Toggle theme">
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </header>

      <main className="animate-fade-in-scale">
        <StepIndicator />
        <Routes>
          <Route path="/" element={<LookupPage />} />
          <Route path="/details" element={<DetailsPage />} />
          <Route path="/payment" element={<PaymentPage />} />
          <Route path="/receipt" element={<ReceiptPage />} />
        </Routes>
      </main>

      <footer className="disclaimer" style={{ paddingBottom: '40px' }}>
        <p>© 2026 Sri Lanka Police Department. All rights reserved.</p>
        <p>Payments processed via Central Bank of Sri Lanka Gateway.</p>
      </footer>
    </FineProvider>
  );
}
