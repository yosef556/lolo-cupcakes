"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { CartDto, getOrCreateCart, addItemToCart as apiAddItem, removeItemFromCart as apiRemoveItem } from "@/lib/api";

interface CartContextType {
  cart: CartDto | null;
  loading: boolean;
  isDrawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  addToCart: (
    item: {
      productId: string;
      variantId?: string | null;
      quantity: number;
      selectedOptionValueIds?: string[];
      selectedAddonIds?: string[];
      customerNote?: string;
    },
    openDrawer?: boolean
  ) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const CART_TOKEN_KEY = "lolo_cart_token";

  useEffect(() => {
    const savedToken = typeof window !== "undefined" ? localStorage.getItem(CART_TOKEN_KEY) || undefined : undefined;
    getOrCreateCart(savedToken)
      .then((c) => {
        setCart(c);
        if (typeof window !== "undefined") {
          localStorage.setItem(CART_TOKEN_KEY, c.cartToken);
        }
      })
      .catch((err) => console.error("فشل استرجاع السلة", err))
      .finally(() => setLoading(false));
  }, []);

  const refreshCart = async () => {
    if (!cart?.cartToken) return;
    try {
      const updated = await getOrCreateCart(cart.cartToken);
      setCart(updated);
    } catch (err) {
      console.error(err);
    }
  };

  const addToCart = async (
    item: {
      productId: string;
      variantId?: string | null;
      quantity: number;
      selectedOptionValueIds?: string[];
      selectedAddonIds?: string[];
      customerNote?: string;
    },
    openDrawer: boolean = true
  ) => {
    if (!cart?.cartToken) {
      const newCart = await getOrCreateCart();
      setCart(newCart);
      localStorage.setItem(CART_TOKEN_KEY, newCart.cartToken);
      const updated = await apiAddItem(newCart.cartToken, item);
      setCart(updated);
    } else {
      const updated = await apiAddItem(cart.cartToken, item);
      setCart(updated);
    }
    if (openDrawer) {
      setIsDrawerOpen(true);
    }
  };

  const removeFromCart = async (itemId: string) => {
    if (!cart?.cartToken) return;
    const updated = await apiRemoveItem(cart.cartToken, itemId);
    setCart(updated);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        isDrawerOpen,
        openDrawer: () => setIsDrawerOpen(true),
        closeDrawer: () => setIsDrawerOpen(false),
        addToCart,
        removeFromCart,
        refreshCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
