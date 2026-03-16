import { useState } from 'react';
import styled from 'styled-components';
import { StyledContainer, StyledForm, Button } from '../styles';
import { postJSONToDb } from '../helper';

const Header = styled.div`
  text-align: center;
  margin-bottom: 1.5rem;

  h1 {
    margin-bottom: 0.5rem;
  }

  .subtitle {
    font-style: italic;
  }
`;

const Message = styled.p`
  margin-top: 0.75rem;
  text-align: center;
  // font-size: 0.95rem;
  color: ${(props) => (props.$error ? 'var(--error-color)' : 'var(--success-color)')};
`;

function ForgotPassword() {
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage('');
    setError('');
    try {
      const body = emailOrUsername.includes('@')
        ? { email: emailOrUsername }
        : { username: emailOrUsername };
      await postJSONToDb('password_reset_request', body);
      setMessage(
        'If an account exists for that information, you will receive reset instructions shortly.'
      );
    } catch (err) {
      console.error(err);
      setError('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <StyledContainer>
      <Header>
        <h1>Forgot password</h1>
        <div className="subtitle">
          <h3>Enter your email address or username to reset your password.</h3>
        </div>
      </Header>
      <StyledForm onSubmit={handleSubmit}>
        <div>
          <label htmlFor="identifier">Email or username</label>
          <input
            id="identifier"
            type="text"
            value={emailOrUsername}
            onChange={(e) => setEmailOrUsername(e.target.value)}
            autoComplete="off"
          />
        </div>
        <div>
          <Button type="submit" variant="fill" color="primary" disabled={submitting}>
            {submitting ? 'Sending...' : 'Send reset link'}
          </Button>
        </div>
      </StyledForm>
      {message && <Message>{message}</Message>}
      {error && <Message $error>{error}</Message>}
    </StyledContainer>
  );
}

export default ForgotPassword;
