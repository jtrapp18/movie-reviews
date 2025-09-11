import React, { useState, useEffect, createContext } from 'react';

const AdminContext = createContext();

function AdminProvider({ children }) {
  const [isAdmin, setIsAdmin] = useState(false);

  // Check for admin cookie on mount
  useEffect(() => {
    const checkAdminStatus = () => {
      const cookies = document.cookie.split(';');
      const adminCookie = cookies.find(cookie => cookie.trim().startsWith('admin='));
      if (adminCookie && adminCookie.split('=')[1] === 'true') {
        setIsAdmin(true);
      }
    };

    checkAdminStatus();
  }, []);

  const loginAsAdmin = () => {
    setIsAdmin(true);
    document.cookie = `admin=true; path=/; max-age=${7 * 24 * 60 * 60}`; // 7 days
  };

  const logoutAdmin = () => {
    setIsAdmin(false);
    document.cookie = 'admin=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
  };

  return (
    <AdminContext.Provider value={{ isAdmin, loginAsAdmin, logoutAdmin }}>
      {children}
    </AdminContext.Provider>
  );
}

export { AdminContext, AdminProvider };
