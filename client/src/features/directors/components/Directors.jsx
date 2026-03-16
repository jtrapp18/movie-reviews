import { useNavigate } from 'react-router-dom';
import { CardContainer } from '@styles';
import Carousel from '@components/shared-sections/Carousel';
import Loading from '@components/ui/Loading';
import DirectorCard from '@components/cards/DirectorCard';

function Directors({ directors }) {
  const navigate = useNavigate();
  if (!directors) {
    return (
      <CardContainer>
        <Loading text="Loading directors" compact={true} />
      </CardContainer>
    );
  }

  if (!Array.isArray(directors) || directors.length === 0) {
    return (
      <CardContainer>
        <p>No directors yet.</p>
      </CardContainer>
    );
  }

  return (
    <CardContainer>
      <Carousel noResultsMessage="No directors found">
        {directors.map((director, index) => (
          <DirectorCard
            key={director.id}
            director={director}
            index={index}
            onClick={() => navigate(`/directors/${director.id}`)}
          />
        ))}
      </Carousel>
    </CardContainer>
  );
}

export default Directors;
