import React, { useState, useEffect } from 'react';
import {
  CreditCard, User, Calendar, Lock, ArrowLeft,
  AlertCircle, ShieldCheck
} from 'lucide-react';
import { formatCardNumber, formatExpiry, detectCardType, luhnValidate, validateExpiry } from '../services/api';

export default function PaymentForm({ fine, onPaymentSuccess, onBack, loading }) {
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [errors, setErrors] = useState({});
  const [cardType, setCardType] = useState('unknown');

  // Detect card type as user types
  useEffect(() => {
    setCardType(detectCardType(cardNumber));
  }, [cardNumber]);

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const validate = () => {
    const newErrors = {};
    const cleanCard = cardNumber.replace(/\s+/g, '');

    if (!cleanCard || cleanCard.length < 13) {
      newErrors.cardNumber = 'Please enter a valid card number.';
    } else if (!luhnValidate(cleanCard)) {
      newErrors.cardNumber = 'Invalid card number. Please verify and try again.';
    }

    if (!cardHolder.trim() || cardHolder.trim().length < 3) {
      newErrors.cardHolder = 'Please enter the cardholder name.';
    }

    if (!expiry || expiry.replace(/\s+/g, '').replace('/', '').length < 4) {
      newErrors.expiry = 'Please enter a valid expiry date (MM/YY).';
    } else if (!validateExpiry(expiry)) {
      newErrors.expiry = 'Card has expired or expiry date is invalid.';
    }

    if (!cvv || cvv.length < 3) {
      newErrors.cvv = 'Please enter your 3-digit CVV.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    onPaymentSuccess({
      cardNumber: cardNumber.replace(/\s+/g, ''),
      cardHolderName: cardHolder.trim().toUpperCase(),
      expiry: expiry.replace(/\s+/g, '').replace('/', ''),
      cvv,
    });
  };

  const getCardTypeBadge = () => {
    switch (cardType) {
      case 'visa': return { text: 'VISA', color: '#1A1F71' };
      case 'mastercard': return { text: 'MC', color: '#EB001B' };
      case 'amex': return { text: 'AMEX', color: '#006FCF' };
      default: return null;
    }
  };

  const cardBadge = getCardTypeBadge();

  return (
    <div className="animate-fade-in-scale" style={styles.container}>
      {/* Payment Summary Header */}
      <div className="glass-panel" style={styles.summaryCard}>
        <div style={styles.summaryTop}>
          <div>
            <span style={styles.summaryLabel}>Paying for Fine</span>
            <span style={styles.summaryRef}>{fine.refNo}</span>
          </div>
          <div style={styles.summaryAmount}>
            <span style={styles.amountLabel}>Amount Due</span>
            <span style={styles.amountValue}>{formatAmount(fine.amount)}</span>
          </div>
        </div>
        <div style={styles.summaryMeta}>
          <span>{fine.categoryName}</span>
          <span>•</span>
          <span>{fine.driverName}</span>
        </div>
      </div>

      {/* Card Payment Form */}
      <form onSubmit={handleSubmit} style={styles.form} id="payment-form">
        <div style={styles.formHeader}>
          <ShieldCheck size={18} color="var(--success)" />
          <span style={styles.secureText}>Secure Payment</span>
        </div>

        {/* Card Number */}
        <div className="input-group">
          <label className="input-label" htmlFor="card-number-input">Card Number</label>
          <div className="input-wrapper">
            <input
              id="card-number-input"
              type="text"
              className={`input-field ${errors.cardNumber ? 'input-error' : ''}`}
              placeholder="4111 1111 1111 1111"
              value={cardNumber}
              onChange={(e) => {
                setCardNumber(formatCardNumber(e.target.value));
                if (errors.cardNumber) setErrors(prev => ({ ...prev, cardNumber: '' }));
              }}
              disabled={loading}
              autoComplete="cc-number"
              maxLength={19}
              inputMode="numeric"
            />
            <CreditCard size={18} className="input-icon" />
            {cardBadge && (
              <span style={{
                ...styles.cardBadge,
                backgroundColor: cardBadge.color,
              }}>
                {cardBadge.text}
              </span>
            )}
          </div>
          {errors.cardNumber && <span className="input-error-text">{errors.cardNumber}</span>}
          <span className="input-hint">Enter your 16-digit card number</span>
        </div>

        {/* Cardholder Name */}
        <div className="input-group">
          <label className="input-label" htmlFor="card-holder-input">Cardholder Name</label>
          <div className="input-wrapper">
            <input
              id="card-holder-input"
              type="text"
              className={`input-field ${errors.cardHolder ? 'input-error' : ''}`}
              placeholder="ROHAN SILVA"
              value={cardHolder}
              onChange={(e) => {
                setCardHolder(e.target.value.toUpperCase());
                if (errors.cardHolder) setErrors(prev => ({ ...prev, cardHolder: '' }));
              }}
              disabled={loading}
              autoComplete="cc-name"
            />
            <User size={18} className="input-icon" />
          </div>
          {errors.cardHolder && <span className="input-error-text">{errors.cardHolder}</span>}
        </div>

        {/* Expiry + CVV Row */}
        <div style={styles.splitRow}>
          <div className="input-group" style={{ flex: 1 }}>
            <label className="input-label" htmlFor="expiry-input">Expiry Date</label>
            <div className="input-wrapper">
              <input
                id="expiry-input"
                type="text"
                className={`input-field ${errors.expiry ? 'input-error' : ''}`}
                placeholder="MM / YY"
                value={expiry}
                onChange={(e) => {
                  setExpiry(formatExpiry(e.target.value));
                  if (errors.expiry) setErrors(prev => ({ ...prev, expiry: '' }));
                }}
                disabled={loading}
                autoComplete="cc-exp"
                maxLength={7}
                inputMode="numeric"
              />
              <Calendar size={18} className="input-icon" />
            </div>
            {errors.expiry && <span className="input-error-text">{errors.expiry}</span>}
          </div>

          <div className="input-group" style={{ flex: 1 }}>
            <label className="input-label" htmlFor="cvv-input">CVV</label>
            <div className="input-wrapper">
              <input
                id="cvv-input"
                type="password"
                className={`input-field ${errors.cvv ? 'input-error' : ''}`}
                placeholder="•••"
                value={cvv}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '').slice(0, 4);
                  setCvv(val);
                  if (errors.cvv) setErrors(prev => ({ ...prev, cvv: '' }));
                }}
                disabled={loading}
                autoComplete="cc-csc"
                maxLength={4}
                inputMode="numeric"
              />
              <Lock size={18} className="input-icon" />
            </div>
            {errors.cvv && <span className="input-error-text">{errors.cvv}</span>}
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="btn btn-success btn-lg btn-full"
          disabled={loading}
          id="pay-now-btn"
          style={{ marginTop: '8px' }}
        >
          {loading ? (
            <>
              <span className="spinner"></span>
              Processing Payment...
            </>
          ) : (
            <>
              <Lock size={16} />
              Pay Now {formatAmount(fine.amount)}
            </>
          )}
        </button>

        {/* Back Button */}
        <button
          type="button"
          className="btn btn-ghost btn-full"
          onClick={onBack}
          disabled={loading}
          id="back-to-details-btn"
        >
          <ArrowLeft size={16} />
          Back to Fine Details
        </button>
      </form>

      {/* Security Notice */}
      <div style={styles.securityNotice}>
        <Lock size={14} color="var(--text-dark)" />
        <span style={styles.securityText}>
          Your card details are processed securely and are never stored on our servers.
          All transactions are encrypted end-to-end.
        </span>
      </div>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '520px',
    margin: '0 auto',
    padding: '0 24px',
  },
  summaryCard: {
    padding: '20px 24px',
    marginBottom: '20px',
  },
  summaryTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '16px',
  },
  summaryLabel: {
    display: 'block',
    fontSize: '0.7rem',
    fontWeight: '600',
    color: 'var(--text-dark)',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
  },
  summaryRef: {
    display: 'block',
    fontSize: '1rem',
    fontWeight: '700',
    color: 'var(--text-main)',
    fontFamily: 'monospace',
    marginTop: '4px',
  },
  summaryAmount: {
    textAlign: 'right',
  },
  amountLabel: {
    display: 'block',
    fontSize: '0.7rem',
    fontWeight: '600',
    color: 'var(--text-dark)',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
  },
  amountValue: {
    display: 'block',
    fontSize: '1.3rem',
    fontWeight: '800',
    color: 'var(--accent)',
    marginTop: '4px',
  },
  summaryMeta: {
    display: 'flex',
    gap: '8px',
    marginTop: '12px',
    fontSize: '0.8rem',
    color: 'var(--text-muted)',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '18px',
    background: 'var(--bg-glass-card)',
    backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)',
    border: '1px solid var(--border-subtle)',
    borderRadius: '16px',
    padding: '28px',
  },
  formHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    paddingBottom: '12px',
    borderBottom: '1px solid var(--border-subtle)',
    marginBottom: '4px',
  },
  secureText: {
    fontSize: '0.85rem',
    fontWeight: '600',
    color: 'var(--success)',
  },
  splitRow: {
    display: 'flex',
    gap: '16px',
  },
  cardBadge: {
    position: 'absolute',
    right: '12px',
    padding: '2px 8px',
    borderRadius: '4px',
    fontSize: '0.65rem',
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: '0.04em',
    pointerEvents: 'none',
  },
  securityNotice: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '8px',
    marginTop: '16px',
    padding: '0 4px',
  },
  securityText: {
    fontSize: '0.7rem',
    color: 'var(--text-dark)',
    lineHeight: '1.5',
  },
};
