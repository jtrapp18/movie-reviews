import StarRatings from 'react-star-ratings';

const Stars = ({rating, handleStarClick}) => {

  return (
    <StarRatings
      rating={rating}
      starRatedColor="var(--dark-chocolate)"
      changeRating={(newRating) => handleStarClick(newRating)}
      numberOfStars={5}
      starDimension="1.5rem"
      starSpacing=".1rem"
    />
  );
};

export default Stars;