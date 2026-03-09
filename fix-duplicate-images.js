// ============================================
//  UPDATE DUPLICATE SHOP IMAGES
//  Replace duplicate images with unique ones
// ============================================

require('./backend/node_modules/dotenv').config({ path: './backend/.env' });
const { createClient } = require('./backend/node_modules/@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// New unique images for each shop
const shopUpdates = [
  // Group 1: photo-1487530811176 duplicates
  { name: 'Candra Kirana', image_url: 'https://images.unsplash.com/photo-1519378058457-4c29a0a2efac?w=400' },
  { name: 'Puspita Lestari', image_url: 'https://images.unsplash.com/photo-1470137430626-984c7b5e1f39?w=400' },
  // Toko Edelweis Senja - keep current
  
  // Group 2: photo-1563241527 duplicates
  { name: 'Kusuma Wijaya', image_url: 'https://images.unsplash.com/photo-1583843192190-50d3f1c8d8e3?w=400' },
  // Padma Kusuma - keep current
  { name: 'Ratna Puspita', image_url: 'https://images.unsplash.com/photo-1516205651411-aef33a44f7c2?w=400' },
  
  // Group 3: photo-1558618666 duplicates  
  { name: 'Puspa Loka', image_url: 'https://images.unsplash.com/photo-1534531173927-aeb928d54385?w=400' },
  { name: 'Puspita Ningrum', image_url: 'https://images.unsplash.com/photo-1525310072745-f49212b5ac6d?w=400' },
  { name: 'Sekar Arum', image_url: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=400' },
];

async function updateDuplicateImages() {
  console.log('\n🌸 UPDATING DUPLICATE SHOP IMAGES\n');
  console.log('==========================================\n');

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
      console.log(`✅ ${shop.name}`);
      console.log(`   → ${shop.image_url}\n`);
    } else {
      console.log(`⚠️  Shop not found: ${shop.name}\n`);
    }
  }

  console.log('==========================================');
  console.log('🎉 All duplicate images updated!\n');
  
  // Verify no more duplicates
  console.log('🔍 Verifying...\n');
  const { data: shops } = await supabase
    .from('shops')
    .select('name, image_url')
    .order('name');

  const imageMap = {};
  shops.forEach(shop => {
    if (!imageMap[shop.image_url]) {
      imageMap[shop.image_url] = [];
    }
    imageMap[shop.image_url].push(shop.name);
  });

  const hasDuplicates = Object.values(imageMap).some(names => names.length > 1);
  
  if (hasDuplicates) {
    console.log('⚠️  Still have duplicates:\n');
    Object.keys(imageMap).forEach(url => {
      if (imageMap[url].length > 1) {
        console.log(`   ${imageMap[url].join(', ')}`);
      }
    });
  } else {
    console.log('✅ All images are now unique!\n');
  }
}

updateDuplicateImages().catch(console.error);
