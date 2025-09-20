import React, { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { UserProvider } from './context/userProvider';
import { AdminProvider } from './context/adminProvider';
import { createHashRouter, RouterProvider } from 'react-router-dom'; // Import HashRouter
import routes from './routes'; // Import your routes configuration
import { WindowWidthProvider } from './context/windowSize';
import AdminIndicator from './components/AdminIndicator';
import { HelmetProvider } from 'react-helmet-async';

// Create the hash-based router
const router = createHashRouter(routes);

// Create the root and render the app with the router
const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <StrictMode>
    <HelmetProvider>
      <WindowWidthProvider>
        <UserProvider>
          <AdminProvider>
            <RouterProvider router={router} />
            <AdminIndicator />
          </AdminProvider>
        </UserProvider>
      </WindowWidthProvider>
    </HelmetProvider>
  </StrictMode>,
);