import apiClient from './apiClient';

export async function payFine(payload) {
  const { data } = await apiClient.post('/payments', payload);
  return data;
}
