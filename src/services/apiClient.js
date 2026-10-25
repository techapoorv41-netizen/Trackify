/**
 * Integration seam for the future FastAPI backend.
 * Set VITE_API_BASE_URL (for example http://localhost:8000/api) and replace the
 * local-state actions in context/DataContext.jsx with calls to apiRequest().
 */
const BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

export const isBackendConnected = Boolean(BASE_URL);

export async function apiRequest(path, { method = 'GET', body, headers = {} } = {}) {
  if (!isBackendConnected) {
    throw new Error('Backend not connected: Trackify is running in local demo mode.');
  }
  const response = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json', ...headers },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }
  return response.json();
}

export const integrationPlaceholders = {
  email: { name: 'Email delivery (SMTP / transactional provider)', connected: false },
  sms: { name: 'SMS gateway', connected: false },
  ocr: { name: 'OCR and server-side document verification', connected: false },
  scheduler: { name: 'Backend job scheduler for reminders', connected: false },
};
