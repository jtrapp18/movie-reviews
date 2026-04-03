import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { StaticPageShell, StyledForm, Button } from '@styles';
import Error from '@styles/Error';
import { postJSONToDb } from '@helper';
import {
  StaticPageHeader,
  StaticPageSubtitle,
} from '@components/layout/staticPageStyles';

const SuccessText = styled.p`
  margin-top: 0.75rem;
  text-align: center;
  color: var(--cinema-gold);
  font-size: 0.95rem;
`;

function ResetPassword() {
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const token = params.get('token') || '';

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  if (!token) {
    return (
      <StaticPageShell>
        <StaticPageHeader>
          <h1>Reset password</h1>
          <StaticPageSubtitle>This reset link is invalid.</StaticPageSubtitle>
        </StaticPageHeader>
      </StaticPageShell>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!password || password !== confirm) {
      setError('Passwords must match.');
      return;
    }
    setSubmitting(true);
    try {
      await postJSONToDb('password_reset', { token, password });
      setSuccess('Your password has been reset. You can now log in.');
      setTimeout(() => {
        navigate('/login');
      }, 1500);
    } catch (err) {
      console.error(err);
      setError('Reset link is invalid or expired.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <StaticPageShell>
      <StaticPageHeader>
        <h1>Reset password</h1>
        <StaticPageSubtitle>Choose a new password for your account.</StaticPageSubtitle>
      </StaticPageHeader>
      <StyledForm onSubmit={handleSubmit}>
        <div>
          <label htmlFor="password">New password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
          />
        </div>
        <div>
          <label htmlFor="confirm">Confirm password</label>
          <input
            id="confirm"
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            autoComplete="new-password"
          />
        </div>
        {error && <Error>{error}</Error>}
        <div>
          <Button type="submit" variant="fill" color="primary" disabled={submitting}>
            {submitting ? 'Resetting...' : 'Reset password'}
          </Button>
        </div>
      </StyledForm>
      {success && <SuccessText>{success}</SuccessText>}
    </StaticPageShell>
  );
}

export default ResetPassword;
