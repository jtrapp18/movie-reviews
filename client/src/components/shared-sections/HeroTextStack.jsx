import styled, { css } from 'styled-components';

const Root = styled.div`
  width: 100%;
  text-align: center;

  ${({ $tone }) =>
    $tone === 'onPrimary' &&
    css`
      color: rgba(248, 249, 250, 0.96);
      text-shadow:
        0 2px 16px rgba(0, 0, 0, 0.35),
        0 1px 2px rgba(0, 0, 0, 0.28);
    `}
`;

// “Caps on top” eyebrow (hero-style)
const Eyebrow = styled.p`
  margin: 0 0 0.35rem 0;
  font-family: var(--default-font), system-ui, sans-serif;
  font-size: ${({ $size }) =>
    $size === 'hero' ? 'clamp(0.7rem, 1.65vw, 0.82rem)' : 'inherit'};
  font-weight: 500;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  line-height: 1.5;
  color: inherit;
  opacity: 0.85;
`;

const Title = styled.h1`
  margin: 0;
  color: inherit;
  ${({ $size }) =>
    $size === 'hero' &&
    css`
      font-family: var(--title-font), serif;
      font-size: clamp(2rem, 5vw, 3.2rem);
      font-weight: 600;
      line-height: 1.08;
    `}
`;

const Subtitle = styled.h2`
  margin: 0;
  color: inherit;
  font-weight: 500;
  ${({ $size }) =>
    $size === 'hero' &&
    css`
      font-family: var(--default-font), system-ui, sans-serif;
      font-size: clamp(0.7rem, 1.65vw, 0.82rem);
      font-weight: 500;
      letter-spacing: 0.16em;
      text-transform: uppercase;
      line-height: 1.5;
      opacity: 0.82;
    `}
`;

const Divider = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.65rem;
  width: min(100%, 22rem);
  margin: 0.7rem auto 0.95rem;
`;

const DividerLine = styled.span`
  flex: 1;
  height: 1px;
  max-width: 8rem;
  background: rgba(248, 249, 250, 0.72);
`;

const Diamond = styled.span`
  flex-shrink: 0;
  width: 0.35rem;
  height: 0.35rem;
  background: rgba(248, 249, 250, 0.8);
  transform: rotate(45deg);
`;

/**
 * Shared “hero-like” text stack:
 * caps eyebrow → title → divider → subtitle
 *
 * Font sizes are intentionally inherited from the surrounding context
 * (CoverHeader already defines the h1/h2 sizes).
 */
export default function HeroTextStack({
  eyebrow,
  title,
  subtitle,
  subtitleNode,
  showDivider = true,
  subtitleAsTitle = false,
  size = 'hero', // 'hero' | 'inherit'
  tone = 'onPrimary', // 'onPrimary' | 'inherit'
  children,
}) {
  if (!eyebrow && !title && !subtitle && !subtitleNode && !children) return null;

  return (
    <Root $tone={tone}>
      {eyebrow ? <Eyebrow $size={size}>{eyebrow}</Eyebrow> : null}
      {title ? <Title $size={size}>{title}</Title> : null}
      {showDivider && (title || subtitle || subtitleNode || children) ? (
        <Divider aria-hidden="true">
          <DividerLine />
          <Diamond />
          <DividerLine />
        </Divider>
      ) : null}
      {subtitleNode
        ? subtitleNode
        : subtitle
          ? subtitleAsTitle
            ? <Title as="h1" $size={size}>{subtitle}</Title>
            : <Subtitle $size={size}>{subtitle}</Subtitle>
          : null}
      {children ? (
        <div
          style={{
            marginTop: subtitle || subtitleNode ? '0.6rem' : '0',
          }}
        >
          {children}
        </div>
      ) : null}
    </Root>
  );
}
