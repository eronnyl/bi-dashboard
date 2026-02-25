const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

async function fetchJson(path) {
  const res = await fetch(`${BASE_URL}${path}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
  return res.json();
}

export const getRendimiento = () => fetchJson('/api/dwh/rendimiento');
export const getCostos = () => fetchJson('/api/dwh/costos');
export const getEtlStatus = () => fetchJson('/api/etl/status');

export async function triggerEtl() {
  const res = await fetch(`${BASE_URL}/api/etl/run`, { method: 'POST' });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}
