import type { Metadata } from "next";
import { CartView } from "@/components/cart/cart-view";

export const metadata: Metadata = {
  title: "Keranjang Belanja",
};

export default function CartPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <h1
        className="mb-8 text-3xl font-bold text-gray-900"
        style={{ textWrap: "balance" }}
      >
        Keranjang Belanja
      </h1>
      <CartView />
    </div>
  );
}
