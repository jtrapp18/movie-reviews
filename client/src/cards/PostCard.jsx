import styled from 'styled-components';

const StyledCard = styled.article`
  // display: flex;
  width: 100%;
  gap: 12px;
  padding: 12px 16px;
  border-radius: 8px;
  background-color: rgba(0, 0, 0, 0.4);
  // border: 1px solid var(--cinema-gold);
  cursor: pointer;
  transition: background-color 0.2s ease, transform 0.2s ease;

  &:hover {
    background-color: rgba(0, 0, 0, 0.6);
    transform: translateY(-1px);
  }

  img {
    // width: 80px;
    width: 100%;
    height: 120px;
    object-fit: cover;
    border-radius: 4px;
    flex-shrink: 0;
  }

  .content {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  h2 {
    margin: 0;
    font-size: 1.1rem;
  }

  small {
    font-size: 0.8rem;
    color: #ccc;
  }

  p {
    margin: 0;
    font-size: 0.9rem;
  }
`;

function PostCard({ photo, title, description, date, onClick }) {
  return (
    <StyledCard onClick={onClick}>
      {photo && <img src={photo} alt={title} />}
      <h2>{title}</h2>
      {date && <small>{date}</small>}
      {description && <p>{description}</p>}
    </StyledCard>
  );
}

export default PostCard;