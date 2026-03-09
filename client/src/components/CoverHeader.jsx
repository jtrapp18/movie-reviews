import styled from 'styled-components';

const Wrapper = styled.div`
  width: 100%;
  margin: 1rem 0 1.5rem 0;
`;

const CoverImage = styled.img`
  width: 100%;
  max-height: 320px;
  object-fit: cover;
  filter: grayscale(80%);
  // border-radius: 8px;
  
  @media (max-width: 768px) {
    width: 100vw;
    margin-left: 50%;
    transform: translateX(-50%);
  }
`;

const Title = styled.h1`
  margin: 0.75rem 0 0 0;
  // font-size: clamp(1.6rem, 3vw, 2.1rem);
  text-align: left;
`;

function CoverHeader({ imageUrl, title }) {
  if (!imageUrl && !title) return null;

  return (
    <Wrapper>
      {imageUrl && <CoverImage src={imageUrl} alt={title || 'cover image'} />}
      {title && <Title>{title}</Title>}
    </Wrapper>
  );
}

export default CoverHeader;

