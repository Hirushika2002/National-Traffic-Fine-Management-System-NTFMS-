import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from '../src/components/ProtectedRoute';
import { useAuthStore } from '../src/store/authStore';

function renderProtected(initialEntry = '/dashboard') {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route path="/login" element={<div>LOGIN PAGE</div>} />
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<div>DASHBOARD PAGE</div>} />
        </Route>
      </Routes>
    </MemoryRouter>,
  );
}

describe('ProtectedRoute', () => {
  beforeEach(() => {
    useAuthStore.getState().logout();
  });

  it('redirects to login when there is no access token', () => {
    renderProtected();
    expect(screen.getByText('LOGIN PAGE')).toBeInTheDocument();
  });

  it('renders the protected content when authenticated', () => {
    useAuthStore.getState().setSession({ accessToken: 'a1', refreshToken: 'r1', admin: { id: 1 } });
    renderProtected();
    expect(screen.getByText('DASHBOARD PAGE')).toBeInTheDocument();
  });
});
