import styled from 'styled-components';
import { FaSun, FaMoon } from 'react-icons/fa6';
import { useTheme } from '@context/themeProvider';
import { useContext } from 'react';
import { UserContext } from '@context/userProvider';
import { patchJSONToDb } from '@helper';

const FloatingToggle = styled.button`
  position: fixed;
  right: 1.25rem;
  bottom: 1.25rem;
  z-index: 1000;
  border: none;
  background: transparent;
  color: var(--font-color-2);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;

  svg {
    width: 20px;
    height: 20px;
    transition: transform 0.15s ease, color 0.15s ease;
  }

  &:hover svg {
    transform: scale(1.05);
    color: var(--primary);
  }
`;

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const { user, setUser } = useContext(UserContext);

  const handleClick = async () => {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);

    if (user) {
      const nextDarkMode = next === 'dark';
      try {
        const updated = await patchJSONToDb('users', user.id, { darkMode: nextDarkMode });
        // updated is snake_case from API; we only care to keep local user in sync
        setUser({
          ...user,
          darkMode: nextDarkMode,
        });
      } catch (err) {
        console.error('Failed to persist theme preference:', err);
      }
    }
  };

  return (
    <FloatingToggle
      type="button"
      onClick={handleClick}
      aria-label="Toggle color theme"
    >
      {theme === 'dark' ? <FaMoon /> : <FaSun />}
    </FloatingToggle>
  );
}

