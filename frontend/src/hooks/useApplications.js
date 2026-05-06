import { useState, useEffect, useCallback } from 'react';
import client from '../api/client.js';

export function useApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading]           = useState(false);
  const [syncing, setSyncing]           = useState(false);
  const [error, setError]               = useState(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await client.get('/api/applications');
      setApplications(data);
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur de chargement.');
    } finally {
      setLoading(false);
    }
  }, []);

  const create = async (payload) => {
    const { data } = await client.post('/api/applications', payload);
    setApplications(prev => [data, ...prev]);
    return data;
  };

  const update = async (id, payload) => {
    const { data } = await client.put(`/api/applications/${id}`, payload);
    setApplications(prev => prev.map(a => a.id === id ? data : a));
    return data;
  };

  const remove = async (id) => {
    await client.delete(`/api/applications/${id}`);
    setApplications(prev => prev.filter(a => a.id !== id));
  };

  const sync = async () => {
    setSyncing(true);
    try {
      const { data } = await client.post('/api/sync');
      await fetchAll(); // recharge après sync
      return data.stats;
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => { fetchAll(); }, [fetchAll]);

  return { applications, loading, syncing, error, create, update, remove, sync, refetch: fetchAll };
}