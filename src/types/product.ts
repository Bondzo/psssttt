export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  stock: number;        // kolom stok dari Supabase
  image_url?: string;   // kolom gambar
  category?: string;
  brand?: string;
  featured?: boolean;
  originalPrice?: number;
  created_at?: string;
}


export interface CartItem {
  product: Product;
  quantity: number;
}

export interface CartState {
  items: CartItem[];
  total: number;
  itemCount: number;
}