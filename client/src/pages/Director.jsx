import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { StyledContainer, Button } from '../styles';
import { getJSON, patchJSONToDb } from '../helper';
import SEOHead from '../components/SEOHead';
import Loading from '../components/ui/Loading';
import DirectorBio from '../components/DirectorBio';
import MoviesGrid from '../components/MoviesGrid';
import { useAdmin } from '../hooks/useAdmin';
import BackdropUpload from '../components/BackdropUpload';

function Director() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [director, setDirector] = useState(null);
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [bioDraft, setBioDraft] = useState('');
  const [saving, setSaving] = useState(false);
  const { isAdmin } = useAdmin();

  useEffect(() => {
    const fetchDirector = async () => {
      try {
        setLoading(true);
        const data = await getJSON('directors', id);
        if (data && !data.error) {
          setDirector(data);
          setMovies(data.movies || []);
          setBioDraft(data.biography || '');
        } else {
          setError(data?.error || 'Director not found');
        }
      } catch (err) {
        console.error('Error fetching director:', err);
        setError('Failed to load director details');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchDirector();
    }
  }, [id]);

  if (loading) {
    return (
      <StyledContainer>
        <Loading text="Loading director" compact={true} />
      </StyledContainer>
    );
  }

  if (error) {
    return (
      <StyledContainer>
        <h1>Error: {error}</h1>
      </StyledContainer>
    );
  }

  if (!director) {
    return (
      <StyledContainer>
        <h1>Director not found</h1>
      </StyledContainer>
    );
  }

  const handleMovieClick = (movie) => {
    if (movie && movie.id) {
      navigate(`/movies/${movie.id}`);
    }
  };

  const handleStartEdit = () => {
    setBioDraft(director.biography || '');
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setBioDraft(director.biography || '');
    setIsEditing(false);
  };

  const handleSaveEdit = async () => {
    try {
      setSaving(true);
      const updated = await patchJSONToDb('directors', director.id, {
        biography: bioDraft,
      });
      setDirector(updated);
      setIsEditing(false);
    } catch (err) {
      console.error('Error updating director:', err);
      // Keep edit mode open; user can retry
    } finally {
      setSaving(false);
    }
  };

  const pageTitle = `${director.name} - Director`;
  const pageDescription =
    director.biography && director.biography.length > 150
      ? `${director.biography.slice(0, 150)}…`
      : director.biography || `Films directed by ${director.name}.`;

  return (
    <>
      <SEOHead
        title={pageTitle}
        description={pageDescription}
        keywords={`${director.name}, film director, movies by ${director.name}`}
        image={director.coverPhoto}
        url={`/#/directors/${director.id}`}
        type="profile"
        structuredData={null}
      />
      <StyledContainer>
        {!isEditing && (
          <>
            <DirectorBio director={director} />
            {isAdmin && (
              <div style={{ marginTop: '0.75rem', width: '100%', textAlign: 'right' }}>
                <Button onClick={handleStartEdit}>
                  Edit Director
                </Button>
              </div>
            )}
          </>
        )}

        {isEditing && isAdmin && (
          <div style={{ marginTop: '1rem', width: '100%' }}>
            <h1>{director.name}</h1>

            <div style={{ marginTop: '0.5rem' }}>
              <label><strong>Cover / backdrop image</strong></label>
              <BackdropUpload
                uploadUrl={`/api/directors/${director.id}/backdrop`}
                currentUrl={
                  director.backdrop
                    ? `/api/directors/${director.id}/backdrop/view?v=${encodeURIComponent(
                        director.backdrop
                      )}`
                    : null
                }
                onUploaded={(url) =>
                  setDirector((prev) => ({ ...prev, backdrop: url }))
                }
              />
            </div>

            <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label htmlFor="director-bio"><strong>Biography</strong></label>
              <textarea
                id="director-bio"
                value={bioDraft}
                onChange={(e) => setBioDraft(e.target.value)}
                rows={8}
                style={{ width: '100%', padding: '8px' }}
              />
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <Button onClick={handleSaveEdit} disabled={saving}>
                  {saving ? 'Saving...' : 'Save'}
                </Button>
                <Button onClick={handleCancelEdit} disabled={saving}>
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}

        <hr style={{ width: '100%', marginTop: '2rem', marginBottom: '1.5rem' }} />

        <h2 style={{ marginTop: 0, marginBottom: '1rem' }}>
          Movies by {director.name}
        </h2>
        <MoviesGrid
          movies={movies}
          onMovieClick={handleMovieClick}
        />
      </StyledContainer>
    </>
  );
}

export default Director;

