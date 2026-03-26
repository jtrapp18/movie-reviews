import { useContext, useState } from 'react';
import styled from 'styled-components';
import { StaticPageShell, StyledForm, Button } from '@styles';
import { UserContext } from '@context/userProvider';
import { patchJSONToDb, snakeToCamel } from '@helper';
import Error from '@styles/Error';
import LoginMessage from '@components/feedback/LoginMessage';
import { useTheme } from '@context/themeProvider';
import {
  StaticPageHeader,
  StaticPageSubtitle,
} from '@components/layout/staticPageStyles';

const Row = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  position: relative;
`;

const ColorBubble = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 2px solid var(--border);
  background: ${(props) => props.$color || 'blue'};
`;

const HiddenColorInput = styled.input.attrs({ type: 'color' })`
  position: absolute;
  top: 0;
  left: 0;
  width: 32px;
  height: 32px;
  opacity: 0;
  cursor: pointer;
  border: none;
  padding: 0;
`;

const ToggleRow = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const Switch = styled.button`
  position: relative;
  width: 48px;
  height: 26px;
  border-radius: 999px;
  border: none;
  cursor: pointer;
  background: var(--primary);
  transition: background 0.25s ease;
`;

const Knob = styled.span`
  position: absolute;
  top: 3px;
  left: ${(p) => (p.$active ? '24px' : '3px')};
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: white;
  transition: left 0.25s ease;
`;

function Account() {
  const { user, setUser } = useContext(UserContext);
  const [editing, setEditing] = useState(false);
  const [username, setUsername] = useState(user?.username || '');
  const [email, setEmail] = useState(user?.email || '');
  const [iconColor, setIconColor] = useState(user?.iconColor || '#0000ff');
  const [darkMode, setDarkMode] = useState(user?.darkMode || false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const { theme, setTheme } = useTheme();

  const handleThemeToggle = async () => {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);

    setDarkMode(!darkMode);
  };

  const resetTheme = async (darkMode) => {
    const mode = darkMode ? 'light' : 'dark';
    setTheme(mode);
  };

  if (!user) {
    return (
      <StaticPageShell>
        <StaticPageHeader>
          <h1>Account</h1>
          <LoginMessage message="manage your account" />
        </StaticPageHeader>
      </StaticPageShell>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const payload = {
        username,
        email,
        iconColor,
        darkMode,
      };

      const updated = await patchJSONToDb('users', user.id, payload);
      const updatedCamel = snakeToCamel(updated);

      setUser(updatedCamel);
      setSuccess('Account updated.');
      setEditing(false);
    } catch (err) {
      console.error(err);
      setError('Failed to update account.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <StaticPageShell>
      <StaticPageHeader>
        <h1>Account Settings</h1>
        <StaticPageSubtitle>View and update your profile details.</StaticPageSubtitle>
      </StaticPageHeader>

      {!editing && (
        <>
          <StyledForm as="div">
            <div>
              <ColorBubble $color={user.iconColor || '#0000ff'} />
            </div>

            <div>
              <label>Username</label>
              <p>{user.username}</p>
            </div>

            <div>
              <label>Email</label>
              <p>{user.email}</p>
            </div>

            <div>
              <label>Mode</label>
              <p>{user.darkMode ? 'Dark' : 'Light'}</p>
            </div>
          </StyledForm>

          <Button
            variant="outline"
            color="primary"
            type="button"
            onClick={() => setEditing(true)}
          >
            Edit account
          </Button>
        </>
      )}

      {editing && (
        <StyledForm onSubmit={handleSubmit}>
          <div>
            <Row>
              <ColorBubble $color={iconColor} />
              <HiddenColorInput
                value={iconColor}
                onChange={(e) => setIconColor(e.target.value)}
                aria-label="Choose icon color"
              />
            </Row>
          </div>

          <div>
            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label>Mode</label>
            <ToggleRow>
              <span>{darkMode ? 'Dark' : 'Light'}</span>

              <Switch
                type="button"
                $active={darkMode}
                onClick={handleThemeToggle}
                aria-label="Toggle dark mode"
              >
                <Knob $active={darkMode} />
              </Switch>
            </ToggleRow>
          </div>

          {error && <Error>{error}</Error>}
          {success && <div style={{ color: 'var(--success-color)' }}>{success}</div>}

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <Button variant="fill" color="primary" type="submit" disabled={saving}>
              {saving ? 'Saving...' : 'Save changes'}
            </Button>

            <Button
              variant="outline"
              color="primary"
              type="button"
              onClick={() => {
                setEditing(false);
                setError(null);
                setSuccess(null);
                setUsername(user.username || '');
                setEmail(user.email || '');
                setIconColor(user.iconColor || '#0000ff');
                setDarkMode(user.darkMode || false);
                resetTheme(user.darkMode ? 'light' : 'dark');
              }}
            >
              Cancel
            </Button>
          </div>
        </StyledForm>
      )}
    </StaticPageShell>
  );
}

export default Account;
