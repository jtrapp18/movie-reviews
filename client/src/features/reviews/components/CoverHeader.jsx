import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import Rating from './Rating';

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

const Pretitle = styled.p`
  margin: 0 0 0.35rem 0;
  color: var(--soft-white);
  font-style: italic;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.6);
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

const LinkedSubtitleHeading = styled.h4`
  margin: 0 0 0.5rem 0;
  color: var(--soft-white);
  font-weight: 600;
  line-height: 1.25;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.6);
`;

const LinkedSubtitle = styled.button`
  display: inline;
  color: inherit;
  font: inherit;
  text-shadow: inherit;
  margin: 0;
  padding: 0;
  border: 0;
  background: transparent;
  cursor: pointer;
  text-decoration: underline;
  text-decoration-color: transparent;
  transition: text-decoration-color 0.2s ease;

  &:hover {
    text-decoration-color: var(--soft-white);
  }
`;

const HoverHint = styled.span`
  margin-left: 0.4rem;
  color: inherit;
  opacity: 0;
  transition: opacity 0.2s ease;
`;

const LinkedSubtitleText = styled.span`
  color: inherit;
  font-size: inherit;
  &:hover ${HoverHint} {
    opacity: 0.9;
  }
`;

const RatingOverlayWrapper = styled.div`
  display: flex;
  justify-content: center;
`;

const PublishDate = styled.span`
  color: var(--soft-white);
`;

function CoverHeader({
  imageUrl,
  title,
  subtitle,
  pretitle,
  subtitleAsTitle = false,
  subtitleLink,
  rating,
  publishDate,
}) {
  const navigate = useNavigate();

  if (!imageUrl && !title && !subtitle && !pretitle) return null;

  const hasRating = typeof rating === 'number' && rating > 0;
  const formattedDate = publishDate
    ? new Date(publishDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : null;

  const renderSubtitle = () => {
    if (!subtitle) return null;
    if (subtitleLink) {
      return (
        <LinkedSubtitleHeading>
          <LinkedSubtitle
            type="button"
            title="Go to director page"
            onClick={() => navigate(subtitleLink)}
          >
            <LinkedSubtitleText>
              {subtitle}
            </LinkedSubtitleText>
          </LinkedSubtitle>
        </LinkedSubtitleHeading>
      );
    }
    return subtitleAsTitle ? <Title>{subtitle}</Title> : <Subtitle>{subtitle}</Subtitle>;
  };

  // If we have an image, render the full hero with overlayed text
  if (imageUrl) {
    return (
      <Wrapper>
        <ImageWrapper>
          <CoverImage src={imageUrl} alt={title || subtitle || 'cover image'} />
          <Overlay>
            <OverlayContent>
              {pretitle && <Pretitle>{pretitle}</Pretitle>}
              {title && <Title>{title}</Title>}
              {renderSubtitle()}
              {hasRating && (
                <RatingOverlayWrapper>
                  <Rating rating={rating} />
                </RatingOverlayWrapper>
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
            {pretitle && <Pretitle>{pretitle}</Pretitle>}
            {title && <Title>{title}</Title>}
            {renderSubtitle()}
            {hasRating && (
              <RatingOverlayWrapper>
                <Rating rating={rating} />
              </RatingOverlayWrapper>
            )}
            {formattedDate && <PublishDate>Published on {formattedDate}</PublishDate>}
          </OverlayContent>
        </Overlay>
      </ImageWrapper>
    </Wrapper>
  );
}

export default CoverHeader;
