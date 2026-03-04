// ============================================
//  🌱 SEED DATA SCRIPT
//  Mengisi database dengan data dummy
//  Jalankan: node database/seed.js
// ============================================

require('dotenv').config()
const { supabaseAdmin } = require('../config/supabase')

// ──────────────────────────────────────────
//  DATA DUMMY: USER (via Supabase Auth)
// ──────────────────────────────────────────
const USERS = [
  {
    email: 'admin@flowermarket.com',
    password: 'admin123456',
    full_name: 'Super Admin',
    role: 'admin',
  },
  {
    email: 'owner.edelweis@gmail.com',
    password: 'owner123456',
    full_name: 'Sari Dewi',
    role: 'owner',
  },
  {
    email: 'owner.padma@gmail.com',
    password: 'owner123456',
    full_name: 'Rina Kusuma',
    role: 'owner',
  },
  {
    email: 'owner.ratna@gmail.com',
    password: 'owner123456',
    full_name: 'Budi Santoso',
    role: 'owner',
  },
  {
    email: 'buyer@gmail.com',
    password: 'buyer123456',
    full_name: 'Ahmad Fauzi',
    role: 'user',
  },
  {
    email: 'buyer2@gmail.com',
    password: 'buyer123456',
    full_name: 'Lina Marlina',
    role: 'user',
  },
]

// ──────────────────────────────────────────
//  DATA DUMMY: TOKO (SHOPS)
// ──────────────────────────────────────────
const SHOPS = [
  {
    name: 'Toko Edelweis Senja',
    description: 'Spesialis bunga edelweis dan rangkaian bunga premium untuk momen-momen spesial dalam hidup Anda. Kami menyediakan buket, dekorasi, dan hadiah bunga terbaik.',
    location: 'Banjarnegara',
    image_url: 'https://images.unsplash.com/photo-1487530811176-3780de880c2d?w=400',
    whatsapp: '08566655555',
    instagram: '@edelweis_senja',
    owner_email: 'owner.edelweis@gmail.com',
  },
  {
    name: 'Padma Kusuma',
    description: 'Toko bunga modern dengan koleksi bunga segar pilihan. Melayani pemesanan bouquet, hand bouquet, dan dekorasi bunga untuk acara pernikahan dan ulang tahun.',
    location: 'Yogyakarta',
    image_url: 'https://images.unsplash.com/photo-1563241527-3004b7be0ffd?w=400',
    whatsapp: '08123456789',
    instagram: '@padma_kusuma',
    owner_email: 'owner.padma@gmail.com',
  },
  {
    name: 'Ratna Puspita',
    description: 'Rangkaian cinta dalam kelopak abadi. Toko bunga terpercaya dengan pengalaman lebih dari 5 tahun dalam merangkai bunga untuk berbagai acara.',
    location: 'Wonosobo',
    image_url: 'https://images.unsplash.com/photo-1490750967868-88aa4f44baee?w=400',
    whatsapp: '08987654321',
    instagram: '@ratna_puspita',
    owner_email: 'owner.ratna@gmail.com',
  },
]

// ──────────────────────────────────────────
//  DATA DUMMY: PRODUK (PRODUCTS)
// ──────────────────────────────────────────
const PRODUCTS = [
  // === Toko Edelweis Senja ===
  {
    shop_name: 'Toko Edelweis Senja',
    name: 'Buket Edelweis Putih',
    description: 'Buket edelweis putih alami yang melambangkan cinta abadi. Terdiri dari 12 tangkai edelweis pilihan yang dirangkai dengan elegan.',
    price: 150000,
    category: 'Bouquet',
    stock: 25,
    image_url: 'https://images.unsplash.com/photo-1487530811176-3780de880c2d?w=400',
  },
  {
    shop_name: 'Toko Edelweis Senja',
    name: 'Buket Mawar Merah',
    description: 'Ungkapan cinta yang berani dengan 24 tangkai mawar merah Holland. Dilengkapi dengan wrapper premium dan pita satin.',
    price: 250000,
    category: 'Bouquet',
    stock: 30,
    image_url: 'https://images.unsplash.com/photo-1455659817273-f96807779a8a?w=400',
  },
  {
    shop_name: 'Toko Edelweis Senja',
    name: 'Buket Anggrek Bulan',
    description: 'Anggrek bulan putih elegan dalam pot keramik minimalis. Cocok untuk hadiah spesial atau dekorasi ruangan.',
    price: 350000,
    category: 'Tanaman Hias',
    stock: 10,
    image_url: 'https://images.unsplash.com/photo-1567696911980-2eed69a46042?w=400',
  },
  {
    shop_name: 'Toko Edelweis Senja',
    name: 'Standing Flower Premium',
    description: 'Standing flower mewah untuk acara peresmian, pembukaan kantor, atau ucapan selamat. Tinggi 180cm dengan rangkaian bunga segar.',
    price: 750000,
    category: 'Bunga Segar',
    stock: 5,
    image_url: 'https://images.unsplash.com/photo-1561181286-d3fee7d55364?w=400',
  },
  {
    shop_name: 'Toko Edelweis Senja',
    name: 'Buket Lily Casablanca',
    description: 'Buket lily casablanca dengan aroma semerbak. 6 tangkai lily premium dalam balutan kertas impor.',
    price: 280000,
    category: 'Bouquet',
    stock: 15,
    image_url: 'https://images.unsplash.com/photo-1508610048659-a06b669e3321?w=400',
  },

  // === Padma Kusuma ===
  {
    shop_name: 'Padma Kusuma',
    name: 'Hand Bouquet Pernikahan',
    description: 'Hand bouquet spesial untuk hari pernikahan Anda. Kombinasi mawar, baby breath, dan eucalyptus yang cantik.',
    price: 450000,
    category: 'Bouquet',
    stock: 8,
    image_url: 'https://images.unsplash.com/photo-1522057306606-8d84bd15aafb?w=400',
  },
  {
    shop_name: 'Padma Kusuma',
    name: 'Buket Tulip Pelangi',
    description: 'Buket tulip warna-warni yang ceria. Terdiri dari 15 tangkai tulip dalam 5 warna berbeda.',
    price: 320000,
    category: 'Bouquet',
    stock: 12,
    image_url: 'https://images.unsplash.com/photo-1520763185298-1b434c919102?w=400',
  },
  {
    shop_name: 'Padma Kusuma',
    name: 'Meja Hias Sukulen',
    description: 'Set 3 sukulen cantik dalam pot keramik minimalis. Perawatan mudah, cocok untuk meja kerja atau ruang tamu.',
    price: 175000,
    category: 'Tanaman Hias',
    stock: 20,
    image_url: 'https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=400',
  },
  {
    shop_name: 'Padma Kusuma',
    name: 'Buket Bunga Matahari',
    description: 'Buket sunflower segar yang menyemangati hari Anda. 10 tangkai bunga matahari dengan daun hijau segar.',
    price: 200000,
    category: 'Bouquet',
    stock: 18,
    image_url: 'https://images.unsplash.com/photo-1551945326-df678f7e7cb3?w=400',
  },
  {
    shop_name: 'Padma Kusuma',
    name: 'Dekorasi Bunga Artificial',
    description: 'Rangkaian bunga artificial premium yang terlihat seperti asli. Cocok untuk dekorasi rumah yang tahan lama.',
    price: 500000,
    category: 'Bunga Artificial',
    stock: 7,
    image_url: 'https://images.unsplash.com/photo-1471696035578-3d8c78d99684?w=400',
  },
  {
    shop_name: 'Padma Kusuma',
    name: 'Vas Keramik Handmade',
    description: 'Vas keramik buatan tangan dengan desain unik. Tinggi 25cm, cocok untuk melengkapi rangkaian bunga Anda.',
    price: 125000,
    category: 'Aksesoris',
    stock: 30,
    image_url: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=400',
  },

  // === Ratna Puspita ===
  {
    shop_name: 'Ratna Puspita',
    name: 'Buket Mawar Pink',
    description: 'Buket mawar pink lembut yang cocok untuk mengungkapkan kasih sayang. 18 tangkai mawar dalam kemasan premium.',
    price: 220000,
    category: 'Bouquet',
    stock: 22,
    image_url: 'https://images.unsplash.com/photo-1490750967868-88aa4f44baee?w=400',
  },
  {
    shop_name: 'Ratna Puspita',
    name: 'Rangkaian Bunga Duka Cita',
    description: 'Rangkaian bunga untuk ungkapan belasungkawa. Bunga segar dalam nuansa putih dan ungu yang khidmat.',
    price: 400000,
    category: 'Bunga Segar',
    stock: 6,
    image_url: 'https://images.unsplash.com/photo-1561181286-d3fee7d55364?w=400',
  },
  {
    shop_name: 'Ratna Puspita',
    name: 'Kotak Bunga Valentine',
    description: 'Surprise box berisi mawar merah dan cokelat premium. Hadiah valentine yang romantis dan berkesan.',
    price: 350000,
    category: 'Bouquet',
    stock: 10,
    image_url: 'https://images.unsplash.com/photo-1518621736915-f3b1c41bfd00?w=400',
  },
  {
    shop_name: 'Ratna Puspita',
    name: 'Bonsai Adenium',
    description: 'Bonsai adenium (kamboja jepang) dengan bunga merah menyala. Usia tanaman 3 tahun, tinggi 30cm.',
    price: 285000,
    category: 'Tanaman Hias',
    stock: 8,
    image_url: 'https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=400',
  },
  {
    shop_name: 'Ratna Puspita',
    name: 'Pita & Ribbon Set',
    description: 'Set pita dan ribbon dekoratif untuk merangkai bunga sendiri. Isi 10 roll dalam berbagai warna.',
    price: 85000,
    category: 'Aksesoris',
    stock: 50,
    image_url: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=400',
  },
]

// ──────────────────────────────────────────
//  MAIN SEED FUNCTION
// ──────────────────────────────────────────
async function seed() {
  console.log('🌱 Memulai seed data...\n')

  // ── STEP 1: Buat users di Supabase Auth ──
  console.log('👤 Step 1: Membuat users...')
  const userMap = {} // email → user_id

  for (const u of USERS) {
    // Cek apakah user sudah ada (by email lewat admin API)
    const { data: { users: existingUsers } } = await supabaseAdmin.auth.admin.listUsers()
    const existing = existingUsers.find(eu => eu.email === u.email)

    if (existing) {
      console.log(`   ⏩ ${u.email} sudah ada (${existing.id})`)
      userMap[u.email] = existing.id

      // Update role di profiles jika perlu
      await supabaseAdmin
        .from('profiles')
        .upsert({
          id: existing.id,
          full_name: u.full_name,
          role: u.role,
          updated_at: new Date().toISOString(),
        })

      continue
    }

    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: u.email,
      password: u.password,
      email_confirm: true,
      user_metadata: { full_name: u.full_name },
    })

    if (authError) {
      console.error(`   ❌ Gagal buat ${u.email}: ${authError.message}`)
      continue
    }

    userMap[u.email] = authData.user.id
    console.log(`   ✅ ${u.email} → ${u.role} (${authData.user.id})`)

    // Upsert profile (trigger mungkin sudah membuat, tapi kita pastikan role-nya benar)
    await supabaseAdmin
      .from('profiles')
      .upsert({
        id: authData.user.id,
        full_name: u.full_name,
        role: u.role,
      })
  }

  console.log(`   📊 Total users: ${Object.keys(userMap).length}\n`)

  // ── STEP 2: Upsert shops ──
  console.log('🏪 Step 2: Membuat/mengupdate toko...')
  const shopMap = {} // shop_name → shop_id

  for (const s of SHOPS) {
    const ownerId = userMap[s.owner_email] || null

    // Cek apakah toko sudah ada berdasarkan nama
    const { data: existingShop } = await supabaseAdmin
      .from('shops')
      .select('id')
      .eq('name', s.name)
      .single()

    if (existingShop) {
      // Update toko yang sudah ada
      await supabaseAdmin
        .from('shops')
        .update({
          description: s.description,
          location: s.location,
          image_url: s.image_url,
          whatsapp: s.whatsapp,
          instagram: s.instagram,
          owner_id: ownerId,
        })
        .eq('id', existingShop.id)

      shopMap[s.name] = existingShop.id
      console.log(`   ⏩ "${s.name}" diupdate (${existingShop.id})`)
    } else {
      // Buat toko baru
      const { data: newShop, error: shopError } = await supabaseAdmin
        .from('shops')
        .insert({
          name: s.name,
          description: s.description,
          location: s.location,
          image_url: s.image_url,
          whatsapp: s.whatsapp,
          instagram: s.instagram,
          owner_id: ownerId,
        })
        .select()
        .single()

      if (shopError) {
        console.error(`   ❌ Gagal buat "${s.name}": ${shopError.message}`)
        continue
      }

      shopMap[s.name] = newShop.id
      console.log(`   ✅ "${s.name}" dibuat (${newShop.id})`)
    }
  }

  console.log(`   📊 Total shops: ${Object.keys(shopMap).length}\n`)

  // ── STEP 3: Hapus produk lama & insert yang baru ──
  console.log('🌸 Step 3: Seed produk...')

  // Hapus semua produk lama
  const { error: delError } = await supabaseAdmin
    .from('products')
    .delete()
    .not('id', 'is', null) // delete all

  if (delError) {
    console.error(`   ⚠️ Gagal hapus produk lama: ${delError.message}`)
  } else {
    console.log('   🗑️ Produk lama dihapus')
  }

  // Insert produk baru
  let productCount = 0
  for (const p of PRODUCTS) {
    const shopId = shopMap[p.shop_name]
    if (!shopId) {
      console.error(`   ❌ Shop "${p.shop_name}" tidak ditemukan, skip produk "${p.name}"`)
      continue
    }

    const { error: prodError } = await supabaseAdmin
      .from('products')
      .insert({
        shop_id: shopId,
        name: p.name,
        description: p.description,
        price: p.price,
        category: p.category,
        stock: p.stock,
        image_url: p.image_url,
      })

    if (prodError) {
      console.error(`   ❌ Gagal buat "${p.name}": ${prodError.message}`)
    } else {
      productCount++
      console.log(`   ✅ "${p.name}" → ${p.category} (Rp ${p.price.toLocaleString()})`)
    }
  }

  console.log(`   📊 Total produk: ${productCount}\n`)

  // ── SUMMARY ──
  console.log('═══════════════════════════════════════════')
  console.log('  🌱 SEED DATA SELESAI!')
  console.log('═══════════════════════════════════════════')
  console.log('')
  console.log('  📋 Akun yang dibuat:')
  console.log('  ┌─────────────────────────────────────────────┐')
  console.log('  │ ROLE    │ EMAIL                  │ PASSWORD  │')
  console.log('  ├─────────────────────────────────────────────┤')
  console.log('  │ admin   │ admin@flowermarket.com  │ admin123456  │')
  console.log('  │ owner   │ owner.edelweis@gmail.com│ owner123456  │')
  console.log('  │ owner   │ owner.padma@gmail.com   │ owner123456  │')
  console.log('  │ owner   │ owner.ratna@gmail.com   │ owner123456  │')
  console.log('  │ user    │ buyer@gmail.com         │ buyer123456  │')
  console.log('  │ user    │ buyer2@gmail.com        │ buyer123456  │')
  console.log('  └─────────────────────────────────────────────┘')
  console.log('')
}

seed().catch((err) => {
  console.error('❌ Seed gagal:', err.message)
  process.exit(1)
})
