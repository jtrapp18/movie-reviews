import React from 'react';
import LoginForm from '../forms/LoginForm'
import Error from '../styles/Error';
import { StyledContainer } from '../styles';

function Login({errMessage}) {
  return (
    <StyledContainer>
      {errMessage && <><br /><Error>{errMessage}</Error></>}        
      <LoginForm />
    </StyledContainer>
  );
}

export default Login;