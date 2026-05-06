import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import client from '../api/client.js';

export default function AuthCallback() {
  const { login } = useAuth();
  const navigate  = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token  = params.get('token');
    const error  = params.get('error');

    if (error || !token) {
      navigate('/login');
      return;
    }

    // Stocke le token et récupère les infos utilisateur
    window.__candidia_token = token;
    client.get('/api/auth/me')
      .then(({ data }) => {
        login(token, data);
        navigate('/');
      })
      .catch(() => navigate('/login'));
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-stone-500 text-sm">Connexion en cours…</p>
    </div>
  );
}