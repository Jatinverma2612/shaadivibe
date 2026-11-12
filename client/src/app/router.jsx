import React from 'react';
import { createBrowserRouter, Navigate, Outlet, useLocation } from 'react-router-dom';
import { PageLayout } from '../components/layout/PageLayout.jsx';
import { CustomerLayout } from '../components/layout/CustomerLayout.jsx';
import { HomePage } from '../features/home/HomePage.jsx';
import { ThemeGallery } from '../features/themes/ThemeGallery.jsx';
import { ThemePreview } from '../features/themes/ThemePreview.jsx';
import { CustomizationWizard } from '../features/customization/CustomizationWizard.jsx';
import { InvitationRenderer } from '../features/invitation/InvitationRenderer.jsx';
import { AdminLogin } from '../features/admin/AdminLogin.jsx';
import { AdminDashboard } from '../features/admin/AdminDashboard.jsx';
import { CustomerLogin } from '../features/auth/CustomerLogin.jsx';
import { CustomerRegister } from '../features/auth/CustomerRegister.jsx';
import { CustomerDashboard } from '../features/dashboard/CustomerDashboard.jsx';
import { CartPage } from '../features/cart/CartPage.jsx';
import { WishlistPage } from '../features/wishlist/WishlistPage.jsx';

/**
 * Protected Customer Route Guard
 * Strict separation: only accepts customer authentication token.
 * Redirects unauthenticated requests to customer login.
 */
const CustomerRoute = () => {
  const token = localStorage.getItem('shaadivibe_customer_token');
  const location = useLocation();

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return (
    <CustomerLayout>
      <Outlet />
    </CustomerLayout>
  );
};

const parseJwt = (token) => {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    return JSON.parse(atob(parts[1]));
  } catch {
    return null;
  }
};

/**
 * Protected Admin Route Guard
 * Strict separation: only accepts dedicated admin authentication token.
 * Validates expiration and role claim before allowing access.
 * Redirects unauthenticated or customer attempts to /admin login.
 */
const AdminRoute = () => {
  const token = localStorage.getItem('shaadivibe_admin_token');
  const location = useLocation();

  if (!token) {
    return <Navigate to="/admin" state={{ from: location }} replace />;
  }

  const payload = parseJwt(token);
  if (payload) {
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      localStorage.removeItem('shaadivibe_admin_token');
      return <Navigate to="/admin" state={{ from: location }} replace />;
    }
    if (payload.role && payload.role !== 'admin') {
      localStorage.removeItem('shaadivibe_admin_token');
      return <Navigate to="/admin" state={{ from: location }} replace />;
    }
  } else if (token !== 'mock_admin_jwt_token_shaadivibe') {
    localStorage.removeItem('shaadivibe_admin_token');
    return <Navigate to="/admin" state={{ from: location }} replace />;
  }

  return <Outlet />;
};

export const router = createBrowserRouter([
  // 1. Customer Management System (Dedicated CustomerLayout via CustomerRoute)
  {
    path: '/dashboard',
    element: <CustomerRoute />,
    children: [
      {
        index: true,
        element: <CustomerDashboard />,
      },
    ],
  },

  // 2. Admin Management System (Dedicated AdminLayout & Admin Guard)
  {
    path: '/admin',
    element: <AdminLogin />,
  },
  {
    path: '/admin/dashboard',
    element: <AdminRoute />,
    children: [
      {
        index: true,
        element: <AdminDashboard />,
      },
    ],
  },

  // 3. Standalone Interactive Wedding Invitation Experience
  {
    path: '/invite/:slug',
    element: <InvitationRenderer />,
  },

  // 4. Public Marketing Website (Uses PageLayout with Public Header & Footer)
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
        path: 'cart',
        element: <CartPage />,
      },
      {
        path: 'wishlist',
        element: <WishlistPage />,
      },
      {
        path: 'login',
        element: <CustomerLogin />,
      },
      {
        path: 'register',
        element: <CustomerRegister />,
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
]);
