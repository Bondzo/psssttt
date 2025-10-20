import { useState, useCallback } from "react";
import { Product, CartItem, CartState } from "@/types/product";

export const useCart = () => {
  const [cart, setCart] = useState<CartState>({
    items: [],
    total: 0,
    itemCount: 0,
  });

  const calculateTotal = useCallback((items: CartItem[]) => {
    const total = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
    return { total, itemCount };
  }, []);

  const addToCart = useCallback(
    (product: Product, quantity: number = 1) => {
      setCart(prevCart => {
        const existingItem = prevCart.items.find(item => item.product.id === product.id);

        let newItems: CartItem[];
        if (existingItem) {
          newItems = prevCart.items.map(item =>
            item.product.id === product.id ? { ...item, quantity: item.quantity + quantity } : item
          );
        } else {
          newItems = [...prevCart.items, { product, quantity }];
        }

        const { total, itemCount } = calculateTotal(newItems);
        return { items: newItems, total, itemCount };
      });
    },
    [calculateTotal]
  );

  const removeFromCart = useCallback(
    (productId: string) => {
      setCart(prevCart => {
        const newItems = prevCart.items.filter(item => item.product.id !== productId);
        const { total, itemCount } = calculateTotal(newItems);
        return { items: newItems, total, itemCount };
      });
    },
    [calculateTotal]
  );

  const updateQuantity = useCallback(
    (productId: string, quantity: number) => {
      setCart(prevCart => {
        let newItems: CartItem[];
        if (quantity <= 0) {
          newItems = prevCart.items.filter(item => item.product.id !== productId);
        } else {
          newItems = prevCart.items.map(item =>
            item.product.id === productId ? { ...item, quantity } : item
          );
        }
        const { total, itemCount } = calculateTotal(newItems);
        return { items: newItems, total, itemCount };
      });
    },
    [calculateTotal]
  );

  const clearCart = useCallback(() => {
    setCart({ items: [], total: 0, itemCount: 0 });
  }, []);

  return { cart, addToCart, removeFromCart, updateQuantity, clearCart };
};
