import { useState, useCallback, useEffect } from "react";
import { Product, CartItem, CartState } from "@/types/product";
import { supabase } from "@/lib/supabaseClient";

interface UseCartReturn {
  cart: CartState;
  isLoading: boolean;
  isAuthenticated: boolean;
  addToCart: (product: Product, quantity?: number) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
}

export const useCart = (): UseCartReturn => {
  const [cart, setCart] = useState<CartState>({
    items: [],
    total: 0,
    itemCount: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  const calculateTotal = useCallback((items: CartItem[]) => {
    const total = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
    return { total, itemCount };
  }, []);

  const setCartFromItems = useCallback(
    (items: CartItem[]) => {
      const { total, itemCount } = calculateTotal(items);
      setCart({ items, total, itemCount });
    },
    [calculateTotal]
  );

  const fetchCart = useCallback(
    async (targetUserId: string | null) => {
      if (!targetUserId) {
        setCartFromItems([]);
        return;
      }

      const { data, error } = await supabase
        .from("cart_items")
        .select("quantity, products(*)")
        .eq("user_id", targetUserId);

      if (error) {
        console.error("Gagal memuat cart:", error.message);
        setCartFromItems([]);
        throw new Error(error.message);
      }

      const items: CartItem[] = (data ?? [])
        .filter((item): item is { quantity: number; products: Product & { image?: string } } => !!item.products)
        .map(({ quantity, products }) => {
          const productWithImages: Product = {
            ...products,
            image_url: products.image_url ?? products.image,
            image: products.image ?? products.image_url,
          };

          return {
            product: productWithImages,
            quantity,
          };
        });

      setCartFromItems(items);
    },
    [setCartFromItems]
  );

  useEffect(() => {
    let isMounted = true;

    const loadUserAndCart = async () => {
      setIsLoading(true);
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (!isMounted) return;

      if (error) {
        console.error("Gagal mengambil user:", error.message);
        setUserId(null);
        setCartFromItems([]);
        setIsLoading(false);
        return;
      }

      const currentUserId = user?.id ?? null;
      setUserId(currentUserId);

      try {
        await fetchCart(currentUserId);
      } catch (err) {
        console.error(err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadUserAndCart();

    const { data: subscription } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const newUserId = session?.user?.id ?? null;
      setUserId(newUserId);
      try {
        await fetchCart(newUserId);
      } catch (err) {
        console.error(err);
      }
    });

    return () => {
      isMounted = false;
      subscription.subscription.unsubscribe();
    };
  }, [fetchCart, setCartFromItems]);

  const ensureAuthenticated = useCallback(() => {
    if (!userId) {
      throw new Error("Anda harus login terlebih dahulu");
    }
    return userId;
  }, [userId]);

  const addToCart = useCallback<UseCartReturn["addToCart"]>(
    async (product, quantity = 1) => {
      const currentUserId = ensureAuthenticated();

      const { data: existing, error: selectError } = await supabase
        .from("cart_items")
        .select("id, quantity")
        .eq("user_id", currentUserId)
        .eq("product_id", product.id)
        .maybeSingle();

      if (selectError) {
        throw new Error(selectError.message);
      }

      if (existing) {
        const { error: updateError } = await supabase
          .from("cart_items")
          .update({ quantity: existing.quantity + quantity })
          .eq("id", existing.id);

        if (updateError) {
          throw new Error(updateError.message);
        }
      } else {
        const { error: insertError } = await supabase.from("cart_items").insert([
          {
            user_id: currentUserId,
            product_id: product.id,
            quantity,
          },
        ]);

        if (insertError) {
          throw new Error(insertError.message);
        }
      }

      await fetchCart(currentUserId);
    },
    [ensureAuthenticated, fetchCart]
  );

  const removeFromCart = useCallback<UseCartReturn["removeFromCart"]>(
    async (productId) => {
      const currentUserId = ensureAuthenticated();

      const { error } = await supabase
        .from("cart_items")
        .delete()
        .eq("user_id", currentUserId)
        .eq("product_id", productId);

      if (error) {
        throw new Error(error.message);
      }

      await fetchCart(currentUserId);
    },
    [ensureAuthenticated, fetchCart]
  );

  const updateQuantity = useCallback<UseCartReturn["updateQuantity"]>(
    async (productId, quantity) => {
      if (quantity <= 0) {
        await removeFromCart(productId);
        return;
      }

      const currentUserId = ensureAuthenticated();

      const { error } = await supabase
        .from("cart_items")
        .update({ quantity })
        .eq("user_id", currentUserId)
        .eq("product_id", productId);

      if (error) {
        throw new Error(error.message);
      }

      await fetchCart(currentUserId);
    },
    [ensureAuthenticated, fetchCart, removeFromCart]
  );

  const clearCart = useCallback<UseCartReturn["clearCart"]>(
    async () => {
      if (!userId) {
        setCartFromItems([]);
        return;
      }

      const { error } = await supabase
        .from("cart_items")
        .delete()
        .eq("user_id", userId);

      if (error) {
        throw new Error(error.message);
      }

      setCartFromItems([]);
    },
    [setCartFromItems, userId]
  );

  const refreshCart = useCallback(async () => {
    await fetchCart(userId);
  }, [fetchCart, userId]);

  return {
    cart,
    isLoading,
    isAuthenticated: !!userId,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    refreshCart,
  } satisfies UseCartReturn;
};
