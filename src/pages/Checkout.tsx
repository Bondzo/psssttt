import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ArrowLeft, CreditCard, Truck, MapPin } from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { useToast } from '@/hooks/use-toast';
import { useCartContext } from '@/components/cart-context';

const Checkout = () => {
  const { cart, clearCart } = useCartContext();
  const { toast } = useToast();
  const [paymentMethod, setPaymentMethod] = useState('transfer');
  const [shippingMethod, setShippingMethod] = useState('regular');

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleSubmitOrder = async () => {
    try {
      toast({
        title: "Pesanan Berhasil!",
        description: "Terima kasih atas pesanan Anda. Kami akan segera memproses pesanan Anda.",
      });
      await clearCart();
      // Redirect to success page or order confirmation
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Gagal membersihkan keranjang';
      toast({
        title: 'Gagal',
        description: message,
        variant: 'destructive',
      });
    }
  };

  const shippingCost = shippingMethod === 'express' ? 25000 : 0;
  const totalWithShipping = cart.total + shippingCost;

  return (
    <div className="min-h-screen bg-background">
      <Header cartItemCount={cart.itemCount} />
      
      <div className="container mx-auto px-4 py-8">
        <Link to="/cart" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Keranjang
        </Link>

        <h1 className="text-3xl font-bold mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Checkout Form */}
          <div className="space-y-6">
            {/* Shipping Address */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Alamat Pengiriman
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">Nama Depan</Label>
                    <Input id="firstName" placeholder="John" />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Nama Belakang</Label>
                    <Input id="lastName" placeholder="Doe" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="phone">Nomor Telepon</Label>
                  <Input id="phone" placeholder="08123456789" />
                </div>
                <div>
                  <Label htmlFor="address">Alamat Lengkap</Label>
                  <Textarea id="address" placeholder="Jalan, Nomor Rumah, RT/RW" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="city">Kota</Label>
                    <Input id="city" placeholder="Jakarta" />
                  </div>
                  <div>
                    <Label htmlFor="postalCode">Kode Pos</Label>
                    <Input id="postalCode" placeholder="12345" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Shipping Method */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="w-5 h-5" />
                  Metode Pengiriman
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup value={shippingMethod} onValueChange={setShippingMethod}>
                  <div className="flex items-center space-x-2 p-3 border rounded-lg">
                    <RadioGroupItem value="regular" id="regular" />
                    <Label htmlFor="regular" className="flex-1 cursor-pointer">
                      <div className="flex justify-between">
                        <div>
                          <p className="font-medium">Pengiriman Reguler</p>
                          <p className="text-sm text-muted-foreground">5-7 hari kerja</p>
                        </div>
                        <span className="font-medium text-green-600">GRATIS</span>
                      </div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 p-3 border rounded-lg">
                    <RadioGroupItem value="express" id="express" />
                    <Label htmlFor="express" className="flex-1 cursor-pointer">
                      <div className="flex justify-between">
                        <div>
                          <p className="font-medium">Pengiriman Express</p>
                          <p className="text-sm text-muted-foreground">1-2 hari kerja</p>
                        </div>
                        <span className="font-medium">{formatPrice(25000)}</span>
                      </div>
                    </Label>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>

            {/* Payment Method */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Metode Pembayaran
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                  <div className="flex items-center space-x-2 p-3 border rounded-lg">
                    <RadioGroupItem value="transfer" id="transfer" />
                    <Label htmlFor="transfer" className="flex-1 cursor-pointer">
                      <p className="font-medium">Transfer Bank</p>
                      <p className="text-sm text-muted-foreground">BCA, Mandiri, BNI, BRI</p>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 p-3 border rounded-lg">
                    <RadioGroupItem value="ewallet" id="ewallet" />
                    <Label htmlFor="ewallet" className="flex-1 cursor-pointer">
                      <p className="font-medium">E-Wallet</p>
                      <p className="text-sm text-muted-foreground">GoPay, OVO, DANA, ShopeePay</p>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 p-3 border rounded-lg">
                    <RadioGroupItem value="cod" id="cod" />
                    <Label htmlFor="cod" className="flex-1 cursor-pointer">
                      <p className="font-medium">Bayar di Tempat (COD)</p>
                      <p className="text-sm text-muted-foreground">Bayar saat barang diterima</p>
                    </Label>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div>
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Ringkasan Pesanan</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Order Items */}
                <div className="space-y-3">
                  {cart.items.map((item) => (
                    <div key={item.product.id} className="flex gap-3">
                      <img
                        src={item.product.image || item.product.image_url || '/placeholder.png'}
                        alt={item.product.name}
                        className="w-12 h-12 object-cover rounded"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-sm">{item.product.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.quantity} x {formatPrice(item.product.price)}
                        </p>
                      </div>
                      <span className="text-sm font-medium">
                        {formatPrice(item.product.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>

                <Separator />

                {/* Pricing Breakdown */}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>{formatPrice(cart.total)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Ongkos Kirim</span>
                    <span>{shippingCost === 0 ? 'GRATIS' : formatPrice(shippingCost)}</span>
                  </div>
                </div>

                <Separator />

                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span className="text-primary">{formatPrice(totalWithShipping)}</span>
                </div>

                <Button onClick={handleSubmitOrder} className="w-full" size="lg">
                  Buat Pesanan
                </Button>

                <p className="text-xs text-muted-foreground text-center">
                  Dengan membuat pesanan, Anda menyetujui syarat dan ketentuan kami
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Checkout;