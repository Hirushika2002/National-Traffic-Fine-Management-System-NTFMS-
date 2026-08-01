import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import LoginPage from '../src/pages/LoginPage';
import { useAuthStore } from '../src/store/authStore';
import { login } from '../src/services/authService';

vi.mock('../src/services/authService', () => ({
  login: vi.fn(),
}));

function renderLoginPage() {
  return render(
    <MemoryRouter initialEntries={['/login']}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={<div>DASHBOARD PAGE</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.getState().logout();
  });

  it('logs in and navigates to the dashboard on success', async () => {
    login.mockResolvedValue({
      accessToken: 'a1',
      refreshToken: 'r1',
      admin: { id: 1, fullName: 'System Administrator', role: 'SUPER_ADMIN' },
    });
    const user = userEvent.setup();
    renderLoginPage();

    await user.type(screen.getByLabelText(/email/i), 'admin@police.lk');
    await user.type(screen.getByLabelText(/password/i), 'ChangeMe123!');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => expect(screen.getByText('DASHBOARD PAGE')).toBeInTheDocument());
    expect(useAuthStore.getState().accessToken).toBe('a1');
  });

  it('shows an error banner on invalid credentials', async () => {
    login.mockRejectedValue({ response: { data: { error: 'Invalid email or password' } } });
    const user = userEvent.setup();
    renderLoginPage();

    await user.type(screen.getByLabelText(/email/i), 'admin@police.lk');
    await user.type(screen.getByLabelText(/password/i), 'wrong');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    expect(await screen.findByText(/invalid email or password/i)).toBeInTheDocument();
    expect(useAuthStore.getState().accessToken).toBeNull();
  });
});
