"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { ProductDto } from "@/lib/api";

interface WishlistContextType {
  favorites: ProductDto[];
  favoriteIds: string[];
  isFavorite: (productId: string) => boolean;
  isInWishlist: (productId: string) => boolean;
  toggleFavorite: (product: ProductDto) => void;
  toggleWishlist: (productId: string) => void;
  favoritesCount: number;
}

const WishlistContext = createContext<WishlistContextType>({
  favorites: [],
  favoriteIds: [],
  isFavorite: () => false,
  isInWishlist: () => false,
  toggleFavorite: () => {},
  toggleWishlist: () => {},
  favoritesCount: 0,
});

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [favorites, setFavorites] = useState<ProductDto[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("lolo_wishlist_ids");
      if (stored) {
        setFavoriteIds(JSON.parse(stored));
      }
    } catch {
      // ignore
    }
  }, []);

  const saveIds = (ids: string[]) => {
    setFavoriteIds(ids);
    try {
      localStorage.setItem("lolo_wishlist_ids", JSON.stringify(ids));
    } catch {
      // ignore
    }
  };

  const isInWishlist = (productId: string) => favoriteIds.includes(productId);
  const isFavorite = isInWishlist;

  const toggleWishlist = (productId: string) => {
    if (favoriteIds.includes(productId)) {
      saveIds(favoriteIds.filter((id) => id !== productId));
    } else {
      saveIds([...favoriteIds, productId]);
    }
  };

  const toggleFavorite = (product: ProductDto) => {
    toggleWishlist(product.id);
  };

  return (
    <WishlistContext.Provider
      value={{
        favorites,
        favoriteIds,
        isFavorite,
        isInWishlist,
        toggleFavorite,
        toggleWishlist,
        favoritesCount: favoriteIds.length,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  return useContext(WishlistContext);
}
