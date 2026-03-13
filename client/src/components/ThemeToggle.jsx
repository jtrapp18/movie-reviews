import styled from 'styled-components';
import { FaSun, FaMoon } from 'react-icons/fa6';
import { useTheme } from '../context/themeProvider';

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
  const { theme, toggleTheme } = useTheme();

  return (
    <FloatingToggle
      type="button"
      onClick={toggleTheme}
      aria-label="Toggle color theme"
    >
      {theme === 'dark' ? <FaMoon /> : <FaSun />}
    </FloatingToggle>
  );
}

