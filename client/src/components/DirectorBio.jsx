import { StyledContainer } from '../styles';
import styled from 'styled-components';


const Image = styled.img`
    width: 100%;
    height: 200px;
    object-fit: cover;
    filter: grayscale(80%);
`

const Info = styled.div`
 display: flex;
`

function DirectorBio({director}) {
  const { name, coverPhoto, backdrop, biography } = director;
  const imageSrc = backdrop || coverPhoto;


  return (
    <StyledContainer>
        <Image
            src={imageSrc}
        />
        <Info>
            <h1>{name}</h1>
            {biography && (
                <p style={{ maxWidth: '800px', textAlign: 'justify' }}>
                {biography}
                </p>
            )}
        </Info>
    </StyledContainer>
  );
}

export default DirectorBio;