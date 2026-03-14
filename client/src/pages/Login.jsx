import React, { useState } from "react";
import styled from 'styled-components';
import LoginForm from '../forms/LoginForm';
import SignUpForm from '../forms/SignUpForm';
import { StyledContainer } from "../styles";
import { useNavigate } from "react-router-dom";

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

const InlineToggle = styled.p`
  margin-top: 1rem;
  text-align: center;
  font-size: 0.95rem;

  button {
    background: none;
    border: none;
    padding: 0;
    margin: 0;
    cursor: pointer;
    color: var(--primary);
    text-decoration: underline;
    font: inherit;
  }
`;

const ConfirmText = styled.div`
  margin-top: 0.75rem;
  text-align: center;
  color: var(--cinema-gold);
  font-size: 0.95rem;
`;

function Login() {
  const [mode, setMode] = useState("login"); // 'login' | 'signup'
  const [showConfirm, setShowConfirm] = useState(false);
  const navigate = useNavigate();

  const isLogin = mode === "login";

  return (
    <StyledContainer>
      <Header>
        <h1>{isLogin ? "Login" : "Sign Up"}</h1>
        <div className="subtitle">
          <h3>{isLogin ? "Sign in to access your account" : "Create a new account"}</h3>
        </div>
      </Header>

      {isLogin ? (
        <>
          <LoginForm />
          <InlineToggle>
            Forgot your password?{" "}
            <button type="button" onClick={() => navigate("/forgot-password")}>
              Reset your password
            </button>
          </InlineToggle>
          <InlineToggle>
            Don&apos;t have an account?{" "}
            <button type="button" onClick={() => { setMode("signup"); setShowConfirm(false); }}>
              Sign up
            </button>
          </InlineToggle>
        </>
      ) : (
        <>
          <SignUpForm setShowConfirm={setShowConfirm} />
          {showConfirm && (
            <ConfirmText>
              Account created. You&apos;re logged in and can start using the site.
            </ConfirmText>
          )}
          <InlineToggle>
            Already have an account?{" "}
            <button type="button" onClick={() => setMode("login")}>
              Log in
            </button>
          </InlineToggle>
        </>
      )}
    </StyledContainer>
  );
}

export default Login;