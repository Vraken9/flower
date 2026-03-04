/* ===================================
   DATABASE TYPES
   Matches Supabase tables: shops, products
=================================== */

export interface Shop {
  id: string;
  name: string;
  description: string | null;
  location: string | null;
  image_url: string | null;
  created_at: string;
}

export interface Product {
  id: string;
  shop_id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  category: string | null;
  stock: number;
  created_at: string;
}

/* Joined types for queries */
export interface ProductWithShop extends Product {
  shops: Pick<Shop, "name"> | null;
}

/* Cart */
export interface CartItem {
  product: Product;
  quantity: number;
}
