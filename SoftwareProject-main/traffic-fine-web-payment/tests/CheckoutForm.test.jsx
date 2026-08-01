import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CheckoutForm from '../src/components/CheckoutForm';

// A far-future expiry so the test stays valid regardless of when it runs.
const FUTURE_EXPIRY_DIGITS = '1240';
const FUTURE_EXPIRY_FORMATTED = '12/40';

async function fillValidForm(user) {
  await user.type(screen.getByLabelText(/full name/i), 'A. B. Perera');
  await user.type(screen.getByLabelText(/contact number/i), '0771234567');
  await user.type(screen.getByLabelText(/card number/i), '4111222233334444');
  await user.type(screen.getByLabelText(/expiry/i), FUTURE_EXPIRY_DIGITS);
  await user.type(screen.getByLabelText(/cvv/i), '123');
}

describe('CheckoutForm', () => {
  it('formats the card number into groups of 4 as the user types', async () => {
    const user = userEvent.setup({ delay: null });
    render(<CheckoutForm onSubmit={vi.fn()} submitting={false} submitError="" />);

    await user.type(screen.getByLabelText(/card number/i), '4111222233334444');

    expect(screen.getByLabelText(/card number/i)).toHaveValue('4111 2222 3333 4444');
  });

  it('inserts a slash into the expiry date as the user types', async () => {
    const user = userEvent.setup({ delay: null });
    render(<CheckoutForm onSubmit={vi.fn()} submitting={false} submitError="" />);

    await user.type(screen.getByLabelText(/expiry/i), '1230');

    expect(screen.getByLabelText(/expiry/i)).toHaveValue('12/30');
  });

  it('blocks submission and shows errors when fields are invalid', async () => {
    const user = userEvent.setup({ delay: null });
    const onSubmit = vi.fn();
    render(<CheckoutForm onSubmit={onSubmit} submitting={false} submitError="" />);

    await user.click(screen.getByRole('button', { name: /pay now/i }));

    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByText(/full name is required/i)).toBeInTheDocument();
    expect(screen.getByText(/valid sri lankan mobile number/i)).toBeInTheDocument();
  });

  it('rejects an expired card', async () => {
    const user = userEvent.setup({ delay: null });
    const onSubmit = vi.fn();
    render(<CheckoutForm onSubmit={onSubmit} submitting={false} submitError="" />);

    await fillValidForm(user);
    await user.clear(screen.getByLabelText(/expiry/i));
    await user.type(screen.getByLabelText(/expiry/i), '0120');

    await user.click(screen.getByRole('button', { name: /pay now/i }));

    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByText(/non-expired/i)).toBeInTheDocument();
  });

  it('submits cleaned values when the form is valid', async () => {
    const user = userEvent.setup({ delay: null });
    const onSubmit = vi.fn();
    render(<CheckoutForm onSubmit={onSubmit} submitting={false} submitError="" />);

    await fillValidForm(user);
    await user.click(screen.getByRole('button', { name: /pay now/i }));

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        payerName: 'A. B. Perera',
        payerContact: '0771234567',
        cardNumber: '4111222233334444',
        expiryDate: FUTURE_EXPIRY_FORMATTED,
        cvv: '123',
        paymentMethod: 'CREDIT_CARD',
      }),
    );
  });

  it('shows the server-side submit error and disables the button while submitting', () => {
    render(<CheckoutForm onSubmit={vi.fn()} submitting submitError="Fine already paid" />);

    expect(screen.getByText(/fine already paid/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /processing/i })).toBeDisabled();
  });
});
