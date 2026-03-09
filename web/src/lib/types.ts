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
  created_at: string | null;
  whatsapp: string | null;
  instagram: string | null;
  owner_id: string;
  is_active: boolean;
  updated_at: string | null;
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
  created_at: string | null;
}

/* Joined types for queries */
export interface ProductWithShop extends Product {
  shops: Pick<Shop, "name" | "whatsapp"> | null;
}

/* Cart */
export interface CartItem {
  product: Product;
  quantity: number;
}
