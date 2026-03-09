import styled from 'styled-components';

const StyledCard = styled.article`
  width: 100%;
  gap: 12px;
  padding: 12px 16px;
  border-radius: 8px;
  background-color: var(--background-secondary);
  cursor: pointer;
  transition: background-color 0.2s ease, transform 0.2s ease;

  &:hover {
    background-color: var(--background-tertiary);
    transform: translateY(-1px);
  }

  img {
    width: 100%;
    max-height: 300px;
    object-fit: cover;
    border-radius: 4px 4px 0 0;
    flex-shrink: 0;
    filter: grayscale(90%);
  }

  .content {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  h2 {
    margin: 0;
    font-family: var(--title-font);
    font-weight: bold;
  }

`;

function PostCard({ photo, title, description, date, onClick }) {
  return (
    <StyledCard onClick={onClick}>
      {photo && <img src={photo} alt={title} />}
      <div className="content">
        <h2>{title}</h2>
        {date && <small>{date}</small>}
        {description && <p>{description}</p>}
      </div>
    </StyledCard>
  );
}

export default PostCard;