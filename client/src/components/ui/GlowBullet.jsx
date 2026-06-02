import styled, { css } from 'styled-components';

const DotElement = styled.span`
  user-select: none;

  ${(p) =>
    p.$variant === 'column'
      ? css`
          display: block;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          flex-shrink: 0;

          /*
            The High-End Subtle Glow Formula:
            - 0% to 12%: Keeps your perfect, tiny solid Navy core size.
            - 12% to 35%: Dropped electric blue opacity from 0.42 to a subtle 0.18.
            - 35% to 65%: Softened atmospheric aura down to an elegant 0.05.
            - 65% to 85%: Cleaned up transition margin with a micro 0.01 threshold.
            - 100%: Melts perfectly into pure white transparency.
          */
          background: radial-gradient(
            circle at center,
            var(--font-color-1) 0%,
            var(--font-color-1) 12%,
            rgba(0, 110, 255, 0.18) 35%,
            rgba(10, 37, 64, 0.05) 65%,
            rgba(10, 37, 64, 0.01) 85%,
            transparent 100%
          );

          transform: translateZ(0);
        `
      : css`
          color: var(--font-color-2);
          opacity: 0.92;
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
 * Typographic bullet or UI dot indicator.
 * - `inline` (default): sits as a text character • in running text.
 * - `column`: left rail — sharp CSS circle layout matching the timeline style.
 */
export default function GlowBullet({ char = BULLET, variant = 'inline', className, ...rest }) {
  return (
    <DotElement className={className} $variant={variant} aria-hidden {...rest}>
      {/* Hide the text character entirely if it is a structural column dot */}
      {variant === 'column' ? null : char}
    </DotElement>
  );
}
