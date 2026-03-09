-- Seed data for Flower Marketplace
-- Run this AFTER migration 007

-- First, let's create some test owner profiles and shops
-- Note: You'll need to create actual auth users in Supabase first, then update these UUIDs

-- Create sample shops (assuming owner accounts already exist)
-- If you don't have owner accounts yet, create them first via the app registration

-- Sample products with Unsplash flower images
-- These will be inserted into existing shops

-- Get existing shop IDs and insert products
DO $$
DECLARE
    shop_record RECORD;
    product_count INT := 0;
BEGIN
    FOR shop_record IN SELECT id, name FROM shops WHERE is_active = true LIMIT 3 LOOP
        -- Insert 8 products per shop with different flower types
        INSERT INTO products (shop_id, name, description, price, stock, category, image_url)
        VALUES
        (
            shop_record.id,
            'Buket Mawar Merah Premium',
            'Buket cantik berisi 12 tangkai mawar merah segar pilihan. Cocok untuk hadiah anniversary, Valentine, atau ungkapan cinta. Dikemas dengan wrapping premium dan pita satin.',
            450000,
            15,
            'Buket',
            'https://images.unsplash.com/photo-1518621736915-f3b1c41bfd00?w=800'
        ),
        (
            shop_record.id,
            'Rangkaian Bunga Meja Elegant',
            'Rangkaian bunga meja dengan kombinasi lily, carnation, dan baby breath. Sempurna untuk dekorasi ruang tamu atau kantor. Tinggi sekitar 30cm.',
            350000,
            10,
            'Rangkaian',
            'https://images.unsplash.com/photo-1487530811176-3780de880c2d?w=800'
        ),
        (
            shop_record.id,
            'Bunga Papan Happy Wedding',
            'Bunga papan ucapan selamat pernikahan ukuran 2x1.5 meter. Menggunakan bunga segar dengan desain elegan. Termasuk pengiriman dan pemasangan.',
            1500000,
            5,
            'Bunga Papan',
            'https://images.unsplash.com/photo-1522057384400-681b421cfebc?w=800'
        ),
        (
            shop_record.id,
            'Buket Tulip Campuran',
            'Buket tulip campuran warna-warni (pink, kuning, ungu, putih). Berisi 15 tangkai tulip import Belanda. Fresh dan tahan lama.',
            550000,
            8,
            'Buket',
            'https://images.unsplash.com/photo-1520763185298-1b434c919102?w=800'
        ),
        (
            shop_record.id,
            'Hand Bouquet Peony Pastel',
            'Hand bouquet mewah dengan peony pink pastel dan eucalyptus. Pilihan favorit untuk bridal bouquet atau hadiah spesial.',
            750000,
            6,
            'Buket',
            'https://images.unsplash.com/photo-1561181286-d3fee7d55364?w=800'
        ),
        (
            shop_record.id,
            'Vas Bunga Matahari',
            'Rangkaian bunga matahari ceria dalam vas keramik putih. Berisi 7 tangkai sunflower segar. Membawa energi positif ke ruangan Anda.',
            320000,
            12,
            'Vas Bunga',
            'https://images.unsplash.com/photo-1551731673-c55f7e3bbd52?w=800'
        ),
        (
            shop_record.id,
            'Buket Wisuda Elegant',
            'Buket spesial untuk wisuda dengan bunga baby breath dan bunga segar pilihan. Dilengkapi dengan boneka wisuda mini dan pita.',
            400000,
            20,
            'Buket',
            'https://images.unsplash.com/photo-1455659817273-f96807779a8a?w=800'
        ),
        (
            shop_record.id,
            'Bunga Papan Duka Cita',
            'Bunga papan untuk ucapan turut berduka cita. Desain sederhana dan bermartabat. Ukuran standar 1.5x1 meter.',
            850000,
            8,
            'Bunga Papan',
            'https://images.unsplash.com/photo-1468327768560-75b778cbb551?w=800'
        );
        
        product_count := product_count + 8;
        RAISE NOTICE 'Inserted 8 products for shop: %', shop_record.name;
    END LOOP;
    
    RAISE NOTICE 'Total products inserted: %', product_count;
END $$;

-- If no shops exist yet, create sample data with placeholder owner IDs
-- Uncomment and modify the UUIDs below after creating owner accounts

/*
-- Sample shop creation (replace UUIDs with actual owner IDs)
INSERT INTO shops (owner_id, name, description, location, whatsapp, is_active)
VALUES
(
    '00000000-0000-0000-0000-000000000001', -- Replace with actual owner UUID
    'Toko Bunga Segar',
    'Menyediakan berbagai jenis bunga segar berkualitas untuk berbagai keperluan. Spesialis buket dan rangkaian bunga.',
    'Jakarta',
    '6281234567890',
    true
),
(
    '00000000-0000-0000-0000-000000000002', -- Replace with actual owner UUID
    'Florist Cantik',
    'Florist profesional dengan desain modern dan kreatif. Melayani wedding, event, dan personal gifts.',
    'Jakarta Selatan',
    '6289876543210',
    true
),
(
    '00000000-0000-0000-0000-000000000003', -- Replace with actual owner UUID
    'Bunga Indah Florist',
    'Toko bunga dengan pengalaman 10 tahun. Spesialis bunga papan dan dekorasi pernikahan.',
    'Bandung',
    '6281122334455',
    true
);
*/

-- Alternative: Direct insert if you want sample products without existing shops
-- This creates a complete sample dataset

-- Check if any products exist, if not, create sample shop and products
DO $$
DECLARE
    products_exist BOOLEAN;
    sample_shop_id UUID;
BEGIN
    SELECT EXISTS(SELECT 1 FROM products LIMIT 1) INTO products_exist;
    
    IF NOT products_exist THEN
        RAISE NOTICE 'No products found. Please create owner accounts and shops first via the application.';
        RAISE NOTICE 'Then run this seed script again to populate products.';
    ELSE
        RAISE NOTICE 'Products already exist in database.';
    END IF;
END $$;

-- Insert some sample product views for hot seller calculation
INSERT INTO product_views (product_id, user_id, session_id)
SELECT 
    p.id,
    NULL,
    'sample-session-' || floor(random() * 1000)::text
FROM products p
CROSS JOIN generate_series(1, floor(random() * 20 + 5)::int) AS n
ON CONFLICT DO NOTHING;
