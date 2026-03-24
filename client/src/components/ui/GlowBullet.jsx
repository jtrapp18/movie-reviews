import styled, { css } from 'styled-components';

const Char = styled.span`
  user-select: none;
  color: var(--font-color-2);
  opacity: 0.92;

  ${(p) =>
    p.$variant === 'column'
      ? css`
          display: block;
          width: 100%;
          text-align: center;
          font-size: 1.2em;
          line-height: 1.2;
          margin: 0;
          padding-top: 0.08em;
        `
      : css`
          display: inline;
          font-size: inherit;
          line-height: inherit;
          font-weight: inherit;
          font-family: inherit;
          vertical-align: baseline;
          margin-right: 0.35em;
        `}
`;

const BULLET = '\u2022';

/**
 * Typographic bullet (U+2022 •).
 * - `inline` (default): sits in running text.
 * - `column`: left rail — larger dot, aligned in its own narrow column beside body text.
 */
function GlowBullet({ char = BULLET, variant = 'inline', className, ...rest }) {
  return (
    <Char className={className} $variant={variant} aria-hidden {...rest}>
      {char}
    </Char>
  );
}

export default GlowBullet;
