import { useContext, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../context/userProvider';
import { useToast } from '../context/toastContext';
import { userLogout } from '../helper';

// Full account actions (login/logout + navigate) for components rendered inside Router.
export const useAccountActions = () => {
  const { user, setUser } = useContext(UserContext);
  const navigate = useNavigate();
  const { showToast } = useToast();
  const isAdmin = !!user?.isAdmin;

  const handleAccount = useCallback(
    (afterAction) => {
      if (user) {
        showToast(`${user.username} signed out`);
        userLogout();
        setUser(null);
        if (afterAction) afterAction('logout');
      } else {
        navigate('/login');
        if (afterAction) afterAction('login');
      }
    },
    [user, navigate, setUser, showToast]
  );

  return { user, isAdmin, handleAccount };
};

// Account status + logout for components that are NOT under a Router (no useNavigate).
export const useAccountStatus = () => {
  const { user, setUser } = useContext(UserContext);
  const { showToast } = useToast();
  const isAdmin = !!user?.isAdmin;

  const logout = useCallback(() => {
    if (user) {
      showToast(`${user.username} signed out`);
      userLogout();
      setUser(null);
    }
  }, [user, setUser, showToast]);

  return { user, isAdmin, logout };
};
