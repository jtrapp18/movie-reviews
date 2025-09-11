import React, { useContext } from 'react';
import { AdminContext } from '../context/adminProvider';
import { FaCrown, FaTimes } from 'react-icons/fa';
import styled from 'styled-components';

const AdminBadge = styled.div`
  position: fixed;
  bottom: 10px;
  left: 10px;
  background: var(--cinema-gold);
  color: var(--cinema-black);
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: bold;
  z-index: 1000;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  gap: 8px;
`;

const AdminIcon = styled.div`
  font-size: 1.2rem;
  display: flex;
  align-items: center;
`;

function AdminIndicator() {
  const { isAdmin, logoutAdmin } = useContext(AdminContext);

  if (!isAdmin) return null;

  return (
    <AdminBadge>
      <AdminIcon>
        <FaCrown />
      </AdminIcon>
      Admin Mode
      <button 
        onClick={logoutAdmin}
        style={{
          background: 'none',
          border: 'none',
          color: 'var(--cinema-black)',
          cursor: 'pointer',
          fontSize: '1rem',
          marginLeft: '8px',
          display: 'flex',
          alignItems: 'center'
        }}
        title="Logout Admin"
      >
        <FaTimes />
      </button>
    </AdminBadge>
  );
}

export default AdminIndicator;
