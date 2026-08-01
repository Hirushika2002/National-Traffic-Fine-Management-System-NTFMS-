import apiClient from './apiClient';

export async function getSummary() {
  const { data } = await apiClient.get('/admin/reports/summary');
  return data;
}

export async function getDistrictReport() {
  const { data } = await apiClient.get('/admin/reports/districts');
  return data;
}

export async function getCategoryReport() {
  const { data } = await apiClient.get('/admin/reports/categories');
  return data;
}
