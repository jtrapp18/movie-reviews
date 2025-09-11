import { useContext } from 'react';
import { AdminContext } from '../context/adminProvider';

export const useAdmin = () => {
  const { isAdmin } = useContext(AdminContext);
  return { isAdmin };
};
