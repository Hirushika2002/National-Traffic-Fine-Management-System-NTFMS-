import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import StepIndicator from './components/StepIndicator';
import FineLookup from './components/FineLookup';
import FineDetails from './components/FineDetails';
import PaymentForm from './components/PaymentForm';
import PaymentSuccess from './components/PaymentSuccess';
import { apiService } from './services/api';

/**
 * NTFMS Driver Web Portal — Main Application
 * 
 * Multi-step flow:
 *   1. Fine Lookup (enter ref + category)
 *   2. Fine Details (view violation info)
 *   3. Payment Form (enter card details)
 *   4. Payment Confirmation (success + SMS receipt)
 */
export default function App() {
  // ── State ────────────────────────────────────────────────
  const [theme, setTheme] = useState('dark');
  const [step, setStep] = useState('lookup'); // lookup | details | payment | confirmation
  const [fine, setFine] = useState(null);
  const [paymentResult, setPaymentResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // ── Theme Initialization ─────────────────────────────────
  useEffect(() => {
    const savedTheme = localStorage.getItem('ntfms_driver_theme') || 'dark';
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem('ntfms_driver_theme', nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
  };

  // ── Handlers ─────────────────────────────────────────────

  /** Step 1 → Step 2: Look up fine */
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

  /** Step 2 → Step 3: Proceed to payment */
  const handleProceedToPayment = () => {
    setStep('payment');
    setError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  /** Step 3: Process payment */
  const handlePayment = async (cardDetails) => {
    setLoading(true);
    setError('');

    try {
      const result = await apiService.processPayment(fine.refNo, cardDetails);
      setPaymentResult(result);
      setStep('confirmation');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setError(err.message || 'Payment failed. Please check your card details and try again.');
    } finally {
      setLoading(false);
    }
  };

  /** Back to fine details from payment */
  const handleBackToDetails = () => {
    setStep('details');
    setError('');
  };

  /** Reset entire flow */
  const handleReset = () => {
    setStep('lookup');
    setFine(null);
    setPaymentResult(null);
    setError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ── Map step to StepIndicator key ────────────────────────
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

  // ── Render Step Content ──────────────────────────────────
  const renderContent = () => {
    switch (step) {
      case 'lookup':
        return (
          <FineLookup
            onFineFound={handleFineLookup}
            loading={loading}
            error={error}
          />
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
      <Header theme={theme} toggleTheme={toggleTheme} />

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
    paddingTop: '36px',
    paddingBottom: '40px',
  },
  stepSection: {
    marginBottom: '8px',
  },
  content: {
    minHeight: '400px',
  },
};
