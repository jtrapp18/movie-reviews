import React, { useContext } from "react";
import { snakeToCamel, postJSONToDb } from '../helper';
import styled from "styled-components";
import { UserContext } from '../context/userProvider';
import { useFormik } from 'formik';
import * as yup from 'yup';
import Error from "../styles/Error";
import { StyledForm, Button } from "../styles";
import { useTheme } from "../context/themeProvider";

const validationSchema = yup.object({
  firstName: yup.string().required('First Name is required'),
  lastName: yup.string(),
  username: yup
    .string()
    .required('Username is required')
    .min(3, 'Username must be at least 3 characters'),
  email: yup
    .string()
    .required('Email is required')
    .email('Email address is invalid'),
  password: yup
    .string()
    .required('Password is required')
    .min(8, 'Password must be at least 8 characters long')
    .matches(/[A-Z]/, 'Password must include at least one uppercase letter')
    .matches(/[a-z]/, 'Password must include at least one lowercase letter')
    .matches(/\d/, 'Password must include at least one number')
    .matches(/[!@#$%^&*(),.?":{}|<>]/, 'Password must include at least one special character'),
  password_confirmation: yup
    .string()
    .required('Password confirmation is required')
    .oneOf([yup.ref('password'), null], 'Passwords must match'),
});

function SignUpForm({ setShowConfirm }) {
  const { setUser } = useContext(UserContext);
  const { setTheme } = useTheme();

  const formik = useFormik({
    initialValues: {
      firstName: "",
      lastName: "",
      username: "",
      email: "",
      password: "",
      password_confirmation: "",
    },
    validationSchema,  // Use the validation schema here
    onSubmit: async (values, { setErrors }) => {
      const body = {
        firstName: values.firstName,
        lastName: values.lastName,
        username: values.username,
        email: values.email,
        password: values.password,
        password_confirmation: values.password_confirmation,
      };

      try {
        const newUser = await postJSONToDb("account_signup", body);
        if (newUser) {
          const userTransformed = snakeToCamel(newUser);
          setUser(userTransformed);
          if (typeof userTransformed.darkMode === 'boolean') {
            setTheme(userTransformed.darkMode ? 'dark' : 'light');
          }
          setShowConfirm(true);
        }
      } catch (error) {
          const errors = {};

          if (error.message.toLowerCase().includes('username'))  {
            errors.username = 'Username already taken.';
          } 
          if (error.message.toLowerCase().includes('email'))  {
            errors.email = 'Email already registered.';
          }

          setErrors(errors);
      }
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
        <label htmlFor="email">Email</label>
        <input
          type="email"
          id="email"
          name="email"
          value={formik.values.email}
          onChange={formik.handleChange}
          autoComplete="off"
          placeholder="you@example.com"
        />
        {formik.touched.email && formik.errors.email ? (
          <Error>{formik.errors.email}</Error>
        ) : null}
      </div>
      <div>
        <label htmlFor="password">Password</label>
        <input
          type="password"
          id="password"
          name="password"
          value={formik.values.password}
          onChange={formik.handleChange}
          autoComplete="current-password"
        />
        {formik.touched.password && formik.errors.password ? (
          <Error>{formik.errors.password}</Error>
        ) : null}
      </div>
      <div>
        <label htmlFor="password_confirmation">Password Confirmation</label>
        <input
          type="password"
          id="password_confirmation"
          name="password_confirmation"
          value={formik.values.password_confirmation}
          onChange={formik.handleChange}
          autoComplete="current-password"
        />
        {formik.touched.password_confirmation && formik.errors.password_confirmation ? (
          <Error>{formik.errors.password_confirmation}</Error>
        ) : null}
      </div>
      <div>
        <Button type="submit">Sign Up</Button>
      </div>
    </StyledForm>
  );
}

export default SignUpForm;