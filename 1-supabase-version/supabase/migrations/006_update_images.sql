-- ============================================
--  UPDATE IMAGES: Shops and Products
--  Ganti foto untuk toko dan produk tertentu
-- ============================================

-- TOKO BUNGA: Update image URLs
UPDATE shops
SET image_url = 'https://images.unsplash.com/photo-1563241527-3004b7be0ffd?w=400',
    updated_at = now()
WHERE name = 'Ratna Puspita';

UPDATE shops
SET image_url = 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
    updated_at = now()
WHERE name = 'Puspa Loka';

UPDATE shops
SET image_url = 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
    updated_at = now()
WHERE name = 'Puspita Ningrum';

UPDATE shops
SET image_url = 'https://images.unsplash.com/photo-1487530811176-3780de880c2d?w=400',
    updated_at = now()
WHERE name = 'Puspita Lestari';

-- PRODUK: Update image URLs
UPDATE products
SET image_url = 'https://images.unsplash.com/photo-1520763185298-1b434c919102?w=400',
    updated_at = now()
WHERE name = 'Buket Anggrek Bulan';

UPDATE products
SET image_url = 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=400',
    updated_at = now()
WHERE name = 'Hand Bouquet Pernikahan';

UPDATE products
SET image_url = 'https://images.unsplash.com/photo-1490750967868-88aa4f44baee?w=400',
    updated_at = now()
WHERE name = 'Buket Bunga Matahari';

UPDATE products
SET image_url = 'https://images.unsplash.com/photo-1563241527-3004b7be0ffd?w=400',
    updated_at = now()
WHERE name = 'Buket Mawar Pink';

-- Verify updates
SELECT name, image_url, updated_at 
FROM shops 
WHERE name IN ('Ratna Puspita', 'Puspa Loka', 'Puspita Ningrum', 'Puspita Lestari')
ORDER BY name;

SELECT name, image_url, updated_at 
FROM products 
WHERE name IN ('Buket Anggrek Bulan', 'Hand Bouquet Pernikahan', 'Buket Bunga Matahari', 'Buket Mawar Pink')
ORDER BY name;
