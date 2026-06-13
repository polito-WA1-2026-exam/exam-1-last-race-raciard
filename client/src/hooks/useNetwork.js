import { useState, useEffect } from 'react';
import api from '../services/api';

export function useNetwork() {
  const [stations, setStations] = useState([]);
  const [lines, setLines] = useState([]);
  const [segments, setSegments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchNetwork = async () => {
    try {
      setLoading(true);
      const [s, l, segs] = await Promise.all([
        api.get('/stations'),
        api.get('/lines'),
        api.get('/segments')
      ]);
      setStations(s);
      setLines(l);
      setSegments(segs);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNetwork();
  }, []);

  return { stations, lines, segments, loading, error, refresh: fetchNetwork };
}
