import { create } from 'zustand';
import {
  fetchWishlist,
  toggleWishlistApi,
  removeWishlistItem,
  syncWishlistApi,
} from '../services/api.js';
import { useAuthStore } from './authStore.js';

const GUEST_WISHLIST_KEY = 'shaadivibe_guest_wishlist';

const getGuestWishlistIds = () => {
  try {
    const raw = localStorage.getItem(GUEST_WISHLIST_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const setGuestWishlistIds = (ids) => {
  try {
    localStorage.setItem(GUEST_WISHLIST_KEY, JSON.stringify(ids));
  } catch {}
};

export const useWishlistStore = create((set, get) => ({
  items: [],
  itemIds: [],
  count: 0,
  isLoading: false,
  error: null,

  initWishlist: async () => {
    set({ isLoading: true, error: null });
    const isAuth = useAuthStore.getState().isAuthenticated;

    try {
      if (isAuth) {
        const guestIds = getGuestWishlistIds();
        if (guestIds.length > 0) {
          try {
            await syncWishlistApi(guestIds);
            localStorage.removeItem(GUEST_WISHLIST_KEY);
          } catch (syncErr) {
            console.warn('[WishlistStore] Failed to sync guest wishlist:', syncErr.message);
          }
        }
        const data = await fetchWishlist();
        const items = data.items || [];
        const itemIds = items.map((t) => t.slug || t.id || t._id);
        set({
          items,
          itemIds,
          count: items.length,
          isLoading: false,
        });
      } else {
        const guestIds = getGuestWishlistIds();
        if (guestIds.length > 0) {
          const data = await fetchWishlist(guestIds);
          const items = data.items || [];
          const itemIds = items.map((t) => t.slug || t.id || t._id);
          set({
            items,
            itemIds,
            count: items.length,
            isLoading: false,
          });
        } else {
          set({ items: [], itemIds: [], count: 0, isLoading: false });
        }
      }
    } catch (err) {
      set({ isLoading: false, error: err.message });
    }
  },

  toggleItem: async (theme) => {
    const id = theme.slug || theme.id || theme._id;
    if (!id) return;

    const isAuth = useAuthStore.getState().isAuthenticated;
    const isCurrentlyIn = get().itemIds.includes(id);

    if (isAuth) {
      set({ isLoading: true, error: null });
      try {
        const data = await toggleWishlistApi(id);
        if (data.wishlisted) {
          const updatedItems = [...get().items, theme];
          set({
            items: updatedItems,
            itemIds: [...get().itemIds, id],
            count: updatedItems.length,
            isLoading: false,
          });
        } else {
          const updatedItems = get().items.filter(
            (t) => (t.slug || t.id || t._id) !== id
          );
          set({
            items: updatedItems,
            itemIds: get().itemIds.filter((item) => item !== id),
            count: updatedItems.length,
            isLoading: false,
          });
        }
      } catch (err) {
        set({ isLoading: false, error: err.message });
        throw err;
      }
    } else {
      let guestIds = getGuestWishlistIds();
      if (isCurrentlyIn) {
        guestIds = guestIds.filter((item) => item !== id);
        setGuestWishlistIds(guestIds);
        const updatedItems = get().items.filter(
          (t) => (t.slug || t.id || t._id) !== id
        );
        set({
          items: updatedItems,
          itemIds: get().itemIds.filter((item) => item !== id),
          count: updatedItems.length,
        });
      } else {
        guestIds.push(id);
        setGuestWishlistIds(guestIds);
        const updatedItems = [...get().items, theme];
        set({
          items: updatedItems,
          itemIds: [...get().itemIds, id],
          count: updatedItems.length,
        });
      }
    }
  },

  removeItem: async (themeId) => {
    const isAuth = useAuthStore.getState().isAuthenticated;

    if (isAuth) {
      set({ isLoading: true, error: null });
      try {
        await removeWishlistItem(themeId);
        const updatedItems = get().items.filter(
          (t) => (t.slug || t.id || t._id) !== themeId
        );
        set({
          items: updatedItems,
          itemIds: get().itemIds.filter((id) => id !== themeId),
          count: updatedItems.length,
          isLoading: false,
        });
      } catch (err) {
        set({ isLoading: false, error: err.message });
        throw err;
      }
    } else {
      const guestIds = getGuestWishlistIds().filter((id) => id !== themeId);
      setGuestWishlistIds(guestIds);
      const updatedItems = get().items.filter(
        (t) => (t.slug || t.id || t._id) !== themeId
      );
      set({
        items: updatedItems,
        itemIds: get().itemIds.filter((id) => id !== themeId),
        count: updatedItems.length,
      });
    }
  },

  isInWishlist: (themeId) => {
    return get().itemIds.includes(themeId);
  },
}));
