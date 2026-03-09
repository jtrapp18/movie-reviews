import { StyledContainer, Button } from '../styles';
import styled from 'styled-components';


const Image = styled.img`
  width: 100%;
  height: 220px;
  object-fit: cover;
  filter: grayscale(60%);
  border-radius: 8px 8px 0 0;
`;

const InfoShell = styled.div`
  width: 100%;
  background: var(--background-secondary);
  // border-radius: 0 0 8px 8px;
  padding: 16px 20px 12px;
  border-bottom: 1px solid var(--border);
`;

const Info = styled.div`
  display: grid;
  grid-template-columns: minmax(160px, 220px) minmax(0, 1fr);
  gap: 24px;
  align-items: center;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 12px;
  }
`;

const NameBlock = styled.div`
  text-align: left;

  h1 {
    margin: 0;
    font-size: clamp(1.6rem, 3vw, 2rem);
    text-align: left;
  }
`;

const BioColumn = styled.div`
  border-left: 1px solid var(--border);
  padding-left: 20px;

  @media (max-width: 768px) {
    border-left: none;
    padding-left: 0;
  }
`;

const BioText = styled.p`
  margin: 0;
  max-width: 800px;
  text-align: justify;
  line-height: 1.5;
`;

const ActionsRow = styled.div`
  margin-top: 0.75rem;
  width: 100%;
  display: flex;
  justify-content: flex-end;
`;

function DirectorBio({ director, isAdmin = false, onEdit = () => {} }) {
  const { id, name, coverPhoto, backdrop, biography } = director;
  const imageSrc = backdrop
    ? `/api/directors/${id}/backdrop/view?v=${encodeURIComponent(backdrop)}`
    : coverPhoto;


  return (
    <StyledContainer>
      <Image src={imageSrc} />
      <InfoShell>
        <Info>
          <NameBlock>
            <h1>{name}</h1>
          </NameBlock>
          <BioColumn>
            {biography && <BioText>{biography}</BioText>}
          </BioColumn>
        </Info>
        {isAdmin && (
          <ActionsRow>
            <Button onClick={onEdit}>Edit Director</Button>
          </ActionsRow>
        )}
      </InfoShell>
    </StyledContainer>
  );
}

export default DirectorBio;