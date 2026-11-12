import { create } from 'zustand';
import {
  fetchCart,
  addCartItem,
  removeCartItem,
  syncCartApi,
  clearCartApi,
} from '../services/api.js';
import { useAuthStore } from './authStore.js';

const GUEST_CART_KEY = 'shaadivibe_guest_cart';

const getGuestCartIds = () => {
  try {
    const raw = localStorage.getItem(GUEST_CART_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const setGuestCartIds = (ids) => {
  try {
    localStorage.setItem(GUEST_CART_KEY, JSON.stringify(ids));
  } catch {}
};

export const useCartStore = create((set, get) => ({
  items: [],
  itemIds: [],
  subtotal: 0,
  count: 0,
  isLoading: false,
  error: null,

  initCart: async () => {
    set({ isLoading: true, error: null });
    const isAuth = useAuthStore.getState().isAuthenticated;

    try {
      if (isAuth) {
        const guestIds = getGuestCartIds();
        if (guestIds.length > 0) {
          try {
            await syncCartApi(guestIds);
            localStorage.removeItem(GUEST_CART_KEY);
          } catch (syncErr) {
            console.warn('[CartStore] Failed to sync guest cart:', syncErr.message);
          }
        }
        const data = await fetchCart();
        const items = data.items || [];
        const itemIds = items.map((t) => t.slug || t.id || t._id);
        set({
          items,
          itemIds,
          subtotal: data.subtotal || 0,
          count: items.length,
          isLoading: false,
        });
      } else {
        const guestIds = getGuestCartIds();
        if (guestIds.length > 0) {
          const data = await fetchCart(guestIds);
          const items = data.items || [];
          const itemIds = items.map((t) => t.slug || t.id || t._id);
          set({
            items,
            itemIds,
            subtotal: data.subtotal || 0,
            count: items.length,
            isLoading: false,
          });
        } else {
          set({ items: [], itemIds: [], subtotal: 0, count: 0, isLoading: false });
        }
      }
    } catch (err) {
      set({ isLoading: false, error: err.message });
    }
  },

  addItem: async (theme) => {
    const id = theme.slug || theme.id || theme._id;
    if (!id) return;

    if (get().itemIds.includes(id)) {
      return; // Prevent duplicate
    }

    const isAuth = useAuthStore.getState().isAuthenticated;

    if (isAuth) {
      set({ isLoading: true, error: null });
      try {
        const data = await addCartItem(id);
        const items = data.items || [];
        const itemIds = items.map((t) => t.slug || t.id || t._id);
        set({
          items,
          itemIds,
          subtotal: data.subtotal || 0,
          count: items.length,
          isLoading: false,
        });
      } catch (err) {
        set({ isLoading: false, error: err.message });
        throw err;
      }
    } else {
      const guestIds = getGuestCartIds();
      if (!guestIds.includes(id)) {
        guestIds.push(id);
        setGuestCartIds(guestIds);
      }
      const updatedItems = [...get().items, theme];
      const subtotal = updatedItems.reduce(
        (sum, t) => sum + (Number(t.priceDisplay) || 0),
        0
      );
      set({
        items: updatedItems,
        itemIds: [...get().itemIds, id],
        subtotal,
        count: updatedItems.length,
      });
    }
  },

  removeItem: async (themeId) => {
    const isAuth = useAuthStore.getState().isAuthenticated;

    if (isAuth) {
      set({ isLoading: true, error: null });
      try {
        const data = await removeCartItem(themeId);
        const items = data.items || [];
        const itemIds = items.map((t) => t.slug || t.id || t._id);
        set({
          items,
          itemIds,
          subtotal: data.subtotal || 0,
          count: items.length,
          isLoading: false,
        });
      } catch (err) {
        set({ isLoading: false, error: err.message });
        throw err;
      }
    } else {
      const guestIds = getGuestCartIds().filter((id) => id !== themeId);
      setGuestCartIds(guestIds);
      const updatedItems = get().items.filter(
        (t) => (t.slug || t.id || t._id) !== themeId
      );
      const subtotal = updatedItems.reduce(
        (sum, t) => sum + (Number(t.priceDisplay) || 0),
        0
      );
      set({
        items: updatedItems,
        itemIds: get().itemIds.filter((id) => id !== themeId),
        subtotal,
        count: updatedItems.length,
      });
    }
  },

  clearCart: async () => {
    const isAuth = useAuthStore.getState().isAuthenticated;
    if (isAuth) {
      try {
        await clearCartApi();
      } catch {}
    } else {
      localStorage.removeItem(GUEST_CART_KEY);
    }
    set({ items: [], itemIds: [], subtotal: 0, count: 0 });
  },

  isInCart: (themeId) => {
    return get().itemIds.includes(themeId);
  },
}));
