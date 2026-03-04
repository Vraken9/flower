// ============================================
//  PROFILE PAGE
//  /profile
// ============================================

"use client";

import { useState } from "react";
import { useAuth } from "@/lib/contexts/auth.context";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { User, Mail, Calendar, Shield, Edit2, Save, X } from "lucide-react";

export default function ProfilePage() {
  const { user, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    full_name: user?.full_name || '',
    phone: user?.phone || '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      await updateProfile(editForm);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setEditForm({
      full_name: user?.full_name || '',
      phone: user?.phone || '',
    });
    setIsEditing(false);
  };

  return (
    <ProtectedRoute requireAuth={true}>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">Profil Saya</h1>
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-rose-600 bg-rose-50 rounded-lg hover:bg-rose-100 transition-colors"
                  >
                    <Edit2 className="h-4 w-4" />
                    Edit
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleSave}
                      disabled={isLoading}
                      className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-rose-600 rounded-lg hover:bg-rose-700 disabled:opacity-50 transition-colors"
                    >
                      <Save className="h-4 w-4" />
                      {isLoading ? 'Menyimpan...' : 'Simpan'}
                    </button>
                    <button
                      onClick={handleCancel}
                      disabled={isLoading}
                      className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 transition-colors"
                    >
                      <X className="h-4 w-4" />
                      Batal
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Profile Content */}
            <div className="px-6 py-6 space-y-6">
              {/* Profile Picture */}
              <div className="flex items-center gap-6">
                <div className="h-20 w-20 bg-rose-100 rounded-full flex items-center justify-center">
                  <User className="h-10 w-10 text-rose-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{user?.full_name}</h3>
                  <p className="text-sm text-gray-600 capitalize flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    {user?.role} Account
                  </p>
                </div>
              </div>

              {/* Profile Information */}
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Full Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nama Lengkap
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editForm.full_name}
                        onChange={(e) => setEditForm(prev => ({ ...prev, full_name: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                        placeholder="Masukkan nama lengkap"
                      />
                    ) : (
                      <p className="px-3 py-2 bg-gray-50 rounded-lg text-gray-900">
                        {user?.full_name || '-'}
                      </p>
                    )}
                  </div>

                  {/* Email (read-only) */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg text-gray-600">
                      <Mail className="h-4 w-4" />
                      {user?.email || '-'}
                    </div>
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nomor Telepon
                    </label>
                    {isEditing ? (
                      <input
                        type="tel"
                        value={editForm.phone}
                        onChange={(e) => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                        placeholder="Masukkan nomor telepon"
                      />
                    ) : (
                      <p className="px-3 py-2 bg-gray-50 rounded-lg text-gray-900">
                        {user?.phone || '-'}
                      </p>
                    )}
                  </div>

                  {/* Role (read-only) */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Peran
                    </label>
                    <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg text-gray-600 capitalize">
                      <Shield className="h-4 w-4" />
                      {user?.role || '-'}
                    </div>
                  </div>
                </div>

                {/* Account Created */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Akun Dibuat
                  </label>
                  <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg text-gray-600">
                    <Calendar className="h-4 w-4" />
                    {user?.created_at ? new Date(user.created_at).toLocaleDateString('id-ID', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    }) : '-'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}