import { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { snakeToCamel, postJSONToDb } from '../helper';
import styled from 'styled-components';
import { UserContext } from '../context/userProvider';
import { useFormik } from 'formik';
import * as yup from 'yup';
import Error from '../styles/Error';
import { StyledForm, Button } from '../styles';
import { useTheme } from '../context/themeProvider';
import { useToast } from '../context/toastContext';

const validationSchema = yup.object({
  firstName: yup.string(),
  lastName: yup.string(),
  username: yup
    .string()
    .required('Username is required')
    .min(3, 'Username must be at least 3 characters'),
  email: yup.string().required('Email is required').email('Email address is invalid'),
  password: yup
    .string()
    .required('Password is required')
    .min(8, 'Password must be at least 8 characters long')
    .matches(/[A-Z]/, 'Password must include at least one uppercase letter')
    .matches(/[a-z]/, 'Password must include at least one lowercase letter')
    .matches(/\d/, 'Password must include at least one number')
    .matches(
      /[!@#$%^&*(),.?":{}|<>+]/,
      'Password must include at least one special character'
    ),
  password_confirmation: yup
    .string()
    .required('Password confirmation is required')
    .oneOf([yup.ref('password'), null], 'Passwords must match'),
});

const PasswordWrapper = styled.div`
  position: relative;

  input {
    padding-right: 3.5rem;
  }
`;

const ToggleVisibility = styled.button`
  position: absolute;
  right: 0.5rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  padding: 0.25rem;
  cursor: pointer;
  color: var(--font-color-2);
  display: inline-flex;
  align-items: center;
  justify-content: center;

  &:hover {
    color: var(--font-color);
  }

  svg {
    width: 1.25rem;
    height: 1.25rem;
    display: block;
  }
`;

const EyeOpen = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
  >
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const EyeClosed = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
  >
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

function SignUpForm({ setShowConfirm }) {
  const navigate = useNavigate();
  const { setUser } = useContext(UserContext);
  const { setTheme } = useTheme();
  const { showToast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const formik = useFormik({
    initialValues: {
      firstName: '',
      lastName: '',
      username: '',
      email: '',
      password: '',
      password_confirmation: '',
    },
    validationSchema, // Use the validation schema here
    onSubmit: async (values, { setErrors }) => {
      // DEBUG: If you never see this log, Formik validation is failing (onSubmit not called) or the form did a full-page submit.
      console.log('[Sign up] onSubmit called', {
        username: values.username,
        email: values.email,
      });
      setSubmitError(null);
      const body = {
        firstName: values.firstName,
        lastName: values.lastName,
        username: values.username,
        email: values.email,
        password: values.password,
        password_confirmation: values.password_confirmation,
      };

      try {
        console.log('[Sign up] Sending request to /api/account_signup');
        const newUser = await postJSONToDb('account_signup', body);
        console.log('[Sign up] Response received', newUser ? 'success' : 'empty');
        if (newUser) {
          const userTransformed = snakeToCamel(newUser);
          setUser(userTransformed);
          if (typeof userTransformed.darkMode === 'boolean') {
            setTheme(userTransformed.darkMode ? 'dark' : 'light');
          }
          setShowConfirm(true);
          showToast(`Successfully created account for ${userTransformed.username}`);
          console.info('[Sign up] Success:', userTransformed.username);
          navigate('/');
        }
      } catch (error) {
        console.error('[Sign up] Failure:', error.message, error.serverErrors ?? '');
        const errors = {};
        if (error.serverErrors && typeof error.serverErrors === 'object') {
          Object.assign(errors, error.serverErrors);
        }
        if (Object.keys(errors).length === 0) {
          setSubmitError(error.message || 'Something went wrong. Please try again.');
        } else {
          setSubmitError(null);
        }
        setErrors(errors);
      }
    },
  });

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    console.log('[Sign up] Form submit event');
    const errors = await formik.validateForm();
    if (errors && Object.keys(errors).length > 0) {
      console.warn('[Sign up] Validation failed', errors);
      formik.setErrors(errors);
      formik.setTouched({
        username: true,
        email: true,
        password: true,
        password_confirmation: true,
        firstName: true,
      });
      return;
    }
    formik.handleSubmit(e);
  };

  return (
    <StyledForm onSubmit={handleFormSubmit}>
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
        <PasswordWrapper>
          <input
            type={showPassword ? 'text' : 'password'}
            id="password"
            name="password"
            value={formik.values.password}
            onChange={formik.handleChange}
            autoComplete="new-password"
          />
          <ToggleVisibility
            type="button"
            onClick={() => setShowPassword((s) => !s)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeClosed /> : <EyeOpen />}
          </ToggleVisibility>
        </PasswordWrapper>
        {formik.touched.password && formik.errors.password ? (
          <Error>{formik.errors.password}</Error>
        ) : null}
      </div>
      <div>
        <label htmlFor="password_confirmation">Password Confirmation</label>
        <PasswordWrapper>
          <input
            type={showPasswordConfirm ? 'text' : 'password'}
            id="password_confirmation"
            name="password_confirmation"
            value={formik.values.password_confirmation}
            onChange={formik.handleChange}
            autoComplete="new-password"
          />
          <ToggleVisibility
            type="button"
            onClick={() => setShowPasswordConfirm((s) => !s)}
            aria-label={showPasswordConfirm ? 'Hide password' : 'Show password'}
          >
            {showPasswordConfirm ? <EyeClosed /> : <EyeOpen />}
          </ToggleVisibility>
        </PasswordWrapper>
        {formik.touched.password_confirmation && formik.errors.password_confirmation ? (
          <Error>{formik.errors.password_confirmation}</Error>
        ) : null}
      </div>
      {submitError && <Error>{submitError}</Error>}
      <div>
        <Button type="submit">Sign Up</Button>
      </div>
    </StyledForm>
  );
}

export default SignUpForm;
