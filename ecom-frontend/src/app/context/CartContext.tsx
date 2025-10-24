"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";

type CartItem = {
  id: number;
  productId: number;
  quantity: number;
  product: {
    id: number;
    name: string;
    price: number;
    images?: { url: string }[];
  };
};

type CartContextType = {
  cartItems: CartItem[];
  totalItems: number;
  fetchCart: () => Promise<void>;
  addToCart: (product: any, quantity?: number) => Promise<void>;
  removeFromCart: (productId: number) => Promise<void>;
  updateQuantity: (productId: number, quantity: number) => Promise<void>;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { token } = useAuth();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  // Add localStorage support
  const fetchCart = async () => {
    if (token) {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/cart`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          setCartItems(await res.json());
        }
      } catch (err) {
        console.error(err);
      }
    } else {
      const guestCart = JSON.parse(localStorage.getItem("guest_cart") || "[]");
      setCartItems(
        guestCart.map((item: any, index: number) => ({
          ...item,
          id: item.id || index,
          quantity: Number(item.quantity) || 1,
        }))
      );
    }
  };

  // Add to cart (works for logged in + guest)
  const addToCart = async (product: any, quantity: number = 1) => {
    if (token) {
      // Logged-in user → save to backend
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/cart`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ productId: product.id, quantity }),
      });
      await fetchCart();
    } else {
      // Guest user → save in localStorage
      const guestCart = JSON.parse(localStorage.getItem("guest_cart") || "[]");

      const index = guestCart.findIndex((i: any) => i.productId === product.id);
      if (index > -1) {
        guestCart[index].quantity += quantity;
      } else {
        guestCart.push({
          id: Date.now(),
          productId: product.id,
          quantity,
          product: {
            id: product.id,
            name: product.name,
            price: Number(product.price),
            images: product.images?.length
              ? product.images
              : [{ url: product.imageUrl || "/placeholder.png" }],
          },
        });
      }

      localStorage.setItem("guest_cart", JSON.stringify(guestCart));
      setCartItems(guestCart);
    }
  };

  // Remove from cart
  const removeFromCart = async (productId: number) => {
    if (token) {
      // Logged-in user
      try {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/cart/${productId}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });
        await fetchCart();
      } catch (error) {
        console.error(error);
      }
    } else {
      // Guest user
      let guestCart = JSON.parse(localStorage.getItem("guest_cart") || "[]");
      guestCart = guestCart.filter((i: any) => i.productId !== productId);
      localStorage.setItem("guest_cart", JSON.stringify(guestCart));
      setCartItems(guestCart);
    }
  };

  // Update quantity
  const updateQuantity = async (productId: number, quantity: number) => {
    if (token) {
      // Logged-in user
      try {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/cart/${productId}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ quantity }),
        });
        await fetchCart();
      } catch (error) {
        console.error(error);
      }
    } else {
      // Guest user
      const guestCart = JSON.parse(localStorage.getItem("guest_cart") || "[]");
      const index = guestCart.findIndex((i: any) => i.productId === productId);
      if (index > -1) {
        guestCart[index].quantity = quantity;
      }
      localStorage.setItem("guest_cart", JSON.stringify(guestCart));
      setCartItems(guestCart);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [token]);

  const totalItems = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        totalItems,
        fetchCart,
        addToCart,
        removeFromCart,
        updateQuantity,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
}
