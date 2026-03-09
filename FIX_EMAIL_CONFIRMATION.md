# 🔧 FIX: Email Confirmation Issue

## Masalah
User tidak bisa login setelah registrasi dengan error "Email not confirmed"

## Root Cause
Supabase Auth memerlukan email confirmation, tapi SMTP belum dikonfigurasi

## Solusi

### Opsi 1: Disable Email Confirmation (RECOMMENDED untuk development)

1. **Buka Supabase Dashboard**: https://supabase.com/dashboard
2. **Pilih project**: Flower_Marketplace
3. **Menu Authentication** → **Providers** → **Email**
4. **Toggle OFF**: "Enable email confirmations"
5. **Save**

### Opsi 2: Confirm Existing Users via SQL

Jalankan SQL ini di Supabase Dashboard > SQL Editor:

```sql
-- Confirm all existing unconfirmed users
UPDATE auth.users
SET email_confirmed_at = now(),
    updated_at = now()
WHERE email_confirmed_at IS NULL;
```

### Opsi 3: Setup SMTP (untuk production)

1. **Menu Authentication** → **Email Templates**
2. **Configure SMTP settings** dengan email provider (Gmail, SendGrid, dll)
3. Test email delivery

## Catatan Penting

- ✅ Email SUDAH tersimpan di `auth.users` table
- ✅ Table `profiles` tidak perlu kolom email (by design)
- ✅ Email diambil dari `auth.users.email` saat login
- ⚠️ Disable email confirmation HANYA untuk development
- 🔒 Di production, enable email confirmation + SMTP

## Testing

Setelah fix, coba:
1. Register akun baru
2. Login langsung (tanpa perlu email confirmation)
3. Check profile di database

```bash
# Test registration
npm run dev
# Buka http://localhost:3000/auth/register
```
