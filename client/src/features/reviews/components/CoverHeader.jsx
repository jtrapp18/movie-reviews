import styled from 'styled-components';
import Stars from './Stars';

const Wrapper = styled.div`
  width: 100%;
`;

const ImageWrapper = styled.div`
  position: relative;
  width: 100%;
  height: 350px;
  max-height: 100vh;
  overflow: hidden;
  border-radius: 8px 8px 0 0;
  background: #000;

  @media (max-width: 768px) {
    width: 100vw;
    border-radius: 0;
    margin-left: 50%;
    transform: translateX(-50%);
  }
`;

const CoverImage = styled.img`
  width: 100%;
  max-height: 500px;
  object-fit: cover;
  filter: grayscale(80%);
`;

const Overlay = styled.div`
  position: absolute;
  inset: 0;
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0.25), rgba(0, 0, 0, 0.75));
  display: flex;
  align-items: flex-end;
  justify-content: center;
  box-sizing: border-box;
`;

const OverlayContent = styled.div`
  max-width: 960px;
  width: 100%;
  text-align: center;
`;

const Title = styled.h1`
  margin: 0 0 0.25rem 0;
  color: var(--soft-white);
  text-shadow: 0 2px 6px rgba(0, 0, 0, 0.6);
`;

const Subtitle = styled.h2`
  margin: 0 0 0.5rem 0;
  color: var(--soft-white);
  font-weight: 500;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.6);
`;

const StarsWrapper = styled.div`
  display: flex;
  justify-content: center;
`;

const PublishDate = styled.span`
  color: var(--soft-white);
`;

function CoverHeader({ imageUrl, title, subtitle, rating, publishDate }) {
  if (!imageUrl && !title && !subtitle) return null;

  const hasRating = typeof rating === 'number' && rating > 0;
  const formattedDate = publishDate
    ? new Date(publishDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : null;

  // If we have an image, render the full hero with overlayed text
  if (imageUrl) {
    return (
      <Wrapper>
        <ImageWrapper>
          <CoverImage src={imageUrl} alt={title || subtitle || 'cover image'} />
          <Overlay>
            <OverlayContent>
              {title && <Title>{title}</Title>}
              {subtitle && <Subtitle>{subtitle}</Subtitle>}
              {hasRating && (
                <StarsWrapper>
                  <Stars rating={rating} />
                </StarsWrapper>
              )}
              {formattedDate && <PublishDate>Published on {formattedDate}</PublishDate>}
            </OverlayContent>
          </Overlay>
        </ImageWrapper>
      </Wrapper>
    );
  }

  // No image: black background with title/subtitle (never substitute with regular movie image)
  return (
    <Wrapper>
      <ImageWrapper style={{ minHeight: '200px' }}>
        <Overlay>
          <OverlayContent>
            {title && <Title>{title}</Title>}
            {subtitle && <Subtitle>{subtitle}</Subtitle>}
            {hasRating && (
              <StarsWrapper>
                <Stars rating={rating} />
              </StarsWrapper>
            )}
            {formattedDate && <PublishDate>Published on {formattedDate}</PublishDate>}
          </OverlayContent>
        </Overlay>
      </ImageWrapper>
    </Wrapper>
  );
}

export default CoverHeader;
