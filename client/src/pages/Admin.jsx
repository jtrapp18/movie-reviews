import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { snakeToCamel, postJSONToDb } from "../helper";
import { UserContext } from '../context/userProvider';
import { AdminContext } from '../context/adminProvider';
import { StyledContainer, StyledForm, Button } from "../styles";
import { useFormik } from 'formik';
import Error from "../styles/Error";
import styled from 'styled-components';

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

// Custom LoginForm component for admin login
const AdminLoginForm = () => {
  const { setUser } = useContext(UserContext);
  const { loginAsAdmin } = useContext(AdminContext);
  const navigate = useNavigate();

  const formik = useFormik({
    initialValues: {
      username: '',
      password: ''
    },
    onSubmit: async (values, { setErrors }) => {
      const body = { username: values.username, password: values.password };
  
      try {
        const user = await postJSONToDb("login", body);
        const userTransformed = snakeToCamel(user);
        setUser(userTransformed);
        // Set admin status and navigate
        loginAsAdmin();
        navigate('/');
      } catch (error) {
        setErrors({ password: error.message });
      }
    },
    validate: (values) => {
      const errors = {};
      if (!values.username) {
        errors.username = 'Username is required';
      }
      if (!values.password) {
        errors.password = 'Password is required';
      }
      return errors;
    }
  });

  return (
    <StyledForm onSubmit={formik.handleSubmit}>
      <div>
        <label htmlFor="username">Username</label>
        <input
          type="text"
          id="username"
          name="username"
          autoComplete="off"
          value={formik.values.username}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
        />
        {formik.touched.username && formik.errors.username ? (
          <Error>{formik.errors.username}</Error>
        ) : null}
      </div>
      <div>
        <label htmlFor="password">Password</label>
        <input
          type="password"
          id="password"
          name="password"
          autoComplete="current-password"
          value={formik.values.password}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
        />
        {formik.touched.password && formik.errors.password ? (
          <Error>{formik.errors.password}</Error>
        ) : null}
      </div>
      <div>
        <Button variant="fill" color="primary" type="submit">
          Login as Admin
        </Button>
      </div>
    </StyledForm>
  );
};

function Admin() {
  return (
    <StyledContainer>
      <Header>
        <h1>Admin Login</h1>
        <div className="subtitle">Sign in to access administrative features</div>
      </Header>
      <AdminLoginForm />
    </StyledContainer>
  );
}

export default Admin;
