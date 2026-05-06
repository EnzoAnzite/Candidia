import axios from 'axios';

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001',
});

// Injecte automatiquement le token JWT dans chaque requête
client.interceptors.request.use((config) => {
  const token = window.__candidia_token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default client;