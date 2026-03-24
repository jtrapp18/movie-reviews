import { useMemo, useState } from 'react';
import styled from 'styled-components';
import { useAdmin } from '@hooks/useAdmin';

const Wrap = styled.section`
  margin: 0.75rem 0 1rem;
  padding: 0.9rem;
  border: 1px solid var(--border);
  border-radius: 10px;
  background: var(--background-secondary);
`;

const Heading = styled.h3`
  margin: 0 0 0.5rem;
`;

const Sub = styled.p`
  margin: 0 0 0.75rem;
  color: var(--font-color-2);
`;

const Row = styled.div`
  display: flex;
  gap: 0.6rem;
  align-items: center;
  flex-wrap: wrap;
  margin-bottom: 0.7rem;
`;

const Btn = styled.button`
  padding: 0.45rem 0.75rem;
  border-radius: 8px;
  border: 1px solid var(--border);
  cursor: pointer;
  background: var(--background);
  color: var(--font-color);
`;

const DiffList = styled.ul`
  margin: 0.3rem 0 0.75rem;
  padding-left: 1rem;
`;

const Mono = styled.pre`
  margin: 0.5rem 0 0;
  max-height: 360px;
  overflow: auto;
  padding: 0.7rem;
  border-radius: 8px;
  background: rgba(0, 0, 0, 0.2);
  font-size: 0.8rem;
`;

function pretty(value) {
  if (value == null || value === '') return '(empty)';
  return String(value);
}

function MovieTmdbInspector({ movieId }) {
  const { isAdmin } = useAdmin();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [payload, setPayload] = useState(null);
  const [showRaw, setShowRaw] = useState(false);

  const changedFields = useMemo(
    () => payload?.changedFields || payload?.changed_fields || [],
    [payload]
  );

  if (!isAdmin || !movieId) return null;

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/movies/${movieId}/tmdb`, {
        credentials: 'include',
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || `TMDB request failed with ${res.status}`);
      }
      setPayload(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch TMDB details');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Wrap>
      <Heading>TMDB inspector</Heading>
      <Sub>Compare local movie data against live TMDB values before editing.</Sub>
      <Row>
        <Btn type="button" onClick={load} disabled={loading}>
          {loading ? 'Loading TMDB data...' : 'Fetch live TMDB data'}
        </Btn>
        {payload && (
          <Btn type="button" onClick={() => setShowRaw((prev) => !prev)}>
            {showRaw ? 'Hide raw TMDB JSON' : 'Show raw TMDB JSON'}
          </Btn>
        )}
      </Row>

      {error && <p>{error}</p>}

      {payload && (
        <>
          <p>
            <b>Detected differences:</b> {changedFields.length}
          </p>
          {changedFields.length > 0 && (
            <DiffList>
              {changedFields.map((item) => (
                <li key={item.field}>
                  <b>{item.field}</b>: local {pretty(item.local)} {'->'} TMDB{' '}
                  {pretty(item.tmdb)}
                </li>
              ))}
            </DiffList>
          )}
          {showRaw && <Mono>{JSON.stringify(payload, null, 2)}</Mono>}
        </>
      )}
    </Wrap>
  );
}

export default MovieTmdbInspector;
