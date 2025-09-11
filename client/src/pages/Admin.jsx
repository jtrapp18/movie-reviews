import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from '../context/userProvider';
import { AdminContext } from '../context/adminProvider';
import LoginForm from '../forms/LoginForm';
import { StyledContainer } from "../MiscStyling";
import styled from 'styled-components';

const AdminTitle = styled.h1`
  text-align: center;
  margin-bottom: 2rem;
  color: var(--cinema-gold);
  font-size: 2rem;
`;

// Custom LoginForm component for admin login
const AdminLoginForm = () => {
  const { setUser } = useContext(UserContext);
  const { loginAsAdmin } = useContext(AdminContext);
  const navigate = useNavigate();

  const handleLoginSuccess = () => {
    // The LoginForm will handle setting the user, we just need to set admin status
    loginAsAdmin();
    navigate('/');
  };

  return (
    <LoginForm 
      setShowConfirm={handleLoginSuccess}
    />
  );
};

function Admin() {
  return (
    <StyledContainer>
      <AdminTitle>Admin Access</AdminTitle>
      <AdminLoginForm />
    </StyledContainer>
  );
}

export default Admin;
