import React, {useState} from 'react';
import LoginForm from '../forms/LoginForm'
import LoggedInConfirm from '../components/LoggedInConfirm';
import Error from '../styles/Error';
import { StyledContainer } from '../MiscStyling';

function Login({errMessage}) {
  const [showConfirm, setShowConfirm] = useState(false);

  if (showConfirm) return <div><LoggedInConfirm setShowConfirm={setShowConfirm}/></div>

  return (
    <StyledContainer>
      {errMessage && <><br /><Error>{errMessage}</Error></>}        
      <LoginForm setShowConfirm={setShowConfirm}/>
    </StyledContainer>
  );
}

export default Login;