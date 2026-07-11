const STORAGE_KEY = 'chat_username';

export function getStoredUsername() {
  return localStorage.getItem(STORAGE_KEY) || '';
}

export function setStoredUsername(username) {
  localStorage.setItem(STORAGE_KEY, username);
}

export function clearStoredUsername() {
  localStorage.removeItem(STORAGE_KEY);
}
