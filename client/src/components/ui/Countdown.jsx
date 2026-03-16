import { useEffect, useRef } from 'react';
import styled from 'styled-components';

const TenorEmbedWrap = styled.div`
  width: 100%;
  max-width: 500px;
  margin-bottom: 1rem;

  iframe {
    width: 100%;
    border: none;
  }
`;

const TENOR_POST_ID = '12190256';

function Countdown() {
  const wrapRef = useRef(null);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://tenor.com/embed.js';
    script.async = true;

    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <TenorEmbedWrap ref={wrapRef}>
      <div
        className="tenor-gif-embed"
        data-postid={TENOR_POST_ID}
        data-share-method="host"
        data-aspect-ratio="1.776"
        data-width="100%"
      />
    </TenorEmbedWrap>
  );
}

export default Countdown;
