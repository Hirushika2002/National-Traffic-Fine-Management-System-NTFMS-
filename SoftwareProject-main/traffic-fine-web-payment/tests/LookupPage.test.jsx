import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { FineProvider } from '../src/context/FineContext';
import LookupPage from '../src/pages/LookupPage';
import { lookupFine } from '../src/services/fineService';

vi.mock('../src/services/fineService', () => ({
  lookupFine: vi.fn(),
}));

function renderLookupPage() {
  return render(
    <FineProvider>
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="/" element={<LookupPage />} />
          <Route path="/details" element={<div>DETAILS PAGE</div>} />
        </Routes>
      </MemoryRouter>
    </FineProvider>,
  );
}

describe('LookupPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows a validation message when submitted empty', async () => {
    const user = userEvent.setup();
    renderLookupPage();

    await user.click(screen.getByRole('button', { name: /find my fine/i }));

    expect(await screen.findByText(/enter both the reference number/i)).toBeInTheDocument();
    expect(lookupFine).not.toHaveBeenCalled();
  });

  it('navigates to the details page on a successful lookup', async () => {
    lookupFine.mockResolvedValue({
      id: 1,
      referenceNo: 'SLP-2026-000123',
      status: 'PENDING',
    });
    const user = userEvent.setup();
    renderLookupPage();

    await user.type(screen.getByLabelText(/reference number/i), 'SLP-2026-000123');
    await user.type(screen.getByLabelText(/category id/i), '1');
    await user.click(screen.getByRole('button', { name: /find my fine/i }));

    await waitFor(() => expect(screen.getByText('DETAILS PAGE')).toBeInTheDocument());
    expect(lookupFine).toHaveBeenCalledWith('SLP-2026-000123', '1');
  });

  it('shows an error banner when the fine is not found', async () => {
    lookupFine.mockRejectedValue({ response: { data: { error: 'No matching fine found' } } });
    const user = userEvent.setup();
    renderLookupPage();

    await user.type(screen.getByLabelText(/reference number/i), 'UNKNOWN');
    await user.type(screen.getByLabelText(/category id/i), '99');
    await user.click(screen.getByRole('button', { name: /find my fine/i }));

    expect(await screen.findByText(/no matching fine found/i)).toBeInTheDocument();
  });
});
