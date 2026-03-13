import React from "react";
import styled from 'styled-components';
import LoginForm from '../forms/LoginForm';
import { StyledContainer } from "../styles";

const Header = styled.div`
  text-align: center;
  margin-bottom: 2rem;
  
  h1 {
    font-size: clamp(2rem, 6vw, 3rem);
    margin-bottom: 0.5rem;
  }
  
  .subtitle {
    font-size: clamp(1.1rem, 3vw, 1.3rem);
    font-style: italic;
  }
`;

function Login() {
  return (
    <StyledContainer>
      <Header>
        <h1>Login</h1>
        <div className="subtitle">Sign in to access your account</div>
      </Header>
      <LoginForm />
    </StyledContainer>
  );
}

export default Login;