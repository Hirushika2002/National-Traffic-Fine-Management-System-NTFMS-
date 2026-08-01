import React, { useState, useEffect } from 'react';
import {
  CreditCard, User, Calendar, Lock, ArrowLeft, Phone,
  AlertCircle, ShieldCheck, Check
} from 'lucide-react';
import {
  formatCardNumber,
  formatExpiry,
  detectCardType,
  luhnValidate,
  validateExpiry,
  validatePhone
} from '../services/api';

export default function PaymentForm({ fine, onPaymentSuccess, onBack, loading }) {
  const [cardNumber, setCardNumber] = useState('');
  const [payerName, setPayerName] = useState(fine?.driverName || '');
  const [payerContact, setPayerContact] = useState('0771234567');
  const [paymentMethod, setPaymentMethod] = useState('CREDIT_CARD');
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
      newErrors.cardNumber = 'Invalid card number. Please verify your card digits.';
    }

    if (!payerName.trim() || payerName.trim().length < 3) {
      newErrors.payerName = 'Please enter the payer full name.';
    }

    if (!payerContact.trim() || !validatePhone(payerContact)) {
      newErrors.payerContact = 'Enter a valid Sri Lankan mobile number (e.g., 0771234567 or +94771234567).';
    }

    if (!expiry || expiry.replace(/\s+/g, '').replace('/', '').length < 4) {
      newErrors.expiry = 'Please enter a valid expiry date (MM/YY).';
    } else if (!validateExpiry(expiry)) {
      newErrors.expiry = 'Card has expired or expiry date is invalid.';
    }

    if (!cvv || cvv.length < 3) {
      newErrors.cvv = 'Please enter 3 or 4-digit CVV code.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    onPaymentSuccess({
      cardNumber: cardNumber.replace(/\s+/g, ''),
      payerName: payerName.trim().toUpperCase(),
      cardHolderName: payerName.trim().toUpperCase(),
      payerContact: payerContact.trim(),
      paymentMethod,
      expiry: expiry.replace(/\s+/g, ''),
      cvv,
    });
  };

  const getCardTypeBadge = () => {
    switch (cardType) {
      case 'visa': return { text: 'VISA', color: '#1A1F71' };
      case 'mastercard': return { text: 'MASTERCARD', color: '#EB001B' };
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
            <span style={styles.summaryLabel}>PAYING TRAFFIC FINE</span>
            <span style={styles.summaryRef}>{fine.refNo}</span>
          </div>
          <div style={styles.summaryAmount}>
            <span style={styles.amountLabel}>Total Due</span>
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
          <ShieldCheck size={20} color="var(--success)" />
          <span style={styles.secureText}>256-bit Encrypted Payment Gateway</span>
        </div>

        {/* Payment Method Selector */}
        <div className="input-group">
          <label className="input-label">Payment Method</label>
          <div style={styles.methodSelector}>
            <button
              type="button"
              style={{
                ...styles.methodBtn,
                ...(paymentMethod === 'CREDIT_CARD' ? styles.methodBtnActive : {})
              }}
              onClick={() => setPaymentMethod('CREDIT_CARD')}
            >
              <CreditCard size={16} />
              Credit Card
            </button>
            <button
              type="button"
              style={{
                ...styles.methodBtn,
                ...(paymentMethod === 'DEBIT_CARD' ? styles.methodBtnActive : {})
              }}
              onClick={() => setPaymentMethod('DEBIT_CARD')}
            >
              <CreditCard size={16} />
              Debit Card
            </button>
          </div>
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
          <span className="input-hint">16-digit debit or credit card number</span>
        </div>

        {/* Payer Full Name */}
        <div className="input-group">
          <label className="input-label" htmlFor="payer-name-input">Payer / Cardholder Full Name</label>
          <div className="input-wrapper">
            <input
              id="payer-name-input"
              type="text"
              className={`input-field ${errors.payerName ? 'input-error' : ''}`}
              placeholder="HIRUNI PERERA"
              value={payerName}
              onChange={(e) => {
                setPayerName(e.target.value.toUpperCase());
                if (errors.payerName) setErrors(prev => ({ ...prev, payerName: '' }));
              }}
              disabled={loading}
              autoComplete="cc-name"
            />
            <User size={18} className="input-icon" />
          </div>
          {errors.payerName && <span className="input-error-text">{errors.payerName}</span>}
        </div>

        {/* Payer Contact Phone (For Officer SMS Notification) */}
        <div className="input-group">
          <label className="input-label" htmlFor="payer-contact-input">Payer Mobile Phone (For SMS Notification)</label>
          <div className="input-wrapper">
            <input
              id="payer-contact-input"
              type="tel"
              className={`input-field ${errors.payerContact ? 'input-error' : ''}`}
              placeholder="0771234567"
              value={payerContact}
              onChange={(e) => {
                setPayerContact(e.target.value);
                if (errors.payerContact) setErrors(prev => ({ ...prev, payerContact: '' }));
              }}
              disabled={loading}
              autoComplete="tel"
            />
            <Phone size={18} className="input-icon" />
          </div>
          {errors.payerContact && <span className="input-error-text">{errors.payerContact}</span>}
          <span className="input-hint">Used for sending SMS verification logs to issuing officer</span>
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
            <label className="input-label" htmlFor="cvv-input">Security CVV</label>
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
              Processing Transaction...
            </>
          ) : (
            <>
              <Lock size={16} />
              Pay {formatAmount(fine.amount)} Now
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
          Your card details are processed securely and never persisted in raw form.
          Official receipts are issued in real-time to Sri Lanka Police Central Fine Database.
        </span>
      </div>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '540px',
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
  methodSelector: {
    display: 'flex',
    gap: '8px',
  },
  methodBtn: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '10px 14px',
    border: '1px solid var(--border-subtle)',
    borderRadius: '8px',
    background: 'rgba(255, 255, 255, 0.03)',
    color: 'var(--text-muted)',
    fontSize: '0.82rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  methodBtnActive: {
    background: 'rgba(212, 175, 55, 0.1)',
    borderColor: 'var(--accent)',
    color: 'var(--accent)',
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
    fontSize: '0.72rem',
    color: 'var(--text-dark)',
    lineHeight: '1.5',
  },
};
