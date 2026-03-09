"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Loader2 } from "lucide-react";

interface DeleteProductButtonProps {
  productId: string;
  productName: string;
}

export function DeleteProductButton({
  productId,
  productName,
}: DeleteProductButtonProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    const confirmed = window.confirm(
      `Yakin ingin menghapus "${productName}"? Tindakan ini tidak bisa dibatalkan.`
    );

    if (!confirmed) return;

    setIsDeleting(true);

    try {
      const res = await fetch(`/api/owner/products/${productId}`, {
        method: "DELETE",
        credentials: "include",
      });

      const result = await res.json();

      if (result.success) {
        router.refresh();
      } else {
        alert(result.message || "Gagal menghapus produk.");
      }
    } catch {
      alert("Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={isDeleting}
      className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 disabled:opacity-50"
      aria-label={`Hapus ${productName}`}
    >
      {isDeleting ? (
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
      ) : (
        <Trash2 className="h-4 w-4" aria-hidden="true" />
      )}
    </button>
  );
}
