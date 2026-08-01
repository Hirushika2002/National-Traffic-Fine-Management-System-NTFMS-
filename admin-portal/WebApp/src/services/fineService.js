import apiClient from './apiClient';

export async function getFines(filters) {
  const params = Object.fromEntries(
    Object.entries(filters).filter(([, value]) => value !== '' && value !== undefined && value !== null),
  );
  const { data } = await apiClient.get('/admin/fines', { params });
  return data;
}
