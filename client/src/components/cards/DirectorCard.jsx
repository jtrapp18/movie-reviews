import { MediaCard, CardContent, CardOverlay, CardTitle } from '@styles/cards';
import MotionWrapper from '@styles/MotionWrapper';
import { Button } from '@styles';
import { Movies } from '@features/movies';
import styled from 'styled-components';
import { prefetchEntity } from '@features/cache/prefetchEntity';

const FALLBACK_PHOTO = 'https://via.placeholder.com/300x450.png?text=Director';
const MAX_BIO_LENGTH = 140;
const ACCORDION_BIO_LENGTH = 220;

const SummaryRow = styled.summary`
  list-style: none;
  display: flex;
  align-items: stretch;
  gap: 16px;
  cursor: pointer;
  user-select: none;

  &::-webkit-details-marker {
    display: none;
  }
`;

const AccordionBody = styled.div`
  display: block;
  overflow: hidden;
  max-height: 0;
  opacity: 0;
  transform: translateY(-6px);
  margin-top: 0;
  padding-top: 0;
  border-top: 1px solid transparent;

  transition:
    max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1),
    opacity 0.25s ease,
    transform 0.25s ease,
    margin-top 0.4s ease,
    padding-top 0.4s ease,
    border-color 0.4s ease;

  &.is-open {
    max-height: 2000px;
    opacity: 1;
    transform: translateY(0);
    margin-top: 8px;
    padding-top: 8px;
    border-top-color: var(--border-subtle, rgba(255, 255, 255, 0.06));
  }
`;

const AccordionDetails = styled.details`
  border-radius: 8px;
  padding: 8px 12px;
  background: var(--background-secondary);

  &:hover {
    transform: translateY(-1px);
    box-shadow: var(--shadow);
  }
`;

const Toggle = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;

  span {
    display: inline-block;
    transition: transform 0.25s ease;
    transform: ${(props) => (props.isExpanded ? 'rotate(180deg)' : 'rotate(0deg)')};
  }

  &:hover {
    font-weight: bold;
  }
`;

function SmallDirectorCard({ director, index = 0, onClick = () => {} }) {
  const { name, coverPhoto, biography } = director;

  const getShortBio = (bio, maxLen = MAX_BIO_LENGTH) => {
    if (!bio) return 'Director biography coming soon.';
    return bio.length > maxLen ? `${bio.slice(0, maxLen)}…` : bio;
  };

  return (
    <MotionWrapper index={index}>
      <MediaCard onClick={onClick}>
        <img src={coverPhoto || FALLBACK_PHOTO} alt={`Photo of ${name}`} />
        <CardContent>
          <CardTitle>{name}</CardTitle>
        </CardContent>

        <CardOverlay>
          <p>{getShortBio(biography)}</p>
        </CardOverlay>
      </MediaCard>
    </MotionWrapper>
  );
}

function DirectorCard({
  director,
  index = 0,
  onClick = () => {},
  variant = 'default',
  movies = [],
  isExpanded,
  onToggle,
  onViewPage,
}) {
  const { name, coverPhoto, biography } = director;

  const getShortBio = (bio, maxLen = MAX_BIO_LENGTH) => {
    if (!bio) return 'Director biography coming soon.';
    return bio.length > maxLen ? `${bio.slice(0, maxLen)}…` : bio;
  };

  if (variant === 'detail') {
    const shortBio = getShortBio(biography, ACCORDION_BIO_LENGTH);
    return (
      <MotionWrapper index={index}>
        <AccordionDetails open>
          <SummaryRow
            onClick={(e) => {
              e.preventDefault();
              onToggle?.(!isExpanded);
            }}
          >
            <div
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onViewPage?.();
              }}
              style={{ flexShrink: 0 }}
            >
              <SmallDirectorCard director={director} index={0} onClick={onViewPage} />
            </div>
            <div
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <p
                style={{
                  margin: 0,
                  color: 'var(--font-color-2)',
                  fontSize: '0.95rem',
                }}
              >
                {shortBio}
              </p>
              <div
                style={{
                  marginTop: '0.5rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '0.5rem',
                  flexWrap: 'wrap',
                }}
              >
                <Toggle isExpanded={isExpanded}>
                  {isExpanded ? 'Hide movies' : 'Show movies'}
                  <span>{isExpanded ? '▲' : '▼'}</span>
                </Toggle>
                <Button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onViewPage?.();
                  }}
                >
                  View page
                </Button>
              </div>
            </div>
          </SummaryRow>

          <AccordionBody className={isExpanded ? 'is-open' : ''}>
            <hr />
            <h3 style={{ marginBottom: '0.75rem' }}>Reviews for Movies by {name}</h3>
            <Movies showMovies={movies} cardSize="small" />
          </AccordionBody>
        </AccordionDetails>
      </MotionWrapper>
    );
  }

  return (
    <MotionWrapper index={index}>
      <MediaCard
        onClick={onClick}
        onMouseEnter={() => {
          if (director?.id != null) {
            prefetchEntity('director', 'directors', director.id);
          }
        }}
      >
        <img src={coverPhoto || FALLBACK_PHOTO} alt={`Photo of ${name}`} />
        <CardContent>
          <CardTitle>{name}</CardTitle>
        </CardContent>

        <CardOverlay>
          <p>{getShortBio(biography)}</p>
        </CardOverlay>
      </MediaCard>
    </MotionWrapper>
  );
}

export default DirectorCard;
