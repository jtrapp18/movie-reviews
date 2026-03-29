import { useContext, useState } from 'react';
import { snakeToCamel, postJSONToDb } from '@helper';
import { UserContext } from '@context/userProvider';
import { useFormik } from 'formik';
import { useNavigate } from 'react-router-dom';
import Error from '@styles/Error';
import { StyledForm, Button } from '@styles';
import { useTheme } from '@context/themeProvider';
import { useToast } from '@context/toastContext';
import {
  PasswordWrapper,
  ToggleVisibility,
  EyeOpen,
  EyeClosed,
} from './passwordFieldToggle';

function LoginForm() {
  const { setUser } = useContext(UserContext);
  const navigate = useNavigate();
  const { setTheme } = useTheme();
  const { showToast } = useToast();
  const [showPassword, setShowPassword] = useState(false);

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
    },
    onSubmit: async (values, { setErrors }) => {
      const body = { email: values.email, password: values.password };

      try {
        const user = await postJSONToDb('login', body);
        const userTransformed = snakeToCamel(user);
        console.info('Login success - user payload:', userTransformed);
        setUser(userTransformed);
        if (typeof userTransformed.darkMode === 'boolean') {
          setTheme(userTransformed.darkMode ? 'dark' : 'light');
        }
        showToast(`Successfully logged in as ${userTransformed.username}`);
        navigate('/');
      } catch (error) {
        setErrors({ password: error.message });
      }
    },
    validate: (values) => {
      const errors = {};
      if (!values.email) {
        errors.email = 'Email is required';
      }
      if (!values.password) {
        errors.password = 'Password is required'; // pragma: allowlist secret
      }
      return errors;
    },
  });

  return (
    <StyledForm onSubmit={formik.handleSubmit}>
      <div>
        <label htmlFor="email">Email</label>
        <input
          type="email"
          id="email"
          name="email"
          autoComplete="email"
          value={formik.values.email}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
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
            autoComplete="current-password"
            value={formik.values.password}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
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
        <Button variant="fill" color="primary" type="submit">
          Login
        </Button>
      </div>
    </StyledForm>
  );
}

export default LoginForm;
