// ============================================
//  CHECK CURRENT IMAGES
//  List all shop images to identify duplicates
// ============================================

require('./backend/node_modules/dotenv').config({ path: './backend/.env' });
const { createClient } = require('./backend/node_modules/@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkImages() {
  console.log('\n🌸 CHECKING CURRENT SHOP IMAGES\n');
  console.log('==========================================\n');

  const { data: shops, error } = await supabase
    .from('shops')
    .select('name, image_url')
    .order('name');

  if (error) {
    console.error('❌ Error:', error.message);
    return;
  }

  // Group by image URL to find duplicates
  const imageMap = {};
  shops.forEach(shop => {
    if (!imageMap[shop.image_url]) {
      imageMap[shop.image_url] = [];
    }
    imageMap[shop.image_url].push(shop.name);
  });

  console.log('📊 All Shops:\n');
  shops.forEach(shop => {
    console.log(`   ${shop.name}`);
    console.log(`   → ${shop.image_url}\n`);
  });

  console.log('\n⚠️  DUPLICATE IMAGES:\n');
  Object.keys(imageMap).forEach(url => {
    if (imageMap[url].length > 1) {
      console.log(`   ${url}`);
      console.log(`   Used by: ${imageMap[url].join(', ')}\n`);
    }
  });

  console.log('==========================================\n');
}

checkImages().catch(console.error);
