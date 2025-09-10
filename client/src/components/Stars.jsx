import StarRatings from 'react-star-ratings';

const Stars = ({rating, handleStarClick}) => {

  return (
    <StarRatings
      rating={rating}
      starRatedColor="var(--cinema-gold)"
      starHoverColor="var(--cinema-gold-dark)"
      changeRating={(newRating) => handleStarClick(newRating)}
      numberOfStars={5}
      starDimension="1.5rem"
      starSpacing=".1rem"
    />
  );
};

export default Stars;