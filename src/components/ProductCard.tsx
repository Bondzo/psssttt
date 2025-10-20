import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Eye, Heart } from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabaseClient"; // pastikan path benar
import { Product } from "@/types/product"; // pastikan Product sudah sesuai schema Supabase

interface ProductCardProps {
  product: Product;
}

export const ProductCard = ({ product }: ProductCardProps) => {
  const { toast } = useToast();

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);

  const handleAddToCart = async () => {
    try {
      // Ambil user aktif
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        toast({
          title: "Gagal",
          description: "Anda harus login terlebih dahulu",
          variant: "destructive",
        });
        return;
      }

      // Cek apakah produk sudah ada di keranjang
      const { data: existing, error: selectError } = await supabase
        .from("cart_items")
        .select("id, quantity")
        .eq("user_id", user.id)
        .eq("product_id", product.id)
        .maybeSingle(); // lebih aman daripada .single()

      if (selectError) throw selectError;

      if (existing) {
        // Update quantity
        const { error: updateError } = await supabase
          .from("cart_items")
          .update({ quantity: existing.quantity + 1 })
          .eq("id", existing.id);

        if (updateError) throw updateError;
      } else {
        // Tambah item baru
        const { error: insertError } = await supabase.from("cart_items").insert([
          {
            user_id: user.id,
            product_id: product.id,
            quantity: 1,
          },
        ]);
        if (insertError) throw insertError;
      }

      toast({
        title: "Berhasil",
        description: `${product.name} ditambahkan ke keranjang`,
      });
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Gagal menambahkan ke keranjang",
        variant: "destructive",
      });
    }
  };

  // Logika stok dan gambar
  const inStock = product.stock > 0;
  const imageSrc = product.image_url || "/placeholder.png"; // fallback bila kosong

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-card">
      <CardContent className="p-0">
        <div className="relative overflow-hidden rounded-t-lg">
          {/* Gambar produk */}
          <img
            src={imageSrc}
            alt={product.name}
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
          />

          {/* Badge stok habis */}
          {!inStock && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <Badge variant="destructive">Stok Habis</Badge>
            </div>
          )}

          {/* Tombol cepat (like & view) */}
          <div className="absolute top-2 right-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button size="icon" variant="secondary" className="w-8 h-8">
              <Heart className="w-4 h-4" />
            </Button>
            <Link to={`/product/${product.id}`}>
              <Button size="icon" variant="secondary" className="w-8 h-8">
                <Eye className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Detail produk */}
        <div className="p-4">
          {product.category && (
            <Badge variant="outline" className="text-xs mb-2 capitalize">
              {product.category}
            </Badge>
          )}
          <h3 className="font-semibold text-sm mb-1 line-clamp-2 text-card-foreground">
            {product.name}
          </h3>
          <p className="font-bold text-lg text-primary">{formatPrice(product.price)}</p>
        </div>
      </CardContent>

      {/* Tombol keranjang */}
      <CardFooter className="p-4 pt-0">
        <Button
          onClick={handleAddToCart}
          disabled={!inStock}
          className="w-full"
          size="sm"
        >
          <ShoppingCart className="w-4 h-4 mr-2" />
          {inStock ? "Tambah ke Keranjang" : "Stok Habis"}
        </Button>
      </CardFooter>
    </Card>
  );
};
