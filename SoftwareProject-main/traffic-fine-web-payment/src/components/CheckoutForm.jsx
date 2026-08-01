import { useState } from 'react';
import { formatCardNumber, formatExpiryDate, formatCvv, formatPhone, isExpiryInFuture } from '../utils/cardUtils';

const PHONE_REGEX = /^(?:\+94|0)?7\d{8}$/;

const initialValues = {
  payerName: '',
  payerContact: '',
  paymentMethod: 'CREDIT_CARD',
  cardNumber: '',
  expiryDate: '',
  cvv: '',
};

function validate(values) {
  const errors = {};

  if (!values.payerName.trim()) {
    errors.payerName = 'Full name is required';
  }

  if (!PHONE_REGEX.test(values.payerContact)) {
    errors.payerContact = 'Enter a valid Sri Lankan mobile number (e.g. 0771234567)';
  }

  const cardDigits = values.cardNumber.replace(/\s/g, '');
  if (!/^\d{13,19}$/.test(cardDigits)) {
    errors.cardNumber = 'Card number must be 13-19 digits';
  }

  if (!isExpiryInFuture(values.expiryDate)) {
    errors.expiryDate = 'Enter a valid, non-expired MM/YY date';
  }

  if (!/^\d{3,4}$/.test(values.cvv)) {
    errors.cvv = 'CVV must be 3-4 digits';
  }

  return errors;
}

export default function CheckoutForm({ onSubmit, submitting, submitError }) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});

  function updateField(field, formatter) {
    return (event) => {
      const formatted = formatter ? formatter(event.target.value) : event.target.value;
      setValues((prev) => ({ ...prev, [field]: formatted }));
    };
  }

  function handleSubmit(event) {
    event.preventDefault();
    const validationErrors = validate(values);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    onSubmit({
      ...values,
      cardNumber: values.cardNumber.replace(/\s/g, ''),
    });
  }

  return (
    <form className="checkout-form" onSubmit={handleSubmit} noValidate>
      <div className="form-field">
        <label htmlFor="payerName">Full Name</label>
        <input
          id="payerName"
          type="text"
          value={values.payerName}
          onChange={updateField('payerName')}
          autoComplete="name"
        />
        {errors.payerName && <span className="field-error">{errors.payerName}</span>}
      </div>

      <div className="form-field">
        <label htmlFor="payerContact">Contact Number</label>
        <input
          id="payerContact"
          type="tel"
          placeholder="0771234567"
          value={values.payerContact}
          onChange={updateField('payerContact', formatPhone)}
          autoComplete="tel"
        />
        {errors.payerContact && <span className="field-error">{errors.payerContact}</span>}
      </div>

      <div className="form-field">
        <label htmlFor="paymentMethod">Payment Method</label>
        <select
          id="paymentMethod"
          value={values.paymentMethod}
          onChange={updateField('paymentMethod')}
        >
          <option value="CREDIT_CARD">Credit Card</option>
          <option value="DEBIT_CARD">Debit Card</option>
        </select>
      </div>

      <div className="form-field">
        <label htmlFor="cardNumber">Card Number</label>
        <input
          id="cardNumber"
          type="text"
          inputMode="numeric"
          placeholder="4111 1111 1111 1111"
          value={values.cardNumber}
          onChange={updateField('cardNumber', formatCardNumber)}
          autoComplete="cc-number"
        />
        {errors.cardNumber && <span className="field-error">{errors.cardNumber}</span>}
      </div>

      <div className="form-row">
        <div className="form-field">
          <label htmlFor="expiryDate">Expiry (MM/YY)</label>
          <input
            id="expiryDate"
            type="text"
            inputMode="numeric"
            placeholder="12/30"
            value={values.expiryDate}
            onChange={updateField('expiryDate', formatExpiryDate)}
            autoComplete="cc-exp"
          />
          {errors.expiryDate && <span className="field-error">{errors.expiryDate}</span>}
        </div>

        <div className="form-field">
          <label htmlFor="cvv">CVV</label>
          <input
            id="cvv"
            type="password"
            inputMode="numeric"
            placeholder="123"
            value={values.cvv}
            onChange={updateField('cvv', formatCvv)}
            autoComplete="cc-csc"
          />
          {errors.cvv && <span className="field-error">{errors.cvv}</span>}
        </div>
      </div>

      {submitError && <div className="error-banner" role="alert">{submitError}</div>}

      <button type="submit" className="btn btn--primary" disabled={submitting}>
        {submitting ? 'Processing...' : 'Pay Now'}
      </button>

      <p className="disclaimer">
        This is a simulated checkout for demo purposes. Card details are validated but never stored.
      </p>
    </form>
  );
}
