import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { supabase } from "@/lib/supabaseClient";
import { useToast } from "@/hooks/use-toast";

interface CartItem {
  id: string;
  quantity: number;
  products: {
    id: string;
    name: string;
    price: number;
    image_url?: string;
    brand?: string;
    stock: number;
  };
}

const Cart = () => {
  const { toast } = useToast();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);

  // Ambil user aktif
  useEffect(() => {
    const fetchUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data.user) {
        setUserId(null);
        setLoading(false);
        return;
      }
      setUserId(data.user.id);
    };
    fetchUser();
  }, []);

  // Ambil isi keranjang dari Supabase
  useEffect(() => {
    const fetchCart = async () => {
      if (!userId) return;
      setLoading(true);

      const { data, error } = await supabase
        .from("cart_items")
        .select("id, quantity, products(*)")
        .eq("user_id", userId);

      if (error) {
        console.error("Gagal memuat cart:", error.message);
        toast({
          title: "Gagal memuat keranjang",
          description: error.message,
          variant: "destructive",
        });
      } else {
        setCartItems(data || []);
      }
      setLoading(false);
    };

    fetchCart();
  }, [userId]);

  const handleUpdateQuantity = async (itemId: string, newQty: number) => {
    if (newQty < 1) return;
    const { error } = await supabase
      .from("cart_items")
      .update({ quantity: newQty })
      .eq("id", itemId);

    if (error) {
      toast({
        title: "Gagal memperbarui jumlah",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setCartItems((prev) =>
        prev.map((item) =>
          item.id === itemId ? { ...item, quantity: newQty } : item
        )
      );
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    const { error } = await supabase.from("cart_items").delete().eq("id", itemId);
    if (error) {
      toast({
        title: "Gagal menghapus produk",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setCartItems((prev) => prev.filter((item) => item.id !== itemId));
    }
  };

  const subtotal = cartItems.reduce(
    (total, item) => total + item.products.price * item.quantity,
    0
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Memuat keranjang...</p>
      </div>
    );
  }

  if (!userId) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <p className="text-lg mb-4">
          Anda harus login terlebih dahulu untuk melihat keranjang.
        </p>
        <Link to="/login">
          <Button>Login Sekarang</Button>
        </Link>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <ShoppingBag className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold mb-2">Keranjang Kosong</h1>
          <p className="text-muted-foreground mb-6">
            Belum ada produk di keranjang Anda
          </p>
          <Link to="/">
            <Button size="lg">Mulai Belanja</Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header cartItemCount={cartItems.length} />

      <div className="container mx-auto px-4 py-8">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Lanjutkan Belanja
        </Link>

        <h1 className="text-3xl font-bold mb-8">Keranjang Belanja</h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => (
              <Card key={item.id}>
                <CardContent className="p-6 flex gap-4">
                  <img
                    src={item.products.image_url || "/placeholder.png"}
                    alt={item.products.name}
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1">
                      {item.products.name}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      {item.products.brand}
                    </p>
                    <p className="font-bold text-primary">
                      {formatPrice(item.products.price)}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveItem(item.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>

                    <div className="flex items-center gap-2 mt-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="w-8 h-8"
                        onClick={() =>
                          handleUpdateQuantity(item.id, item.quantity - 1)
                        }
                      >
                        <Minus className="w-3 h-3" />
                      </Button>
                      <span className="w-8 text-center font-medium">
                        {item.quantity}
                      </span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="w-8 h-8"
                        onClick={() =>
                          handleUpdateQuantity(item.id, item.quantity + 1)
                        }
                      >
                        <Plus className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Ringkasan Pesanan</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal ({cartItems.length} items)</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Ongkos Kirim</span>
                    <span className="text-green-600">GRATIS</span>
                  </div>
                </div>

                <Separator />

                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span className="text-primary">{formatPrice(subtotal)}</span>
                </div>

                <Link to="/checkout">
                  <Button className="w-full" size="lg">
                    Lanjut ke Pembayaran
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Cart;
