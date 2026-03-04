import { create } from "zustand";
import type { CartItem, Product } from "@/lib/types";

interface CartState {
  items: CartItem[];
  addItem: (product: Product) => void;
  addItemWithAuth: (product: Product, isAuthenticated: boolean) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: () => number;
  totalPrice: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],

  addItem: (product) =>
    set((state) => {
      const existing = state.items.find(
        (item) => item.product.id === product.id
      );
      if (existing) {
        return {
          items: state.items.map((item) =>
            item.product.id === product.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          ),
        };
      }
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

  removeItem: (productId) =>
    set((state) => ({
      items: state.items.filter((item) => item.product.id !== productId),
    })),

  updateQuantity: (productId, quantity) =>
    set((state) => ({
      items:
        quantity <= 0
          ? state.items.filter((item) => item.product.id !== productId)
          : state.items.map((item) =>
              item.product.id === productId ? { ...item, quantity } : item
            ),
    })),

  clearCart: () => set({ items: [] }),

  totalItems: () =>
    get().items.reduce((total, item) => total + item.quantity, 0),

  totalPrice: () =>
    get().items.reduce(
      (total, item) => total + item.product.price * item.quantity,
      0
    ),
}));
