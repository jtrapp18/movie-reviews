import { useNavigate, useOutletContext } from "react-router-dom";
import { MediaCard, CardContent, CardOverlay, CardDate, CardTitle } from "../styles/cards";
import { useAdmin } from "../hooks/useAdmin";
import useCrudStateDB from "../hooks/useCrudStateDB";
import StarRatingOverlay from "../components/StarRatingOverlay";
import styled from "styled-components";

const MetadataContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

function MovieCard({ movie, rating = null, clickable = true, size = "default" }) {
  const {
    originalLanguage,
    originalTitle,
    overview,
    title,
    releaseDate,
    coverPhoto,
  } = movie;

  const navigate = useNavigate();
  const { setMovies } = useOutletContext();
  const { isAdmin } = useAdmin();

  const handleClick = async () => {
    if (rating) {
      navigate(`/movies/${movie.id}`);
      return;
    }

    if (!isAdmin) {
      alert(`No reviews available for "${title}".`);
      return;
    }

    const confirmed = window.confirm(
      `Do you want to add a review for "${title}"?`
    );
    if (confirmed) {
      const { addItem } = useCrudStateDB(setMovies, "movies");
      const newId = await addItem({ ...movie });
      navigate(`/movies/${newId}`);
    }
  };

  const cardStyle =
    size === "small"
      ? { zoom: 0.7 }
      : undefined;

  return (
    <MediaCard
      onClick={clickable ? handleClick : undefined}
      style={cardStyle}
    >
      <img src={coverPhoto} alt={`${title} poster`} />

      <CardDate>{releaseDate}</CardDate>

      <CardContent>
        <CardTitle>
          {title}
          {rating && <StarRatingOverlay rating={rating} />}
        </CardTitle>
      </CardContent>

      <CardOverlay>
        <MetadataContainer>
          <p><b>Original Title:</b> {originalTitle}</p>
          <p><b>Original Language:</b> {originalLanguage}</p>
        </MetadataContainer>
        <p>{overview || "No overview available"}</p>
      </CardOverlay>
    </MediaCard>
  );
}

export default MovieCard;