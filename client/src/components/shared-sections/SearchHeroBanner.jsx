import styled, { css } from 'styled-components';

const Root = styled.section`
  width: 100%;
  text-align: center;
  padding: 0.25rem 0 0;
`;

const Title = styled.p`
  margin: 0 0 0.35rem;
  font-family: var(--title-font), serif;
  font-size: clamp(2rem, 5vw, 3.2rem);
  font-weight: 600;
  line-height: 1.08;
  color: rgba(248, 249, 250, 0.96);
  text-shadow:
    0 2px 16px rgba(0, 0, 0, 0.35),
    0 1px 2px rgba(0, 0, 0, 0.28);
`;

const Subtitle = styled.p`
  margin: 0 0 1rem;
  font-family: var(--default-font), system-ui, sans-serif;
  font-size: clamp(0.7rem, 1.65vw, 0.82rem);
  font-weight: 500;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  line-height: 1.5;
  color: rgba(248, 249, 250, 0.78);
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
  background: rgba(255, 255, 255, 0.38);
`;

const Diamond = styled.span`
  flex-shrink: 0;
  width: 0.35rem;
  height: 0.35rem;
  background: rgba(255, 255, 255, 0.55);
  transform: rotate(45deg);
`;

const GroupWrap = styled.div`
  margin-top: 0.2rem;

  & + & {
    margin-top: 0.95rem;
  }
`;

const GroupLabel = styled.p`
  margin: 0.15rem 0 0.35rem;
  font-family: var(--default-font), system-ui, sans-serif;
  font-size: clamp(0.68rem, 1.45vw, 0.78rem);
  font-weight: 600;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: rgba(248, 249, 250, 0.55);
`;

const PillsRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 0.45rem;
  width: 100%;
  margin: 0;
  padding: 0 0 0.15rem;
`;

const Pill = styled.button`
  margin: 0;
  padding: 0.4rem 0.85rem;
  font-family: var(--default-font), system-ui, sans-serif;
  font-size: clamp(0.68rem, 1.5vw, 0.78rem);
  font-weight: 500;
  letter-spacing: 0.04em;
  border-radius: 9999px;
  cursor: pointer;
  transition:
    background 0.15s ease,
    color 0.15s ease,
    border-color 0.15s ease;
  border: 1px solid rgba(255, 255, 255, 0.22);

  ${({ $active }) =>
    $active
      ? css`
          background: rgba(248, 249, 250, 0.22);
          color: var(--soft-white);
          border-color: rgba(255, 255, 255, 0.35);
        `
      : css`
          background: rgba(12, 14, 18, 0.35);
          color: rgba(248, 249, 250, 0.92);
          border-color: rgba(255, 255, 255, 0.18);

          &:hover {
            background: rgba(248, 249, 250, 0.1);
            border-color: rgba(255, 255, 255, 0.28);
          }
        `}
`;

function SearchHeroBanner({
  title,
  subtitle,
  showDivider = true,
  buttonLabels = [],
  buttonGroups = [],
  activeButton = null,
  activeButtonsByGroup = {},
  onButtonClick,
}) {
  const normalizedGroups =
    Array.isArray(buttonGroups) && buttonGroups.length > 0
      ? buttonGroups
      : buttonLabels.length > 0
        ? [{ title: null, labels: buttonLabels }]
        : [];

  const isLabelActive = (groupTitle, label) => {
    if (
      groupTitle &&
      activeButtonsByGroup &&
      typeof activeButtonsByGroup === 'object'
    ) {
      const activeForGroup = activeButtonsByGroup[groupTitle];
      if (typeof activeForGroup === 'string') {
        return activeForGroup === label;
      }
    }
    return activeButton === label;
  };

  return (
    <Root>
      {title ? <Title>{title}</Title> : null}
      {showDivider && (title || subtitle) ? (
        <Divider aria-hidden="true">
          <DividerLine />
          <Diamond />
          <DividerLine />
        </Divider>
      ) : null}
      {subtitle ? <Subtitle>{subtitle}</Subtitle> : null}
      {normalizedGroups.map((group, groupIdx) => (
        <GroupWrap key={`${group.title || 'group'}-${groupIdx}`}>
          {group.title ? <GroupLabel>{group.title}</GroupLabel> : null}
          <PillsRow>
            {(group.labels || []).map((label) => (
              <Pill
                key={`${group.title || 'group'}-${label}`}
                type="button"
                $active={isLabelActive(group.title || null, label)}
                onClick={() => onButtonClick?.(label, group.title || null)}
              >
                {label}
              </Pill>
            ))}
          </PillsRow>
        </GroupWrap>
      ))}
    </Root>
  );
}

export default SearchHeroBanner;
