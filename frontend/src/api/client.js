import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL

const client = axios.create({
  baseURL: API_URL,
});

// Injecte automatiquement le token JWT dans chaque requête
client.interceptors.request.use((config) => {
  const token = window.__candidia_token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default client;