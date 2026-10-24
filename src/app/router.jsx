import React, { useState, useEffect } from 'react';
import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';
import { PageLayout } from '../components/layout/PageLayout.jsx';
import { HomePage } from '../features/home/HomePage.jsx';
import { ThemeGallery } from '../features/themes/ThemeGallery.jsx';
import { ThemePreview } from '../features/themes/ThemePreview.jsx';
import { CustomizationWizard } from '../features/customization/CustomizationWizard.jsx';
import { InvitationRenderer } from '../features/invitation/InvitationRenderer.jsx';
import { AdminLogin } from '../features/admin/AdminLogin.jsx';
import { AdminDashboard } from '../features/admin/AdminDashboard.jsx';

// Protected Admin Guard
const AdminRoute = () => {
  const token = localStorage.getItem('shaadivibe_admin_token');
  if (!token) {
    return <Navigate to="/admin" replace />;
  }
  return <Outlet />;
};

export const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <PageLayout>
        <Outlet />
      </PageLayout>
    ),
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: 'themes',
        element: <ThemeGallery />,
      },
      {
        path: 'themes/:slug',
        element: <ThemePreview />,
      },
      {
        path: 'customize/:themeId',
        element: <CustomizationWizard />,
      },
      {
        path: 'customize',
        element: <Navigate to="/customize/theme-1" replace />,
      },
      {
        path: 'admin',
        element: <AdminLogin />,
      },
      {
        path: 'admin',
        element: <AdminRoute />,
        children: [
          {
            path: 'dashboard',
            element: <AdminDashboard />,
          },
        ],
      },
      {
        path: '*',
        element: (
          <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center">
            <h2 className="font-serif text-3xl font-bold text-royal-maroon-800">
              Page Not Found
            </h2>
            <p className="text-sm text-royal-brown-600 mt-2">
              The page you are looking for does not exist in our royal palace.
            </p>
          </div>
        ),
      },
    ],
  },
  {
    // Interactive Wedding Invitation experience is standalone full-screen
    path: '/invite/:slug',
    element: <InvitationRenderer />,
  },
]);
