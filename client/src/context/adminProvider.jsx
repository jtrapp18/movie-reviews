import React, { createContext, useContext } from 'react';
import { UserContext } from './userProvider';

const AdminContext = createContext();

function AdminProvider({ children }) {
  const { user } = useContext(UserContext);
  const isAdmin = !!user?.isAdmin;

  // Legacy API kept for compatibility; logic now derives from user.isAdmin
  const loginAsAdmin = () => {};
  const logoutAdmin = () => {};

  return (
    <AdminContext.Provider value={{ isAdmin, loginAsAdmin, logoutAdmin }}>
      {children}
    </AdminContext.Provider>
  );
}

export { AdminContext, AdminProvider };
