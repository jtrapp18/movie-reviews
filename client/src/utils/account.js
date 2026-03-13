import { useContext, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../context/userProvider";
import { AdminContext } from "../context/adminProvider";
import { userLogout } from "../helper";

// Custom hook to share login/logout behavior between nav components.
// Note: Hooks are allowed here because this is itself a custom hook.
export const useAccountActions = () => {
  const { user, setUser } = useContext(UserContext);
  const { isAdmin, logoutAdmin } = useContext(AdminContext);
  const navigate = useNavigate();

  const handleAccount = useCallback(
    (afterAction) => {
      if (user) {
        if (isAdmin) {
          logoutAdmin();
        }
        userLogout();
        setUser(null);
        if (afterAction) afterAction("logout");
      } else {
        navigate("/login");
        if (afterAction) afterAction("login");
      }
    },
    [user, isAdmin, logoutAdmin, navigate, setUser]
  );

  return { user, isAdmin, handleAccount };
};
