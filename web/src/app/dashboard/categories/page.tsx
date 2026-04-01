"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Tag, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Category {
  id: string;
  name: string;
  created_at: string;
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategory, setNewCategory] = useState("");
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/categories");
      const data = await res.json();
      if (data.success) {
        setCategories(data.data);
      }
    } catch {
      setError("Gagal memuat kategori");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategory.trim()) return;

    setAdding(true);
    setError("");

    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newCategory.trim() }),
      });

      const data = await res.json();

      if (data.success) {
        setCategories((prev) => [data.data, ...prev]);
        setNewCategory("");
      } else {
        setError(data.message || "Gagal menambah kategori");
      }
    } catch {
      setError("Terjadi kesalahan jaringan");
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Yakin ingin menghapus kategori ini?")) return;

    setDeletingId(id);
    setError("");

    try {
      const res = await fetch(`/api/categories?id=${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      const data = await res.json();

      if (data.success) {
        setCategories((prev) => prev.filter((c) => c.id !== id));
      } else {
        setError(data.message || "Gagal menghapus kategori");
      }
    } catch {
      setError("Terjadi kesalahan jaringan");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-900">
        Kelola Kategori
      </h1>

      {error && (
        <div className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Add form */}
      <form
        onSubmit={handleAdd}
        className="mb-6 flex gap-3 rounded-2xl bg-white p-4 shadow-sm"
      >
        <input
          type="text"
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
          placeholder="Nama kategori baru..."
          className="flex-1 rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-200"
        />
        <Button type="submit" disabled={adding || !newCategory.trim()}>
          {adding ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Plus className="h-4 w-4" />
          )}
          Tambah
        </Button>
      </form>

      {/* Category list */}
      <div className="space-y-2">
        {loading ? (
          <div className="py-8 text-center text-gray-400">
            <Loader2 className="mx-auto h-6 w-6 animate-spin" />
          </div>
        ) : categories.length === 0 ? (
          <div className="py-8 text-center text-gray-400">
            Belum ada kategori
          </div>
        ) : (
          categories.map((cat) => (
            <div
              key={cat.id}
              className="flex items-center justify-between rounded-xl bg-white px-4 py-3 shadow-sm"
            >
              <div className="flex items-center gap-2.5">
                <Tag className="h-4 w-4 text-rose-400" />
                <span className="text-sm font-medium text-gray-800">
                  {cat.name}
                </span>
              </div>
              <button
                onClick={() => handleDelete(cat.id)}
                disabled={deletingId === cat.id}
                className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500 disabled:opacity-50"
                title="Hapus kategori"
              >
                {deletingId === cat.id ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
