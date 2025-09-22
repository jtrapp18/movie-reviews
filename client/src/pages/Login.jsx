import React from 'react';
import styled from 'styled-components';
import LoginForm from '../forms/LoginForm'
import Error from '../styles/Error';
import { StyledContainer } from '../styles';

const Header = styled.div`
  text-align: center;
  margin-bottom: 2rem;
  
  h1 {
    color: var(--cinema-gold-dark);
    font-size: clamp(2rem, 6vw, 3rem);
    margin-bottom: 0.5rem;
  }
  
  .subtitle {
    color: var(--cinema-silver);
    font-size: clamp(1.1rem, 3vw, 1.3rem);
    font-style: italic;
  }
`;

function Login({errMessage}) {
  return (
    <StyledContainer>
      <Header>
        <h1>Login</h1>
        <div className="subtitle">Sign in to your account</div>
      </Header>
      
      {errMessage && <><br /><Error>{errMessage}</Error></>}        
      <LoginForm />
    </StyledContainer>
  );
}

export default Login;