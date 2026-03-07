import { MediaCard, CardContent, CardOverlay, CardTitle } from "../styles/cards";
import MotionWrapper from "../styles/MotionWrapper";
import styled from "styled-components";

const FALLBACK_PHOTO = "https://via.placeholder.com/300x450.png?text=Director";
const MAX_BIO_LENGTH = 140;

function DirectorCard({ director, index = 0, onClick = () => {} }) {
  const { name, coverPhoto, biography } = director;

  const getShortBio = (bio) => {
    if (!bio) return "Director biography coming soon.";
    return bio.length > MAX_BIO_LENGTH ? `${bio.slice(0, MAX_BIO_LENGTH)}…` : bio;
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

export default DirectorCard;