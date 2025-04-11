import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CartItem = {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
};

type CartStore = {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;

  // Actions
  addItem: (item: Omit<CartItem, "id">) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
};

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      totalItems: 0,
      totalPrice: 0,

      addItem: (item) => {
        const { items } = get();
        const existingItem = items.find((i) => i.productId === item.productId);

        if (existingItem) {
          return get().updateQuantity(
            item.productId,
            existingItem.quantity + item.quantity
          );
        }

        const newItem = {
          id: crypto.randomUUID(),
          ...item,
        };

        set((state) => ({
          items: [...state.items, newItem],
          totalItems: state.totalItems + item.quantity,
          totalPrice: state.totalPrice + item.price * item.quantity,
        }));
      },

      removeItem: (productId) => {
        const { items } = get();
        const item = items.find((i) => i.productId === productId);

        if (!item) return;

        set((state) => ({
          items: state.items.filter((i) => i.productId !== productId),
          totalItems: state.totalItems - item.quantity,
          totalPrice: state.totalPrice - item.price * item.quantity,
        }));
      },

      updateQuantity: (productId, quantity) => {
        const { items } = get();
        const item = items.find((i) => i.productId === productId);

        if (!item) return;

        if (quantity <= 0) {
          return get().removeItem(productId);
        }

        const quantityDiff = quantity - item.quantity;

        set((state) => ({
          items: state.items.map((i) =>
            i.productId === productId ? { ...i, quantity } : i
          ),
          totalItems: state.totalItems + quantityDiff,
          totalPrice: state.totalPrice + item.price * quantityDiff,
        }));
      },

      clearCart: () => {
        set({
          items: [],
          totalItems: 0,
          totalPrice: 0,
        });
      },
    }),
    {
      name: "cart-storage",
    }
  )
);
