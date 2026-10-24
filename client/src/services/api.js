import { defaultThemes, sampleInvitation, defaultSiteContent } from '../../../shared/constants/mockData.js';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

/**
 * Helper to get Auth token from localStorage (supports customer or admin)
 */
export const getAuthToken = () => {
  return (
    localStorage.getItem('shaadivibe_customer_token') ||
    localStorage.getItem('shaadivibe_admin_token') ||
    ''
  );
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
