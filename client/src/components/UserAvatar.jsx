import { useContext } from 'react';
import styled from 'styled-components';
import { FaUserAlt } from 'react-icons/fa';
import { UserContext } from '../context/userProvider';

const Bubble = styled.span` 
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.25em;
  height: 1.25em;
  border-radius: 50%;
  background-color: ${(p) => p.$color ?? 'var(--font-color-3)'};
  color: var(--soft-white);
  font-size: clamp(1.1rem, 1.2rem, 1.8rem);
  font-weight: 600;
  text-transform: uppercase;
  flex-shrink: 0;
  padding: 1rem;
`;

const IconWrap = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 1em;
`;

const DEFAULT_ICON_COLOR = '#6b7280';

/**
 * Shows a bubble with the first letter of the username when logged in,
 * or a person icon when not logged in. Use in nav/header for account area.
 */
function UserAvatar() {
  const { user } = useContext(UserContext);
  if (user?.username) {
    const letter = user.username.trim().charAt(0) || '?';
    const color = user.iconColor ?? DEFAULT_ICON_COLOR;
    return <Bubble $color={color} aria-hidden>{letter}</Bubble>;
  }
  return (
    <IconWrap aria-hidden>
      <FaUserAlt />
    </IconWrap>
  );
}

export default UserAvatar;
