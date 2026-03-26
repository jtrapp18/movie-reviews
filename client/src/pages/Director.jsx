import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import { StyledContainer, Button } from '@styles';
import { patchJSONToDb } from '@helper';
import SEOHead from '@components/sections/SEOHead';
import Loading from '@components/ui/Loading';
import { DirectorBio, DirectorTimeline } from '@features/directors';
import { useDirector } from '@features/directors/useDirector';
import { useAdmin } from '@hooks/useAdmin';
import BackdropUpload from '@components/forms/BackdropUpload';

const DirectorSection = styled.div`
  width: 100%;
  background: var(--background-secondary);
  border-radius: 8px;
  overflow: hidden;
`;

const MoviesSection = styled.div`
  width: 100%;
  padding: 16px 20px 20px;
`;

const MoviesHeader = styled.h2`
  margin-top: 0;
  margin-bottom: 1rem;
`;

function Director() {
  const { id } = useParams();
  const { director, loading, error, setDirector } = useDirector(id);
  const [movies, setMovies] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [bioDraft, setBioDraft] = useState('');
  const [saving, setSaving] = useState(false);
  const { isAdmin } = useAdmin();

  // Sync movies and bio when director changes
  useEffect(() => {
    if (!director) return;
    setMovies(director.movies || []);
    setBioDraft(director.biography || '');
  }, [director]);

  if (loading) {
    return (
      <StyledContainer>
        <Loading text="Loading director" size="large" />
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
          <DirectorSection>
            <DirectorBio
              director={director}
              isAdmin={isAdmin}
              onEdit={handleStartEdit}
            />
            <MoviesSection>
              <MoviesHeader>Movies by {director.name}</MoviesHeader>
              <DirectorTimeline movies={movies} />
            </MoviesSection>
          </DirectorSection>
        )}

        {isEditing && isAdmin && (
          <div style={{ marginTop: '1rem', width: '100%' }}>
            <h1>{director.name}</h1>

            <div style={{ marginTop: '0.5rem' }}>
              <label>
                <strong>Cover / backdrop image</strong>
              </label>
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

            <div
              style={{
                marginTop: '1rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
              }}
            >
              <label htmlFor="director-bio">
                <strong>Biography</strong>
              </label>
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
      </StyledContainer>
    </>
  );
}

export default Director;
