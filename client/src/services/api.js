import { defaultThemes, sampleInvitation, defaultSiteContent } from '../constants/mockData.js';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

/**
 * Token retrieval helpers
 */
export const getAdminToken = () => {
  return localStorage.getItem('shaadivibe_admin_token') || '';
};

export const getCustomerToken = () => {
  return localStorage.getItem('shaadivibe_customer_token') || '';
};

export const getAuthToken = () => {
  if (typeof window !== 'undefined' && window.location.pathname.startsWith('/admin')) {
    return getAdminToken() || getCustomerToken();
  }
  return getCustomerToken() || getAdminToken();
};

/**
 * Fetch Themes with optional category, search, format filters
 */
export const fetchThemes = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  try {
    const res = await fetch(`${API_BASE}/themes?${query}`);
    if (!res.ok) throw new Error('Failed to fetch themes');
    const data = await res.json();
    return data.data;
  } catch (err) {
    console.warn('[API] Using local fallback for themes:', err.message);
    let filtered = [...defaultThemes];
    if (params.category && params.category !== 'All') {
      filtered = filtered.filter((t) => t.category.toLowerCase() === params.category.toLowerCase());
    }
    if (params.search) {
      const s = params.search.toLowerCase();
      filtered = filtered.filter((t) => t.name.toLowerCase().includes(s) || t.description.toLowerCase().includes(s));
    }
    return filtered;
  }
};

/**
 * Fetch single theme by slug
 */
export const fetchThemeBySlug = async (slug) => {
  try {
    const res = await fetch(`${API_BASE}/themes/${slug}`);
    if (!res.ok) throw new Error('Theme not found');
    const data = await res.json();
    return data.data;
  } catch (err) {
    console.warn('[API] Using fallback for theme:', slug);
    const found = defaultThemes.find((t) => t.slug === slug);
    if (found) return found;
    throw err;
  }
};

/**
 * Create new theme (Admin)
 */
export const createTheme = async (themeData) => {
  const token = getAuthToken();
  const res = await fetch(`${API_BASE}/themes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(themeData),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || 'Failed to create theme');
  }
  return await res.json();
};

/**
 * Update theme (Admin)
 */
export const updateTheme = async (id, themeData) => {
  const token = getAuthToken();
  const res = await fetch(`${API_BASE}/themes/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(themeData),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || 'Failed to update theme');
  }
  return await res.json();
};

/**
 * Toggle theme publish status (Admin)
 */
export const toggleThemePublish = async (id) => {
  const token = getAuthToken();
  const res = await fetch(`${API_BASE}/themes/${id}/publish`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || 'Failed to toggle publish');
  }
  return await res.json();
};

/**
 * ==========================================================================
 * DYNAMIC CATEGORY MANAGEMENT APIS
 * ==========================================================================
 */

export const fetchCategories = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  const url = query ? `${API_BASE}/categories?${query}` : `${API_BASE}/categories`;
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch categories');
    const data = await res.json();
    return data.data || [];
  } catch (err) {
    console.warn('[API] Using fallback default categories:', err.message);
    return [
      { _id: 'cat-1', name: 'Royal', slug: 'royal', description: 'Regal palaces and gold foil motifs', themeCount: 0 },
      { _id: 'cat-2', name: 'Traditional', slug: 'traditional', description: 'Time-honored Vedic rituals', themeCount: 0 },
      { _id: 'cat-3', name: 'Floral', slug: 'floral', description: 'Romantic blossoms and botanical elegance', themeCount: 0 },
      { _id: 'cat-4', name: 'Minimal', slug: 'minimal', description: 'Clean modern lines and typography', themeCount: 0 },
      { _id: 'cat-5', name: 'Modern', slug: 'modern', description: 'Sleek luxury aesthetics', themeCount: 0 },
      { _id: 'cat-6', name: 'Cartoon', slug: 'cartoon', description: 'Playful illustrated caricatures', themeCount: 0 },
      { _id: 'cat-7', name: 'Destination', slug: 'destination', description: 'Palace lakes and coastal beaches', themeCount: 0 },
      { _id: 'cat-8', name: 'Regional', slug: 'regional', description: 'Authentic regional ceremonies', themeCount: 0 },
    ];
  }
};

export const createCategory = async (categoryData) => {
  const token = getAdminToken();
  const res = await fetch(`${API_BASE}/categories`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(categoryData),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to create category');
  }
  return await res.json();
};

export const updateCategory = async (id, categoryData) => {
  const token = getAdminToken();
  const res = await fetch(`${API_BASE}/categories/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(categoryData),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to update category');
  }
  return await res.json();
};

export const deleteCategory = async (id) => {
  const token = getAdminToken();
  const res = await fetch(`${API_BASE}/categories/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to delete category');
  }
  return await res.json();
};

/**
 * Fetch wedding invitation by slug
 */
export const fetchInvitationBySlug = async (slug) => {
  try {
    const res = await fetch(`${API_BASE}/invitations/${slug}`);
    if (!res.ok) throw new Error('Invitation not found');
    const data = await res.json();
    return data.data;
  } catch (err) {
    console.warn('[API] Using fallback for invitation:', slug);
    if (slug === 'priya-and-rohan' || slug === 'sample' || slug === 'demo') {
      return sampleInvitation;
    }
    // Check local storage draft
    const saved = localStorage.getItem(`invitation_${slug}`);
    if (saved) {
      return JSON.parse(saved);
    }
    throw err;
  }
};

/**
 * Fetch customer's invitations (or all if admin)
 */
export const fetchMyInvitations = async (params = {}) => {
  const token = getAuthToken();
  const query = new URLSearchParams(params).toString();
  const res = await fetch(`${API_BASE}/invitations?${query}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    credentials: 'include',
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to fetch invitations');
  }
  return await res.json();
};

/**
 * Fetch single invitation by internal ID (for owner/admin editing)
 */
export const fetchInvitationById = async (id) => {
  const token = getAuthToken();
  const res = await fetch(`${API_BASE}/invitations/id/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    credentials: 'include',
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Invitation not found');
  }
  const data = await res.json();
  return data.data;
};

/**
 * Save/Create wedding invitation
 */
export const saveInvitation = async (invitationData) => {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  // If already has an ID, update existing draft
  const invId = invitationData._id || invitationData.id;
  if (invId && !invId.startsWith('local_') && !invId.startsWith('session_')) {
    return await updateInvitation(invId, invitationData);
  }

  try {
    const res = await fetch(`${API_BASE}/invitations`, {
      method: 'POST',
      headers,
      credentials: 'include',
      body: JSON.stringify(invitationData),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to save invitation');
    }
    const data = await res.json();
    if (data.data?.slug) {
      localStorage.setItem(`invitation_${data.data.slug}`, JSON.stringify(data.data));
    }
    return data;
  } catch (err) {
    console.warn('[API] Offline fallback saving invitation to localStorage');
    const slug = `${invitationData.brideName.toLowerCase().replace(/[^a-z0-9]/g, '-')}-weds-${invitationData.groomName.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
    const payload = {
      ...invitationData,
      slug,
      _id: `local_${Date.now()}`,
    };
    localStorage.setItem(`invitation_${slug}`, JSON.stringify(payload));
    return {
      success: true,
      message: 'Invitation saved in local cache!',
      data: payload,
      shareUrl: `/invite/${slug}`,
    };
  }
};

/**
 * Update an existing invitation draft
 */
export const updateInvitation = async (id, invitationData) => {
  const token = getAuthToken();
  const res = await fetch(`${API_BASE}/invitations/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    credentials: 'include',
    body: JSON.stringify(invitationData),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to update invitation');
  }
  return await res.json();
};

/**
 * Publish an invitation
 */
export const publishInvitation = async (id) => {
  const token = getAuthToken();
  const res = await fetch(`${API_BASE}/invitations/${id}/publish`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    credentials: 'include',
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to publish invitation');
  }
  return await res.json();
};

/**
 * Unpublish an invitation (return to draft)
 */
export const unpublishInvitation = async (id) => {
  const token = getAuthToken();
  const res = await fetch(`${API_BASE}/invitations/${id}/unpublish`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    credentials: 'include',
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to unpublish invitation');
  }
  return await res.json();
};

/**
 * Delete an invitation
 */
export const deleteInvitation = async (id) => {
  const token = getAuthToken();
  const res = await fetch(`${API_BASE}/invitations/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    credentials: 'include',
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to delete invitation');
  }
  return await res.json();
};

/**
 * Upload photos
 */
export const uploadPhotos = async (files) => {
  const formData = new FormData();
  Array.from(files).forEach((file) => {
    formData.append('photos', file);
  });

  try {
    const res = await fetch(`${API_BASE}/upload`, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Upload failed');
    }
    return await res.json();
  } catch (err) {
    console.warn('[API] Offline image simulation using Object URLs');
    // Fallback: create object URLs for instant preview
    const urls = Array.from(files).map((f) => URL.createObjectURL(f));
    return {
      success: true,
      urls,
    };
  }
};

/**
 * Fetch site CMS content
 */
export const fetchSiteContent = async (section) => {
  try {
    const res = await fetch(`${API_BASE}/content/${section}`);
    if (!res.ok) throw new Error('Content not found');
    const data = await res.json();
    return data.data;
  } catch (err) {
    return defaultSiteContent[section] || {};
  }
};

/**
 * Update site CMS content (Admin)
 */
export const updateSiteContent = async (section, data) => {
  const token = getAuthToken();
  const res = await fetch(`${API_BASE}/content/${section}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ data }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || 'Failed to update content');
  }
  return await res.json();
};

/**
 * Admin Login
 */
export const adminLogin = async (email, password) => {
  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Invalid credentials');
    }
    localStorage.setItem('shaadivibe_admin_token', data.token);
    return data;
  } catch (err) {
    // Offline admin test mode
    if (email === 'admin@shaadivibe.com' && password === 'Admin@123456') {
      const mockToken = 'mock_admin_jwt_token_shaadivibe';
      localStorage.setItem('shaadivibe_admin_token', mockToken);
      return {
        success: true,
        token: mockToken,
        user: { name: 'ShaadiVibe Royal Admin', email, role: 'admin' },
      };
    }
    throw err;
  }
};

/**
 * Customer Registration
 */
export const customerRegister = async (name, email, password) => {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ name, email, password }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Registration failed');
  }
  if (data.token) {
    localStorage.setItem('shaadivibe_customer_token', data.token);
  }
  return data;
};

/**
 * Customer Login
 */
export const customerLogin = async (email, password) => {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Invalid credentials');
  }
  if (data.token) {
    localStorage.setItem('shaadivibe_customer_token', data.token);
  }
  return data;
};

/**
 * Customer Logout
 */
export const customerLogout = async () => {
  try {
    await fetch(`${API_BASE}/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    });
  } catch (e) {
    // ignore
  }
  localStorage.removeItem('shaadivibe_customer_token');
  return { success: true };
};

/**
 * Fetch Current Authenticated User / Session
 */
export const fetchCurrentUser = async () => {
  const token = getAuthToken();
  const headers = {};
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  const res = await fetch(`${API_BASE}/auth/me`, {
    headers,
    credentials: 'include',
  });
  if (!res.ok) {
    throw new Error('Unauthenticated');
  }
  const data = await res.json();
  return data.user;
};

/* ==========================================================================
   THEME DELETE API
   ========================================================================== */

/**
 * Delete a theme (Admin)
 */
export const deleteTheme = async (id) => {
  const token = getAdminToken();
  const res = await fetch(`${API_BASE}/themes/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to delete theme');
  }
  return await res.json();
};

/* ==========================================================================
   CUSTOMER MANAGEMENT APIS (Phase D - Module A)
   ========================================================================== */

/**
 * Fetch paginated customers with order & invitation stats (Admin)
 */
export const fetchCustomers = async (params = {}) => {
  const token = getAdminToken();
  const query = new URLSearchParams(params).toString();
  const res = await fetch(`${API_BASE}/admin/customers${query ? `?${query}` : ''}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    credentials: 'include',
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to fetch customers');
  }
  return await res.json();
};

/**
 * Fetch full profile and order history for a customer (Admin)
 */
export const fetchCustomerById = async (id) => {
  const token = getAdminToken();
  const res = await fetch(`${API_BASE}/admin/customers/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    credentials: 'include',
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to fetch customer profile');
  }
  return await res.json();
};

/**
 * Safely update customer profile fields (Admin)
 */
export const updateCustomer = async (id, data) => {
  const token = getAdminToken();
  const res = await fetch(`${API_BASE}/admin/customers/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    credentials: 'include',
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to update customer');
  }
  return await res.json();
};

/* ==========================================================================
   RSVP MANAGEMENT APIS (Phase D - Module B)
   ========================================================================== */

/**
 * Submit guest RSVP response (Public)
 */
export const submitRsvp = async (data) => {
  const res = await fetch(`${API_BASE}/rsvp`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to submit RSVP');
  }
  return await res.json();
};

/**
 * Fetch RSVPs for a specific invitation (Owner or Admin)
 */
export const fetchInvitationRsvps = async (invitationId) => {
  const token = getAuthToken();
  const res = await fetch(`${API_BASE}/rsvp/invitation/${invitationId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    credentials: 'include',
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to fetch invitation RSVPs');
  }
  return await res.json();
};

/**
 * Fetch all platform RSVPs (Admin)
 */
export const fetchAdminRsvps = async (params = {}) => {
  const token = getAdminToken();
  const query = new URLSearchParams(params).toString();
  const res = await fetch(`${API_BASE}/rsvp/admin/all${query ? `?${query}` : ''}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    credentials: 'include',
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to fetch RSVP overview');
  }
  return await res.json();
};

/* ==========================================================================
   COUPONS & OFFERS APIS (Phase D - Module C)
   ========================================================================== */

/**
 * Validate a coupon code against order amount (Public / Checkout)
 */
export const validateCouponCode = async (code, orderAmount) => {
  const res = await fetch(`${API_BASE}/coupons/validate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code, orderAmount }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Invalid coupon code');
  }
  return await res.json();
};

/**
 * Fetch coupons with pagination, filters, and search (Admin)
 */
export const fetchCoupons = async (params = {}) => {
  const token = getAdminToken();
  const query = new URLSearchParams(params).toString();
  const res = await fetch(`${API_BASE}/admin/coupons${query ? `?${query}` : ''}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    credentials: 'include',
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to fetch coupons');
  }
  return await res.json();
};

/**
 * Create a new coupon (Admin)
 */
export const createCoupon = async (couponData) => {
  const token = getAdminToken();
  const res = await fetch(`${API_BASE}/admin/coupons`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    credentials: 'include',
    body: JSON.stringify(couponData),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to create coupon');
  }
  return await res.json();
};

/**
 * Update an existing coupon (Admin)
 */
export const updateCoupon = async (id, couponData) => {
  const token = getAdminToken();
  const res = await fetch(`${API_BASE}/admin/coupons/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    credentials: 'include',
    body: JSON.stringify(couponData),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to update coupon');
  }
  return await res.json();
};

/**
 * Toggle coupon active/inactive status (Admin)
 */
export const toggleCouponStatus = async (id) => {
  const token = getAdminToken();
  const res = await fetch(`${API_BASE}/admin/coupons/${id}/toggle`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    credentials: 'include',
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to toggle coupon status');
  }
  return await res.json();
};

/**
 * Delete a coupon (Admin)
 */
export const deleteCoupon = async (id) => {
  const token = getAdminToken();
  const res = await fetch(`${API_BASE}/admin/coupons/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    credentials: 'include',
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to delete coupon');
  }
  return await res.json();
};

/* ==========================================================================
   SUPPORT TICKETS APIS (Phase D - Module D)
   ========================================================================== */

/**
 * Create a support ticket (Customer or Guest)
 */
export const createTicket = async (ticketData) => {
  const token = getAuthToken();
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}/tickets`, {
    method: 'POST',
    headers,
    credentials: 'include',
    body: JSON.stringify(ticketData),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to create support ticket');
  }
  return await res.json();
};

/**
 * Fetch authenticated customer's own tickets
 */
export const fetchMyTickets = async () => {
  const token = getAuthToken();
  const res = await fetch(`${API_BASE}/tickets/my`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    credentials: 'include',
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to fetch tickets');
  }
  return await res.json();
};

/**
 * Fetch all platform tickets with filtering and search (Admin)
 */
export const fetchAdminTickets = async (params = {}) => {
  const token = getAdminToken();
  const query = new URLSearchParams(params).toString();
  const res = await fetch(`${API_BASE}/admin/tickets${query ? `?${query}` : ''}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    credentials: 'include',
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to fetch support tickets');
  }
  return await res.json();
};

/**
 * Update support ticket status, priority, or admin notes (Admin)
 */
export const updateTicket = async (id, updateData) => {
  const token = getAdminToken();
  const res = await fetch(`${API_BASE}/admin/tickets/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    credentials: 'include',
    body: JSON.stringify(updateData),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to update support ticket');
  }
  return await res.json();
};

/* ==========================================================================
   CART & WISHLIST APIS
   ========================================================================== */

export const fetchCart = async (guestIds = []) => {
  const token = getAuthToken();
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;

  let url = `${API_BASE}/cart`;
  if (!token && guestIds && guestIds.length > 0) {
    url += `?items=${encodeURIComponent(guestIds.join(','))}`;
  }

  const res = await fetch(url, { headers, credentials: 'include' });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to fetch cart');
  }
  const data = await res.json();
  return data.data;
};

export const addCartItem = async (themeId) => {
  const token = getAuthToken();
  const res = await fetch(`${API_BASE}/cart/items`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    credentials: 'include',
    body: JSON.stringify({ themeId }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to add item to cart');
  }
  const data = await res.json();
  return data.data;
};

export const removeCartItem = async (themeId) => {
  const token = getAuthToken();
  const res = await fetch(`${API_BASE}/cart/items/${themeId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    credentials: 'include',
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to remove item from cart');
  }
  const data = await res.json();
  return data.data;
};

export const syncCartApi = async (themeIds) => {
  const token = getAuthToken();
  const res = await fetch(`${API_BASE}/cart/sync`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    credentials: 'include',
    body: JSON.stringify({ themeIds }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to sync cart');
  }
  const data = await res.json();
  return data.data;
};

export const clearCartApi = async () => {
  const token = getAuthToken();
  const res = await fetch(`${API_BASE}/cart`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    credentials: 'include',
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to clear cart');
  }
  return await res.json();
};

export const fetchWishlist = async (guestIds = []) => {
  const token = getAuthToken();
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;

  let url = `${API_BASE}/wishlist`;
  if (!token && guestIds && guestIds.length > 0) {
    url += `?items=${encodeURIComponent(guestIds.join(','))}`;
  }

  const res = await fetch(url, { headers, credentials: 'include' });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to fetch wishlist');
  }
  const data = await res.json();
  return data.data;
};

export const toggleWishlistApi = async (themeId) => {
  const token = getAuthToken();
  const res = await fetch(`${API_BASE}/wishlist/toggle`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    credentials: 'include',
    body: JSON.stringify({ themeId }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to update wishlist');
  }
  const data = await res.json();
  return data.data;
};

export const removeWishlistItem = async (themeId) => {
  const token = getAuthToken();
  const res = await fetch(`${API_BASE}/wishlist/items/${themeId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    credentials: 'include',
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to remove from wishlist');
  }
  const data = await res.json();
  return data.data;
};

export const syncWishlistApi = async (themeIds) => {
  const token = getAuthToken();
  const res = await fetch(`${API_BASE}/wishlist/sync`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    credentials: 'include',
    body: JSON.stringify({ themeIds }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to sync wishlist');
  }
  const data = await res.json();
  return data.data;
};

/* ==========================================================================
   THEME ASSET UPLOAD API
   ========================================================================== */

/**
 * Upload admin theme asset (cover image, video preview, or package template)
 */
export const uploadThemeAsset = async (file) => {
  const token = getAdminToken();
  const formData = new FormData();
  formData.append('file', file);

  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}/upload/theme-asset`, {
    method: 'POST',
    headers,
    credentials: 'include',
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Theme asset upload failed');
  }

  const data = await res.json();
  return {
    url: data.url || data.urls?.[0] || '',
    filename: data.filename || file.name,
    size: data.size || file.size,
  };
};


/* ==========================================================================
   ORDER MANAGEMENT APIS (Phase C)
   ========================================================================== */

export const fetchOrders = async (params = {}) => {
  const token = getAdminToken();
  const query = new URLSearchParams(params).toString();
  const res = await fetch(`${API_BASE}/orders${query ? `?${query}` : ''}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    credentials: 'include',
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to fetch orders');
  }
  return await res.json();
};

export const fetchOrderById = async (id) => {
  const token = getAdminToken();
  const res = await fetch(`${API_BASE}/orders/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    credentials: 'include',
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to fetch order details');
  }
  return await res.json();
};

export const createOrder = async (orderData) => {
  const token = getAdminToken();
  const res = await fetch(`${API_BASE}/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    credentials: 'include',
    body: JSON.stringify(orderData),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to create order');
  }
  return await res.json();
};

export const updateOrder = async (id, orderData) => {
  const token = getAdminToken();
  const res = await fetch(`${API_BASE}/orders/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    credentials: 'include',
    body: JSON.stringify(orderData),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to update order');
  }
  return await res.json();
};

export const updateOrderStatus = async (id, status, notes = '') => {
  const token = getAdminToken();
  const res = await fetch(`${API_BASE}/orders/${id}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    credentials: 'include',
    body: JSON.stringify({ status, notes }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to update order status');
  }
  return await res.json();
};

export const deleteOrder = async (id) => {
  const token = getAdminToken();
  const res = await fetch(`${API_BASE}/orders/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    credentials: 'include',
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to delete order');
  }
  return await res.json();
};

export const fetchCustomersLookup = async () => {
  const token = getAdminToken();
  const res = await fetch(`${API_BASE}/orders/customers/lookup`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    credentials: 'include',
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to fetch customer lookup');
  }
  const data = await res.json();
  return data.data || [];
};


/* ==========================================================================
   ADMIN DASHBOARD & PROFILE APIS
   ========================================================================== */

export const fetchAdminDashboardStats = async () => {
  const token = getAdminToken();
  const res = await fetch(`${API_BASE}/admin/dashboard`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    credentials: 'include',
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to fetch admin dashboard stats');
  }
  const data = await res.json();
  return data.data;
};

export const fetchAdminProfile = async () => {
  const token = getAdminToken();
  const res = await fetch(`${API_BASE}/auth/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    credentials: 'include',
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to fetch admin profile');
  }
  const data = await res.json();
  return data.user;
};

/**
 * Fetch advanced admin analytics with dynamic time range
 * GET /api/admin/analytics?range=...
 */
export const fetchAdminAnalytics = async (params = {}) => {
  const token = getAdminToken();
  const query = new URLSearchParams(params).toString();
  const res = await fetch(`${API_BASE}/admin/analytics${query ? `?${query}` : ''}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    credentials: 'include',
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to fetch admin analytics');
  }
  const data = await res.json();
  return data.data;
};

/* ==========================================================================
   PAYMENT & FINANCIAL MANAGEMENT APIS (Phase 5 / Admin)
   ========================================================================== */

export const fetchAdminPayments = async (params = {}) => {
  const token = getAdminToken();
  const query = new URLSearchParams(params).toString();
  const res = await fetch(`${API_BASE}/admin/payments${query ? `?${query}` : ''}`, {
    headers: { Authorization: `Bearer ${token}` },
    credentials: 'include',
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to fetch payments');
  }
  return await res.json();
};

export const recordManualPayment = async (data) => {
  const token = getAdminToken();
  const res = await fetch(`${API_BASE}/admin/payments/manual`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    credentials: 'include',
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to record manual payment');
  }
  return await res.json();
};

export const refundPayment = async (id, data = {}) => {
  const token = getAdminToken();
  const res = await fetch(`${API_BASE}/admin/payments/${id}/refund`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    credentials: 'include',
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to process refund');
  }
  return await res.json();
};

export const fetchPaymentConfig = async () => {
  const token = getAdminToken();
  const res = await fetch(`${API_BASE}/admin/payments/config`, {
    headers: { Authorization: `Bearer ${token}` },
    credentials: 'include',
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to fetch payment config');
  }
  return await res.json();
};

export const updatePaymentConfig = async (data) => {
  const token = getAdminToken();
  const res = await fetch(`${API_BASE}/admin/payments/config`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    credentials: 'include',
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to update payment config');
  }
  return await res.json();
};


/**
 * ==========================================================================
 * DYNAMIC CATEGORY MANAGEMENT APIS
 * ==========================================================================
 */
