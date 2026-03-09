// ============================================
//  UPDATE IMAGES via Supabase API
//  Auto-update shop and product images
// ============================================

require('./backend/node_modules/dotenv').config({ path: './backend/.env' });
const { createClient } = require('./backend/node_modules/@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// New image URLs (berbeda dari yang sekarang)
const shopUpdates = [
  { name: 'Ratna Puspita', image_url: 'https://images.unsplash.com/photo-1563241527-3004b7be0ffd?w=400' },
  { name: 'Puspa Loka', image_url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400' },
  { name: 'Puspita Ningrum', image_url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400' },
  { name: 'Puspita Lestari', image_url: 'https://images.unsplash.com/photo-1487530811176-3780de880c2d?w=400' },
];

const productUpdates = [
  { name: 'Buket Anggrek Bulan', image_url: 'https://images.unsplash.com/photo-1520763185298-1b434c919102?w=400' },
  { name: 'Hand Bouquet Pernikahan', image_url: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=400' },
  { name: 'Buket Bunga Matahari', image_url: 'https://images.unsplash.com/photo-1490750967868-88aa4f44baee?w=400' },
  { name: 'Buket Mawar Pink', image_url: 'https://images.unsplash.com/photo-1563241527-3004b7be0ffd?w=400' },
];

async function updateImages() {
  console.log('\n🌸 UPDATING SHOP & PRODUCT IMAGES\n');
  console.log('==========================================\n');

  // Update shops
  console.log('🏪 Updating shop images...\n');
  for (const shop of shopUpdates) {
    const { data, error } = await supabase
      .from('shops')
      .update({ 
        image_url: shop.image_url,
        updated_at: new Date().toISOString()
      })
      .eq('name', shop.name)
      .select();

    if (error) {
      console.error(`❌ Failed to update ${shop.name}:`, error.message);
    } else if (data && data.length > 0) {
      console.log(`✅ Updated: ${shop.name}`);
      console.log(`   New image: ${shop.image_url}`);
    } else {
      console.log(`⚠️  Shop not found: ${shop.name}`);
    }
  }

  console.log();

  // Update products
  console.log('🌺 Updating product images...\n');
  for (const product of productUpdates) {
    const { data, error } = await supabase
      .from('products')
      .update({ 
        image_url: product.image_url
      })
      .eq('name', product.name)
      .select();

    if (error) {
      console.error(`❌ Failed to update ${product.name}:`, error.message);
    } else if (data && data.length > 0) {
      console.log(`✅ Updated: ${product.name}`);
      console.log(`   New image: ${product.image_url}`);
    } else {
      console.log(`⚠️  Product not found: ${product.name}`);
    }
  }

  console.log();
  console.log('==========================================');
  console.log('🎉 Image updates completed!\n');
}

updateImages().catch(console.error);
