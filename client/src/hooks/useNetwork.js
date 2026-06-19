import { useState, useEffect } from 'react';
import { getNetwork } from '../services/api';

/**
 * Custom hook to fetch and manage the static subway network topology.
 * It retrieves the list of stations and lines, and computes individual segments.
 * 
 * @returns {object} The network state:
 *  - stations: Array of all stations in the network.
 *  - lines: Array of all lines in the network.
 *  - segments: Array of all contiguous line segments connecting stations.
 *  - loading: Boolean indicating if the network is currently being fetched.
 *  - error: Error object if the fetch failed.
 *  - refresh: Function to manually refetch the network data.
 */
export function useNetwork() {
  const [stations, setStations] = useState([]);
  const [lines, setLines] = useState([]);
  const [segments, setSegments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchNetwork = async () => {
    try {
      setLoading(true);
      const { stations: s, lines: l } = await getNetwork();
      setStations(s);
      setLines(l);
      // Derive segments from consecutive stations on each line
      const segs = [];
      for (const line of l) {
        const sorted = [...line.stations].sort((a, b) => a.position - b.position);
        for (let i = 0; i < sorted.length - 1; i++) {
          segs.push({
            s1_id: sorted[i].id,   s1_name: sorted[i].name,
            s2_id: sorted[i+1].id, s2_name: sorted[i+1].name,
            line_id: line.id,      line_name: line.name
          });
        }
      }
      setSegments(segs);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    Promise.resolve().then(() => {
      fetchNetwork();
    });
  }, []);

  return { stations, lines, segments, loading, error, refresh: fetchNetwork };
}
