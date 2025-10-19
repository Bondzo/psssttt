import { useState, useCallback, useEffect } from "react";
import { Product, CartItem, CartState } from "@/types/product";
import { supabase } from "@/lib/supabaseClient";

const LOCAL_STORAGE_KEY = "fixgear_cart";

const computeTotals = (items: CartItem[]) => {
  const total = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  return { total, itemCount };
};

const readLocalItems = (): CartItem[] => {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed.filter(
      (item): item is CartItem =>
        typeof item === "object" &&
        item !== null &&
        "product" in item &&
        typeof item.quantity === "number"
    );
  } catch (error) {
    console.error("Gagal membaca cart lokal:", error);
    return [];
  }
};

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
  const [cart, setCart] = useState<CartState>(() => {
    const items = readLocalItems();
    const { total, itemCount } = computeTotals(items);
    return { items, total, itemCount };
  });
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  const setCartSafely = useCallback(
    (next: CartItem[] | ((prev: CartItem[]) => CartItem[])) => {
      setCart((prevCart) => {
        const nextItems =
          typeof next === "function"
            ? (next as (prevItems: CartItem[]) => CartItem[])(prevCart.items)
            : next;

        const sanitizedItems = nextItems.filter(
          (item): item is CartItem =>
            typeof item === "object" &&
            item !== null &&
            "product" in item &&
            typeof item.quantity === "number"
        );

        if (typeof window !== "undefined") {
          window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(sanitizedItems));
        }

        const { total, itemCount } = computeTotals(sanitizedItems);
        return { items: sanitizedItems, total, itemCount };
      });
    },
    []
  );

  const setCartFromItems = useCallback(
    (items: CartItem[]) => {
      setCartSafely(items);
    },
    [setCartSafely]
  );

  const updateLocalCart = useCallback(
    (updater: (items: CartItem[]) => CartItem[]) => {
      setCartSafely(updater);
    },
    [setCartSafely]
  );

  const fetchCart = useCallback(
    async (targetUserId: string | null) => {
      if (!targetUserId) {
        return;
      }

      try {
        const { data, error } = await supabase
          .from("cart_items")
          .select("quantity, products(*)")
          .eq("user_id", targetUserId);

        if (error) {
          throw new Error(error.message);
        }

        const items: CartItem[] = (data ?? [])
          .filter(
            (item): item is { quantity: number; products: Product & { image?: string } } =>
              !!item.products
          )
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
      } catch (error) {
        console.error("Gagal memuat cart:", error);
        throw error;
      }
    },
    [setCartFromItems]
  );

  useEffect(() => {
    let isMounted = true;

    const loadUserAndCart = async () => {
      setIsLoading(true);

      try {
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser();

        if (!isMounted) return;

        if (error) {
          throw error;
        }

        const currentUserId = user?.id ?? null;
        setUserId(currentUserId);

        if (currentUserId) {
          try {
            await fetchCart(currentUserId);
          } catch (err) {
            console.error("Gagal memuat cart pengguna:", err);
          }
        }
      } catch (error) {
        if (isMounted) {
          console.error("Gagal mengambil user:", error);
          setUserId(null);
          setCartFromItems(readLocalItems());
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadUserAndCart();

    let unsubscribe: (() => void) | undefined;

    try {
      const { data: subscription } = supabase.auth.onAuthStateChange(
        async (_event, session) => {
          const newUserId = session?.user?.id ?? null;
          setUserId(newUserId);

          if (newUserId) {
            try {
              await fetchCart(newUserId);
            } catch (err) {
              console.error("Gagal menyinkronkan cart:", err);
            }
          } else {
            setCartFromItems(readLocalItems());
          }
        }
      );

      unsubscribe = () => subscription.subscription.unsubscribe();
    } catch (error) {
      console.error("Gagal mendaftarkan listener auth:", error);
    }

    return () => {
      isMounted = false;
      unsubscribe?.();
    };
  }, [fetchCart, setCartFromItems]);

  const addToCart = useCallback<UseCartReturn["addToCart"]>(
    async (product, quantity = 1) => {
      const updateLocal = () =>
        updateLocalCart((items) => {
          const existingItem = items.find((item) => item.product.id === product.id);

          if (existingItem) {
            return items.map((item) =>
              item.product.id === product.id
                ? { ...item, quantity: item.quantity + quantity }
                : item
            );
          }

          return [...items, { product, quantity }];
        });

      if (!userId) {
        updateLocal();
        return;
      }

      try {
        const { data: existing, error: selectError } = await supabase
          .from("cart_items")
          .select("id, quantity")
          .eq("user_id", userId)
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
              user_id: userId,
              product_id: product.id,
              quantity,
            },
          ]);

          if (insertError) {
            throw new Error(insertError.message);
          }
        }

        await fetchCart(userId);
      } catch (error) {
        console.error("Gagal menyinkronkan cart ke server:", error);
        updateLocal();
      }
    },
    [fetchCart, updateLocalCart, userId]
  );

  const removeFromCart = useCallback<UseCartReturn["removeFromCart"]>(
    async (productId) => {
      const removeLocal = () =>
        updateLocalCart((items) => items.filter((item) => item.product.id !== productId));

      if (!userId) {
        removeLocal();
        return;
      }

      try {
        const { error } = await supabase
          .from("cart_items")
          .delete()
          .eq("user_id", userId)
          .eq("product_id", productId);

        if (error) {
          throw new Error(error.message);
        }

        await fetchCart(userId);
      } catch (error) {
        console.error("Gagal menghapus item dari server:", error);
        removeLocal();
      }
    },
    [fetchCart, updateLocalCart, userId]
  );

  const updateQuantity = useCallback<UseCartReturn["updateQuantity"]>(
    async (productId, quantity) => {
      if (quantity <= 0) {
        await removeFromCart(productId);
        return;
      }

      const updateLocal = () =>
        updateLocalCart((items) =>
          items.map((item) =>
            item.product.id === productId ? { ...item, quantity } : item
          )
        );

      if (!userId) {
        updateLocal();
        return;
      }

      try {
        const { error } = await supabase
          .from("cart_items")
          .update({ quantity })
          .eq("user_id", userId)
          .eq("product_id", productId);

        if (error) {
          throw new Error(error.message);
        }

        await fetchCart(userId);
      } catch (error) {
        console.error("Gagal memperbarui jumlah di server:", error);
        updateLocal();
      }
    },
    [fetchCart, removeFromCart, updateLocalCart, userId]
  );

  const clearCart = useCallback<UseCartReturn["clearCart"]>(
    async () => {
      const clearLocal = () => setCartFromItems([]);

      if (!userId) {
        clearLocal();
        return;
      }

      try {
        const { error } = await supabase
          .from("cart_items")
          .delete()
          .eq("user_id", userId);

        if (error) {
          throw new Error(error.message);
        }

        clearLocal();
      } catch (error) {
        console.error("Gagal mengosongkan cart di server:", error);
        clearLocal();
      }
    },
    [setCartFromItems, userId]
  );

  const refreshCart = useCallback(async () => {
    if (!userId) {
      setCartFromItems(readLocalItems());
      return;
    }

    try {
      await fetchCart(userId);
    } catch (error) {
      console.error("Gagal menyegarkan cart:", error);
    }
  }, [fetchCart, setCartFromItems, userId]);

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
