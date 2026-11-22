import api from './api';

export function saveSession(data) {
  const { token, user } = data || {};
  if (!token || !user) throw new Error('The server returned an invalid login response.');
  localStorage.setItem('userToken', token);
  localStorage.setItem('profile', JSON.stringify(user));
  window.dispatchEvent(new Event('auth-changed'));
  return user;
}

export function clearSession() {
  localStorage.removeItem('userToken');
  localStorage.removeItem('profile');
  localStorage.removeItem('profileImage');
  window.dispatchEvent(new Event('auth-changed'));
}

export async function registerUser(payload) {
  const response = await api.post('/auth/register', payload);
  return saveSession(response.data.data);
}

export async function loginUser(payload) {
  const response = await api.post('/auth/login', payload);
  return saveSession(response.data.data);
}

export async function getCurrentUser() {
  const response = await api.get('/users/me');
  const user = response.data.data.user;
  localStorage.setItem('profile', JSON.stringify(user));
  return user;
}

export async function updateCurrentUser(payload) {
  const response = await api.put('/users/me', payload);
  const user = response.data.data.user;
  localStorage.setItem('profile', JSON.stringify(user));
  window.dispatchEvent(new Event('auth-changed'));
  return user;
}
