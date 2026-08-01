import { describe, it, expect, beforeEach } from 'vitest';
import { useAuthStore } from '../src/store/authStore';

describe('authStore', () => {
  beforeEach(() => {
    useAuthStore.getState().logout();
    window.localStorage.clear();
  });

  it('starts unauthenticated', () => {
    expect(useAuthStore.getState().accessToken).toBeNull();
    expect(useAuthStore.getState().isAuthenticated()).toBe(false);
  });

  it('stores tokens and admin info on setSession', () => {
    useAuthStore.getState().setSession({
      accessToken: 'access-1',
      refreshToken: 'refresh-1',
      admin: { id: 1, fullName: 'System Administrator', role: 'SUPER_ADMIN' },
    });

    const state = useAuthStore.getState();
    expect(state.accessToken).toBe('access-1');
    expect(state.refreshToken).toBe('refresh-1');
    expect(state.admin.fullName).toBe('System Administrator');
    expect(state.isAuthenticated()).toBe(true);
  });

  it('keeps the existing refresh token when only a new access token is set', () => {
    useAuthStore.getState().setSession({ accessToken: 'a1', refreshToken: 'r1', admin: { id: 1 } });
    useAuthStore.getState().setSession({ accessToken: 'a2' });

    const state = useAuthStore.getState();
    expect(state.accessToken).toBe('a2');
    expect(state.refreshToken).toBe('r1');
  });

  it('clears everything on logout', () => {
    useAuthStore.getState().setSession({ accessToken: 'a1', refreshToken: 'r1', admin: { id: 1 } });
    useAuthStore.getState().logout();

    const state = useAuthStore.getState();
    expect(state.accessToken).toBeNull();
    expect(state.refreshToken).toBeNull();
    expect(state.admin).toBeNull();
  });
});
