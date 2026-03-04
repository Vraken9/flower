"use client";

import { Trash2 } from "lucide-react";

interface DeleteProductButtonProps {
  productId: string;
  productName: string;
}

export function DeleteProductButton({
  productId,
  productName,
}: DeleteProductButtonProps) {
  const handleDelete = async () => {
    const confirmed = window.confirm(
      `Yakin ingin menghapus "${productName}"? Tindakan ini tidak bisa dibatalkan.`
    );

    if (!confirmed) return;

    // TODO: Implement server action for delete
    alert("Fitur hapus akan tersedia setelah backend siap.");
  };

  return (
    <button
      type="button"
      onClick={handleDelete}
      className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400"
      aria-label={`Hapus ${productName}`}
    >
      <Trash2 className="h-4 w-4" aria-hidden="true" />
    </button>
  );
}
