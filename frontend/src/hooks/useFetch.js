import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

// Generic data fetching hook with pagination support
export const useFetch = (endpoint, params = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const query = new URLSearchParams(
        Object.fromEntries(Object.entries(params).filter(([, v]) => v !== '' && v !== undefined))
      );
      const res = await api.get(`${endpoint}?${query}`);
      setData(res.data);
    } catch (err) {
      setError(err.error || err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }, [endpoint, JSON.stringify(params)]); // eslint-disable-line

  useEffect(() => { fetch(); }, [fetch]);

  return { data, loading, error, refetch: fetch };
};

// Hook for paginated lists
export const usePaginatedList = (endpoint, extraParams = {}) => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const limit = 15;

  const { data, loading, error, refetch } = useFetch(endpoint, {
    page, limit, search, ...extraParams
  });

  const handleSearch = (val) => { setSearch(val); setPage(1); };

  return {
    items: data?.drugs || data?.patients || data?.prescriptions || data?.bills || [],
    total: data?.total || 0,
    pages: data?.pages || 1,
    page, setPage,
    search, setSearch: handleSearch,
    loading, error, refetch,
  };
};
