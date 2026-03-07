import React from 'react';
import { CardContainer } from '../styles';
import Carousel from './Carousel';
import Loading from './ui/Loading';
import DirectorCard from '../cards/DirectorCard';

function Directors({ directors }) {
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
            onClick={undefined} // easy to wire up later (e.g., filter by director or open director page)
          />
        ))}
      </Carousel>
    </CardContainer>
  );
}

export default Directors;

