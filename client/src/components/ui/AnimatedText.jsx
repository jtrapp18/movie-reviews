import styled from 'styled-components';

const TextContainer = styled.div`
  display: ${(props) => (props.size ? 'flex' : 'inline-flex')};
  flex-direction: row;
  align-items: center;
  justify-content: center;
  padding: ${(props) => {
    if (!props.size) return '0';
    if (props.size === 'small') return '10px';
    if (props.size === 'large') return '60px';
    return props.compact ? '20px' : '40px';
  }};
  text-align: ${(props) => (props.size ? 'center' : 'inherit')};

  & p {
    font-size: ${(props) => {
      if (!props.size) return 'inherit';
      if (props.size === 'small') return 'var(--default-font-size)';
      if (props.size === 'large') return '20px';
      return props.compact ? '16px' : 'clamp(1.7rem, 4vw, 2rem)';
    }};
    margin: 0;
    /* Keep label + dots one horizontal band; avoids dots stacking per line on narrow viewports */
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
    column-gap: 0;
  }

  & .dots {
    display: inline-flex;
    flex-direction: row;
    flex-wrap: nowrap;
    align-items: center;
    color: inherit;
    font-size: inherit;
    white-space: nowrap;
    margin-left: ${(props) => {
      if (!props.size) return '0.2em';
      return props.size === 'small' ? '4px' : '8px';
    }};
  }

  & .dot {
    font-size: inherit;
    color: inherit;
    flex: none;
    opacity: 0;
    animation: dotAnimation 1.5s forwards;
    animation-timing-function: ease-in-out;
    animation-iteration-count: infinite;
  }

  /* Define the animation to make dots appear one after another */
  @keyframes dotAnimation {
    0% {
      opacity: 0;
    }
    50% {
      opacity: 1;
    }
    100% {
      opacity: 0;
    }
  }

  /* Delay the animation of each dot */
  .dot:nth-child(1) {
    animation-delay: 0.2s;
  }

  .dot:nth-child(2) {
    animation-delay: 0.4s;
  }

  .dot:nth-child(3) {
    animation-delay: 0.6s;
  }
`;

const AnimatedText = ({
  text = 'Loading',
  compact = false,
  size, // Omit for inherited inline sizing; use small/medium/large for explicit sizing.
  showDots = true, // Always show dots by default
  className = '',
}) => {
  return (
    <TextContainer compact={compact} size={size} className={className}>
      <p>
        <strong>{text}</strong>
        {showDots && (
          <span className="dots">
            <span className="dot">.</span>
            <span className="dot">.</span>
            <span className="dot">.</span>
          </span>
        )}
      </p>
    </TextContainer>
  );
};

export default AnimatedText;
