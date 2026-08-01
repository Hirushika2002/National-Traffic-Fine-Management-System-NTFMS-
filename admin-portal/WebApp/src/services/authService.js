import apiClient from './apiClient';

export async function login(email, password) {
  const { data } = await apiClient.post('/auth/admin/login', { email, password });
  return data;
}
