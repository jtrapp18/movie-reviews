import Loading from '@components/ui/Loading';
import { StyledContainer } from '@styles';
import { EntityErrorMessage } from './detailPageStyles';

/**
 * Shared loading / error / missing guards for movie review, article, etc.
 * Keeps detail pages visually consistent without changing routing or data flow.
 */
function EntityDetailState({
  loading,
  loadingText,
  error,
  /** Optional override when `error` is a string but you want different copy */
  errorMessage,
  missing,
  missingMessage,
  children,
}) {
  if (loading) {
    return (
      <StyledContainer>
        <Loading text={loadingText} size="large" />
      </StyledContainer>
    );
  }

  if (error) {
    return (
      <StyledContainer>
        <EntityErrorMessage>{errorMessage ?? error}</EntityErrorMessage>
      </StyledContainer>
    );
  }

  if (missing) {
    return (
      <StyledContainer>
        <EntityErrorMessage>{missingMessage}</EntityErrorMessage>
      </StyledContainer>
    );
  }

  return children;
}

export default EntityDetailState;
