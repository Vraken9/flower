import { create } from "zustand";
import type { CartItem, Product } from "@/lib/types";

interface CartState {
  items: CartItem[];
  isLoaded: boolean;
  addItem: (product: Product) => void;
  addItemWithAuth: (product: Product, isAuthenticated: boolean) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: () => number;
  totalPrice: () => number;
  loadFromServer: () => Promise<void>;
  syncAddToServer: (productId: string, quantity: number) => Promise<void>;
  syncRemoveFromServer: (productId: string) => Promise<void>;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  isLoaded: false,

  // Load cart from server (call on login / mount)
  loadFromServer: async () => {
    try {
      const res = await fetch("/api/cart", { credentials: "include" });
      if (!res.ok) return;
      const data = await res.json();
      if (data.success && Array.isArray(data.items)) {
        // data.items => { id, product_id, qty, products: { ... } }
        const items: CartItem[] = data.items.map((ci: Record<string, unknown>) => ({
          product: ci.products as Product,
          quantity: (ci.qty as number) || 1,
        }));
        set({ items, isLoaded: true });
      }
    } catch {
      // silently fail — keep local state
    }
  },

  // Sync single add to server
  syncAddToServer: async (productId: string, quantity: number) => {
    try {
      await fetch("/api/cart", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product_id: productId, qty: quantity }),
      });
    } catch {
      // silently fail
    }
  },

  // Sync remove from server
  syncRemoveFromServer: async (productId: string) => {
    try {
      await fetch(`/api/cart?product_id=${productId}`, {
        method: "DELETE",
        credentials: "include",
      });
    } catch {
      // silently fail
    }
  },

  addItem: (product) =>
    set((state) => {
      const existing = state.items.find(
        (item) => item.product.id === product.id
      );
      if (existing) {
        const newQty = existing.quantity + 1;
        // Sync to server
        get().syncAddToServer(product.id, newQty);
        return {
          items: state.items.map((item) =>
            item.product.id === product.id
              ? { ...item, quantity: newQty }
              : item
          ),
        };
      }
      // Sync to server
      get().syncAddToServer(product.id, 1);
      return { items: [...state.items, { product, quantity: 1 }] };
    }),

  addItemWithAuth: (product, isAuthenticated) => {
    if (!isAuthenticated) {
      // Redirect to login page
      window.location.href = '/auth/login';
      return;
    }
    
    // Add item to cart if authenticated
    get().addItem(product);
  },

  removeItem: (productId) => {
    get().syncRemoveFromServer(productId);
    set((state) => ({
      items: state.items.filter((item) => item.product.id !== productId),
    }));
  },

  updateQuantity: (productId, quantity) => {
    if (quantity <= 0) {
      get().syncRemoveFromServer(productId);
    } else {
      get().syncAddToServer(productId, quantity);
    }
    set((state) => ({
      items:
        quantity <= 0
          ? state.items.filter((item) => item.product.id !== productId)
          : state.items.map((item) =>
              item.product.id === productId ? { ...item, quantity } : item
            ),
    }));
  },

  clearCart: () => {
    // Remove each from server
    const items = get().items;
    items.forEach((item) => get().syncRemoveFromServer(item.product.id));
    set({ items: [] });
  },

  totalItems: () =>
    get().items.reduce((total, item) => total + item.quantity, 0),

  totalPrice: () =>
    get().items.reduce(
      (total, item) => total + item.product.price * item.quantity,
      0
    ),
}));
