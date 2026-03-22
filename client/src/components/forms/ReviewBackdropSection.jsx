import styled from 'styled-components';
import BackdropUpload from '@components/forms/BackdropUpload';

const Section = styled.div`
  margin: 16px 0 20px;
`;

const Heading = styled.label`
  display: block;
  margin-bottom: 8px;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  align-items: start;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const ReadOnlyFrame = styled.div`
  position: relative;
  width: 100%;
  padding-top: 40%;
  border-radius: 10px;
  overflow: hidden;
  border: 1px solid var(--border);
  background: radial-gradient(circle at top left, #222 0%, #111 40%, #050505 100%);

  ${({ $empty }) =>
    $empty &&
    `
    background: transparent;
    border-style: dashed;
  `}
`;

const ReadOnlyImg = styled.img`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: brightness(0.85);
`;

const Placeholder = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 12px;
  color: var(--font-color-2);
  font-size: 0.9rem;
`;

const OverlayLabel = styled.div`
  position: absolute;
  top: 8px;
  left: 12px;
  padding: 4px 10px;
  border-radius: 999px;
  background: var(--background-tertiary);
  font-size: 0.8rem;
  color: var(--font-color-2);
`;

const BlockTitle = styled.div`
  font-size: 0.9rem;
  font-weight: 600;
  margin-bottom: 4px;
`;

const Hint = styled.p`
  margin: 0 0 8px;
  font-size: 0.85rem;
  color: var(--font-color-2);
  line-height: 1.4;
`;

const CoverPreviewRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  margin: 12px 0 0;
`;

const CoverPreviewLabel = styled.span`
  font-size: 0.85rem;
  color: var(--font-color-2);
`;

const CoverPreviewBtn = styled.button`
  padding: 6px 14px;
  border-radius: 8px;
  border: 1px solid var(--border);
  cursor: pointer;
  font-size: 0.85rem;
  background: var(--background-secondary);
  color: var(--font-color);
  font-weight: ${({ $active }) => ($active ? 700 : 400)};
`;

/**
 * Movie backdrop (read-only) + review backdrop (upload/delete) + which one to show on the page.
 */
function ReviewBackdropSection({
  movieBackdropUrl,
  uploadUrl,
  backdropKey,
  showReviewBackdrop,
  onShowReviewBackdropChange,
  onUploaded,
  onReviewBackdropDeleted,
  reviewPersisted,
}) {
  const hasMovie = Boolean(movieBackdropUrl);
  const hasReview = Boolean(backdropKey);

  return (
    <Section>
      <Heading>Cover image</Heading>
      <Hint>
        The movie shows the catalog backdrop (read-only). Add your own review backdrop
        if you like. While editing, use Cover preview under the hero to compare images
        (temporary). Here, choose which one is used when the page is saved; after save,
        the hero matches that choice.
      </Hint>

      <Grid>
        <div>
          <BlockTitle>Movie backdrop</BlockTitle>
          <ReadOnlyFrame $empty={!hasMovie}>
            {hasMovie ? (
              <>
                <ReadOnlyImg src={movieBackdropUrl} alt="" />
                <OverlayLabel>From TMDb</OverlayLabel>
              </>
            ) : (
              <Placeholder>No movie backdrop on file</Placeholder>
            )}
          </ReadOnlyFrame>
        </div>

        <div>
          <BlockTitle>Review backdrop</BlockTitle>
          {reviewPersisted && uploadUrl ? (
            <BackdropUpload
              uploadUrl={uploadUrl}
              currentUrl={
                backdropKey
                  ? `${uploadUrl}/view?v=${encodeURIComponent(backdropKey)}`
                  : null
              }
              onUploaded={onUploaded}
              onDeleted={onReviewBackdropDeleted}
              allowDelete={Boolean(backdropKey)}
            />
          ) : (
            <ReadOnlyFrame $empty>
              <Placeholder>
                Save your review once to upload a custom backdrop here.
              </Placeholder>
            </ReadOnlyFrame>
          )}
        </div>
      </Grid>

      <CoverPreviewRow>
        <CoverPreviewLabel>Cover preview</CoverPreviewLabel>
        <CoverPreviewBtn
          type="button"
          $active={showReviewBackdrop}
          onClick={() => onShowReviewBackdropChange(true)}
        >
          Review
        </CoverPreviewBtn>
        <CoverPreviewBtn
          type="button"
          $active={!showReviewBackdrop}
          onClick={() => onShowReviewBackdropChange(false)}
        >
          Movie
        </CoverPreviewBtn>
      </CoverPreviewRow>
      {showReviewBackdrop && !hasReview && hasMovie && (
        <Hint style={{ marginTop: 8 }}>
          Preference is review, but none is uploaded yet — the movie backdrop shows
          until you add one.
        </Hint>
      )}
      {!showReviewBackdrop && !hasMovie && hasReview && (
        <Hint style={{ marginTop: 8 }}>
          Preference is movie, but this title has no movie backdrop — your review image
          will show.
        </Hint>
      )}
    </Section>
  );
}

export default ReviewBackdropSection;
