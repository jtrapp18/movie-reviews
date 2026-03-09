import { MediaCard, CardContent, CardOverlay, CardTitle } from "../styles/cards";
import MotionWrapper from "../styles/MotionWrapper";

const FALLBACK_PHOTO = "https://via.placeholder.com/300x450.png?text=Director";
const MAX_BIO_LENGTH = 140;

function DirectorCard({ director, index = 0, onClick = () => {}, variant = "default" }) {
  const { name, coverPhoto, biography } = director;

  const getShortBio = (bio) => {
    if (!bio) return "Director biography coming soon.";
    return bio.length > MAX_BIO_LENGTH ? `${bio.slice(0, MAX_BIO_LENGTH)}…` : bio;
  };

  if (variant === "detail") {
    return (
      <MotionWrapper index={index}>
        <MediaCard onClick={onClick} style={{ display: 'flex', alignItems: 'stretch' }}>
          <img
            src={coverPhoto || FALLBACK_PHOTO}
            alt={`Photo of ${name}`}
            style={{
              width: '140px',
              height: '100%',
              objectFit: 'cover',
              flexShrink: 0,
            }}
          />
          <CardContent style={{ textAlign: 'left', flex: 1 }}>
            <CardTitle>{name}</CardTitle>
            <p style={{ marginTop: '0.35rem', color: 'var(--font-color-2)', fontSize: '0.95rem' }}>
              {getShortBio(biography)}
            </p>
          </CardContent>
        </MediaCard>
      </MotionWrapper>
    );
  }

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

export default DirectorCard;