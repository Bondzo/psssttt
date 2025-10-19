import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useToast } from "@/hooks/use-toast";
import { useCartContext } from "@/components/cart-context";

const Cart = () => {
  const { toast } = useToast();
  const {
    cart,
    isLoading,
    isAuthenticated,
    updateQuantity,
    removeFromCart,
  } = useCartContext();

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);

  const handleUpdateQuantity = async (productId: string, newQty: number) => {
    try {
      await updateQuantity(productId, newQty);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Terjadi kesalahan";
      toast({
        title: "Gagal memperbarui jumlah",
        description: message,
        variant: "destructive",
      });
    }
  };

  const handleRemoveItem = async (productId: string) => {
    try {
      await removeFromCart(productId);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Terjadi kesalahan";
      toast({
        title: "Gagal menghapus produk",
        description: message,
        variant: "destructive",
      });
    }
  };

  const subtotal = cart.total;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Memuat keranjang...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
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

  if (cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Header cartItemCount={cart.itemCount} />
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
      <Header cartItemCount={cart.itemCount} />

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
            {cart.items.map((item) => (
              <Card key={item.product.id}>
                <CardContent className="p-6 flex gap-4">
                  <img
                    src={
                      item.product.image_url ||
                      item.product.image ||
                      "/placeholder.png"
                    }
                    alt={item.product.name}
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1">
                      {item.product.name}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      {item.product.brand}
                    </p>
                    <p className="font-bold text-primary">
                      {formatPrice(item.product.price)}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveItem(item.product.id)}
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
                          handleUpdateQuantity(item.product.id, item.quantity - 1)
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
                          handleUpdateQuantity(item.product.id, item.quantity + 1)
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
                    <span>Subtotal ({cart.items.length} items)</span>
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
