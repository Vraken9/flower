"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { ShopForm } from "@/components/dashboard/shop-form";
import type { Shop, Category } from "@/lib/types";
import { Button } from "@/components/ui/button";

interface ShopBranchesProps {
  mainShop: Shop;
  branches: Shop[];
  categories: Category[];
}

export function ShopBranches({ mainShop, branches, categories }: ShopBranchesProps) {
  const [isAddingMode, setIsAddingMode] = useState(false);
  const [editingBranchId, setEditingBranchId] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Cabang Toko</h2>
          <p className="text-sm text-gray-500">
            Kelola cabang toko {mainShop.name} di berbagai wilayah.
          </p>
        </div>
        {!isAddingMode && !editingBranchId && (
          <Button onClick={() => setIsAddingMode(true)} size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Tambah Cabang
          </Button>
        )}
      </div>

      {isAddingMode && (
        <div className="rounded-2xl border border-rose-100 bg-rose-50/30 p-4">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-semibold text-rose-800">Form Cabang Baru</h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsAddingMode(false)}
            >
              Batal
            </Button>
          </div>
          <ShopForm
            shop={null}
            categories={categories}
            parentShopId={mainShop.id}
          />
        </div>
      )}

      {editingBranchId && (
        <div className="rounded-2xl border border-blue-100 bg-blue-50/30 p-4">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-semibold text-blue-800">Edit Cabang</h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditingBranchId(null)}
            >
              Batal
            </Button>
          </div>
          <ShopForm
            shop={branches.find((b) => b.id === editingBranchId) || null}
            categories={categories}
            parentShopId={mainShop.id}
          />
        </div>
      )}

      {!isAddingMode && !editingBranchId && branches.length === 0 && (
        <div className="rounded-xl border border-gray-100 bg-gray-50 px-6 py-8 text-center text-sm text-gray-500">
          Anda belum mendaftarkan cabang toko.
        </div>
      )}

      {!isAddingMode && !editingBranchId && branches.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {branches.map((branch) => (
            <div
              key={branch.id}
              className="flex flex-col justify-between rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
            >
              <div>
                <h4 className="font-semibold text-gray-900">{branch.name}</h4>
                <p className="mt-1 text-xs text-gray-500">
                  📍 {branch.location || branch.kabupaten || "Lokasi belum diset"}
                </p>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100 flex justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingBranchId(branch.id)}
                >
                  Edit Cabang
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
