import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// Normalize every failure (network error, timeout, 4xx/5xx) into a plain
// Error with a human-readable message so hooks/components never have to
// know about axios/response shapes.
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message || error.message || 'Something went wrong while contacting the server.';
    return Promise.reject(new Error(message));
  }
);

export const fetchMessages = async () => {
  const { data } = await apiClient.get('/messages');
  return data.data;
};

export const createMessage = async ({ username, message }) => {
  const { data } = await apiClient.post('/messages', { username, message });
  return data.data;
};

export default apiClient;
