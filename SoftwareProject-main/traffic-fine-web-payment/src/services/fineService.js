import apiClient from './apiClient';

export async function lookupFine(referenceNo, categoryId) {
  const { data } = await apiClient.get('/fines/lookup', {
    params: { referenceNo, categoryId },
  });
  return data;
}
