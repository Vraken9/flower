import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

/**
 * POST /api/admin/seed-products
 * Seed dummy products for shops that have fewer than 10 products.
 * Also creates dummy reviews for each product.
 * Admin only.
 */

// Flower image URLs from Unsplash (free to use)
const FLOWER_IMAGES = [
  "https://images.unsplash.com/photo-1490750967868-88aa4f44baee?w=600&q=80",
  "https://images.unsplash.com/photo-1455659817273-f96807779a8a?w=600&q=80",
  "https://images.unsplash.com/photo-1487530811176-3780de880c2d?w=600&q=80",
  "https://images.unsplash.com/photo-1468327768560-75b778cbb551?w=600&q=80",
  "https://images.unsplash.com/photo-1591886960571-74d43a9d4166?w=600&q=80",
  "https://images.unsplash.com/photo-1508610048659-a06b669e3321?w=600&q=80",
  "https://images.unsplash.com/photo-1525310555684-891f5cfb248e?w=600&q=80",
  "https://images.unsplash.com/photo-1494972308805-c0d06e384884?w=600&q=80",
  "https://images.unsplash.com/photo-1478479405421-ce83c92fb3ba?w=600&q=80",
  "https://images.unsplash.com/photo-1518882054726-4af63a29f3b7?w=600&q=80",
  "https://images.unsplash.com/photo-1490750967868-88aa4f44baee?w=600&q=80",
  "https://images.unsplash.com/photo-1561181286-d3fee7d55364?w=600&q=80",
  "https://images.unsplash.com/photo-1563241527-3004b7be0ffd?w=600&q=80",
  "https://images.unsplash.com/photo-1567696911980-2eed69a46042?w=600&q=80",
  "https://images.unsplash.com/photo-1471696035578-3d8c78d99571?w=600&q=80",
  "https://images.unsplash.com/photo-1501973801540-537f08ccae7b?w=600&q=80",
  "https://images.unsplash.com/photo-1462275646964-a0e3c11f18a6?w=600&q=80",
  "https://images.unsplash.com/photo-1444930694458-01babf71870c?w=600&q=80",
  "https://images.unsplash.com/photo-1510894347713-fc3ed6fdf539?w=600&q=80",
  "https://images.unsplash.com/photo-1585123388867-3bfe6dd4bdbf?w=600&q=80",
  "https://images.unsplash.com/photo-1457089328109-e5d9bd499191?w=600&q=80",
  "https://images.unsplash.com/photo-1551731613-e0e43f0b0fc1?w=600&q=80",
  "https://images.unsplash.com/photo-1596438459194-f275f413d6ff?w=600&q=80",
  "https://images.unsplash.com/photo-1558652093-2767e0081e70?w=600&q=80",
  "https://images.unsplash.com/photo-1582794543139-8ac9cb0f7b11?w=600&q=80",
  "https://images.unsplash.com/photo-1574783564464-30f8e0989a1e?w=600&q=80",
  "https://images.unsplash.com/photo-1495231916356-a86217efff12?w=600&q=80",
  "https://images.unsplash.com/photo-1549663015-1eb882ea3e9b?w=600&q=80",
  "https://images.unsplash.com/photo-1587314168485-3236d6710814?w=600&q=80",
  "https://images.unsplash.com/photo-1519378058457-4c29a0a2efac?w=600&q=80",
];

const CATEGORIES = [
  "Bunga Segar",
  "Tanaman Hias",
  "Buket & Rangkaian",
  "Bunga Papan",
  "Dekorasi",
  "Kado & Hampers",
];

const PRODUCT_TEMPLATES = [
  {
    name: "Buket Mawar Merah Premium",
    description:
      "Buket mewah berisi 20 tangkai mawar merah segar pilihan yang dirangkai dengan penuh cinta dan ketelitian. Setiap tangkai mawar dipilih secara khusus dari perkebunan terbaik untuk memastikan keindahan dan kesegarannya. Cocok untuk hadiah ulang tahun, anniversary, atau momen spesial lainnya. Dilengkapi dengan wrapping premium berwarna elegan dan pita satin yang menambah kesan romantis.",
    price: 285000,
    category: "Buket & Rangkaian",
    stock: 15,
  },
  {
    name: "Rangkaian Lily Putih Elegan",
    description:
      "Rangkaian bunga lily putih yang memancarkan kesan elegan dan anggun. Terdiri dari 10 tangkai lily oriental putih segar yang disusun dalam vas keramik minimalis bernuansa pastel. Bunga lily melambangkan kemurnian dan keindahan, menjadikannya pilihan sempurna untuk dekorasi rumah, kantor, atau sebagai hadiah yang bermakna. Aroma harum alami lily akan memenuhi ruangan dengan kesegaran.",
    price: 350000,
    category: "Bunga Segar",
    stock: 10,
  },
  {
    name: "Bunga Matahari Ceria",
    description:
      "Buket bunga matahari cerah yang akan membawa kebahagiaan dan semangat baru ke hari-hari Anda. Berisi 12 tangkai bunga matahari segar berukuran besar yang dirangkai dengan daun eucalyptus dan baby's breath. Bunga matahari melambangkan kebahagiaan, kesetiaan, dan umur panjang. Sempurna untuk menghibur orang tersayang atau mendekorasi ruangan dengan nuansa hangat dan ceria.",
    price: 195000,
    category: "Buket & Rangkaian",
    stock: 20,
  },
  {
    name: "Anggrek Bulan Phalaenopsis",
    description:
      "Anggrek bulan phalaenopsis premium dengan 2 tangkai berbunga penuh yang ditanam dalam pot keramik elegan bermotif minimalis. Anggrek bulan dikenal sebagai simbol keanggunan, kemewahan, dan kasih sayang yang abadi. Tanaman ini dapat bertahan berbulan-bulan dengan perawatan yang tepat, menjadikannya hadiah yang bernilai tinggi dan berkesan lama. Cocok untuk dekorasi ruang tamu, meja kerja, atau sebagai hadiah istimewa.",
    price: 475000,
    category: "Tanaman Hias",
    stock: 8,
  },
  {
    name: "Buket Tulip Belanda Mixed",
    description:
      "Buket penuh warna berisi 15 tangkai tulip impor dari Belanda dalam variasi warna merah, kuning, pink, dan ungu. Setiap tulip dipilih secara cermat untuk kesegaran dan kecantikan bentuknya yang khas. Tulip melambangkan cinta yang sempurna dan awal yang baru. Dirangkai dengan greenery segar dan dibungkus dalam wrapping kertas kraft premium yang ramah lingkungan.",
    price: 320000,
    category: "Bunga Segar",
    stock: 12,
  },
  {
    name: "Bunga Papan Happy Wedding",
    description:
      "Bunga papan ucapan pernikahan berukuran besar (2x1.5 meter) dengan rangkaian bunga segar yang mempesona. Terdiri dari mawar, gerbera, chrysanthemum, dan anyelir dalam perpaduan warna pink, putih, dan merah muda. Dilengkapi dengan banner ucapan yang dicetak dengan font elegan. Termasuk pengiriman dan pemasangan di lokasi acara dalam area Jawa Tengah. Membuat momen pernikahan semakin berkesan dan bermakna.",
    price: 750000,
    category: "Bunga Papan",
    stock: 5,
  },
  {
    name: "Terrarium Mini Succulent",
    description:
      "Terrarium mini dari kaca bening berbentuk geometris yang berisi koleksi succulent dan kaktus mini yang cantik. Setiap terrarium dirancang secara unik dengan kombinasi tanaman, batu hias warna-warni, dan pasir dekoratif. Tanaman succulent mudah dirawat dan tahan lama, menjadikannya pilihan ideal untuk pemula berkebun. Cocok sebagai dekorasi meja kerja, rak buku, atau hadiah unik yang berkesan.",
    price: 165000,
    category: "Tanaman Hias",
    stock: 25,
  },
  {
    name: "Hand Bouquet Peony Blush",
    description:
      "Hand bouquet romantis dengan peony garden rose blush pink sebagai bunga utama, dilengkapi dengan dusty miller, ranunculus, dan eucalyptus. Peony merupakan bunga yang melambangkan kemakmuran, keberuntungan, dan cinta yang bahagia. Dirangkai dalam bentuk bulat yang sempurna dengan handle satin putih yang nyaman digenggam. Pilihan ideal untuk hand bouquet pengantin atau hadiah anniversary yang tak terlupakan.",
    price: 425000,
    category: "Buket & Rangkaian",
    stock: 7,
  },
  {
    name: "Hampers Bunga & Cokelat",
    description:
      "Paket hampers eksklusif yang menggabungkan keindahan bunga segar dengan kelezatan cokelat premium. Berisi buket mini bunga campuran (mawar, carnation, baby's breath), satu kotak cokelat praline Belgia (12 pcs), dan kartu ucapan personal. Semua dikemas dalam gift box premium dengan pita satin. Hadiah yang sempurna untuk menunjukkan perhatian dan kasih sayang kepada orang tersayang di hari spesialnya.",
    price: 385000,
    category: "Kado & Hampers",
    stock: 18,
  },
  {
    name: "Dekorasi Bunga Meja Resepsi",
    description:
      "Set dekorasi bunga untuk meja resepsi atau acara formal yang terdiri dari rangkaian bunga centerpiece elegan. Menggunakan mawar putih, hydrangea, lisianthus, dan greenery yang disusun dalam vas kaca rendah. Setiap rangkaian dirancang untuk menambah keindahan dan keanggunan pada dekorasi meja tanpa menghalangi pandangan tamu. Harga per set untuk satu meja, minimum order 5 set untuk acara.",
    price: 225000,
    category: "Dekorasi",
    stock: 30,
  },
  {
    name: "Buket Lavender Kering",
    description:
      "Buket lavender kering premium yang dikeringkan secara natural untuk mempertahankan warna ungu indahnya dan aroma menenangkannya. Terdiri dari 50 tangkai lavender kering yang dirangkai dengan pita linen natural. Lavender terkenal dengan aromanya yang menenangkan dan membantu relaksasi. Dapat bertahan sangat lama sebagai dekorasi permanen yang indah dan harum di rumah atau kamar tidur Anda.",
    price: 145000,
    category: "Bunga Segar",
    stock: 35,
  },
  {
    name: "Bonsai Serut Mini",
    description:
      "Bonsai serut mini berusia 3-5 tahun yang telah dibentuk dengan teknik klasik Jepang oleh pengrajin bonsai berpengalaman. Ditanam dalam pot keramik tradisional dengan drainase yang baik. Bonsai melambangkan keharmonisan antara manusia, alam, dan jiwa. Cocok sebagai hadiah bermakna, koleksi tanaman hias, atau elemen dekorasi yang memberikan nuansa zen dan ketenangan pada ruangan Anda.",
    price: 295000,
    category: "Tanaman Hias",
    stock: 6,
  },
  {
    name: "Bunga Papan Duka Cita",
    description:
      "Bunga papan ucapan duka cita yang penuh empati dan penghormatan, berukuran standar (1.75x1.25 meter). Rangkaian bunga krisantemum putih, lily putih, mawar putih, dan daun palem yang tertata rapi menciptakan suasana khidmat dan penuh hormat. Dilengkapi banner ucapan turut berduka cita yang dicetak rapi. Termasuk pengiriman cepat ke rumah duka atau tempat pemakaman di area layanan.",
    price: 550000,
    category: "Bunga Papan",
    stock: 10,
  },
  {
    name: "Standing Flower Grand Opening",
    description:
      "Standing flower mewah untuk ucapan grand opening, selamat, dan sukses. Tinggi 1.8 meter dengan rangkaian bunga segar yang spektakuler menggunakan anggrek dendrobium, mawar, gerbera, dan daun monstera. Disusun pada standing frame kokoh berwarna gold yang menambah kesan megah dan prestisius. Statement piece yang sempurna untuk memberi kesan pertama yang tak terlupakan pada acara pembukaan usaha baru.",
    price: 850000,
    category: "Bunga Papan",
    stock: 4,
  },
  {
    name: "Pot Anthuriumm Merah",
    description:
      "Tanaman anthurium merah dengan daun-daun berkilau berbentuk hati yang cantik, ditanam dalam pot self-watering modern berwarna putih. Anthurium adalah tanaman tropis yang dikenal kemampuannya membersihkan udara dan berbunga sepanjang tahun dengan perawatan minimal. Bunga merahnya yang khas melambangkan semangat dan keberanian. Ideal untuk dekorasi interior, hadiah housewarming, atau menambah sentuhan tropis pada ruangan.",
    price: 185000,
    category: "Tanaman Hias",
    stock: 14,
  },
];

const REVIEWER_NAMES = [
  "Sari Dewi", "Budi Santoso", "Rina Wati", "Ahmad Fauzi", "Dian Purnama",
  "Eko Prasetyo", "Putri Rahayu", "Agus Setiawan", "Lestari Ningrum", "Rahmat Hidayat",
  "Nur Halimah", "Bambang Sutrisno", "Wulan Sari", "Hendra Gunawan", "Mega Lestari",
  "Fajar Nugroho", "Indah Permata", "Yusuf Maulana", "Anisa Fitriani", "Rizal Pratama",
];

const REVIEW_COMMENTS = [
  "Bunga sangat segar dan cantik, pengiriman cepat. Sangat puas!",
  "Rangkaian bunga indah sekali, penerima sangat senang. Terima kasih!",
  "Kualitas bunga premium, wangi dan tahan lama. Pasti order lagi.",
  "Pelayanan ramah dan profesional, bunga sesuai gambar. Recommended!",
  "Bunga sampai dalam kondisi sempurna, packaging rapi dan aman.",
  "Harga terjangkau untuk kualitas sebagus ini. Worth it banget!",
  "Desain rangkaian kreatif dan elegan, sangat cocok untuk hadiah.",
  "Bunga segar tahan sampai seminggu lebih, perawatannya mudah.",
  "Pengiriman tepat waktu, bunga masih segar saat sampai. Top!",
  "Sudah langganan di sini, kualitas selalu konsisten bagus.",
  "Warnanya cantik banget dan harum, bikin ruangan jadi segar.",
  "Pelayanan responsif, gampang custom sesuai permintaan kita.",
  "Buket ini jadi kejutan terbaik buat pasangan saya. Thank you!",
  "Tanaman sampai sehat dan subur, dikemas dengan sangat baik.",
  "Pilihan bunga beragam dan berkualitas, harga bersaing sekali.",
];

export async function POST() {
  try {
    const supabase = createServiceClient();

    // Verify admin (optional check since this is service client)
    // Get all shops
    const { data: shops, error: shopErr } = await supabase
      .from("shops")
      .select("id, name, kabupaten, kecamatan")
      .eq("is_active", true);

    if (shopErr || !shops) {
      return NextResponse.json(
        { success: false, message: "Failed to fetch shops: " + shopErr?.message },
        { status: 500 }
      );
    }

    // Get all categories
    const { data: categories } = await supabase
      .from("categories")
      .select("name");
    const categoryNames = categories?.map((c) => c.name) || CATEGORIES;

    let totalProductsCreated = 0;
    let totalReviewsCreated = 0;
    const shopResults: { shop: string; productsAdded: number }[] = [];

    for (const shop of shops) {
      // Check existing product count
      const { count: existingCount } = await supabase
        .from("products")
        .select("id", { count: "exact", head: true })
        .eq("shop_id", shop.id);

      const needed = Math.max(0, 10 - (existingCount || 0));
      if (needed === 0) {
        shopResults.push({ shop: shop.name, productsAdded: 0 });
        continue;
      }

      // Pick random product templates
      const shuffled = [...PRODUCT_TEMPLATES].sort(() => Math.random() - 0.5);
      const productsToCreate = shuffled.slice(0, needed).map((template, i) => {
        const imgIndex = ((existingCount || 0) + i) % FLOWER_IMAGES.length;
        const catIndex = Math.floor(Math.random() * categoryNames.length);
        // Vary prices slightly
        const priceVariation = Math.floor(Math.random() * 50000) - 25000;
        return {
          shop_id: shop.id,
          name: template.name,
          description: template.description,
          price: Math.max(50000, template.price + priceVariation),
          image_url: FLOWER_IMAGES[imgIndex],
          category: categoryNames[catIndex] || template.category,
          stock: template.stock + Math.floor(Math.random() * 10),
        };
      });

      const { data: insertedProducts, error: insertErr } = await supabase
        .from("products")
        .insert(productsToCreate)
        .select("id");

      if (insertErr) {
        console.error(`Failed to insert products for shop ${shop.name}:`, insertErr);
        continue;
      }

      totalProductsCreated += insertedProducts?.length || 0;
      shopResults.push({ shop: shop.name, productsAdded: insertedProducts?.length || 0 });

      // Create reviews for each new product (5-7 reviews each)
      if (insertedProducts) {
        for (const product of insertedProducts) {
          const reviewCount = 5 + Math.floor(Math.random() * 3); // 5-7 reviews
          const reviews = [];
          const usedNames = new Set<string>();

          for (let r = 0; r < reviewCount; r++) {
            let reviewerName: string;
            do {
              reviewerName = REVIEWER_NAMES[Math.floor(Math.random() * REVIEWER_NAMES.length)];
            } while (usedNames.has(reviewerName) && usedNames.size < REVIEWER_NAMES.length);
            usedNames.add(reviewerName);

            const comment = REVIEW_COMMENTS[Math.floor(Math.random() * REVIEW_COMMENTS.length)];
            // Ratings: mostly 4-5, occasionally 3
            const rating = Math.random() < 0.7 ? 5 : Math.random() < 0.6 ? 4 : 3;

            reviews.push({
              product_id: product.id,
              shop_id: shop.id,
              reviewer_name: reviewerName,
              rating,
              comment,
              created_at: new Date(
                Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000)
              ).toISOString(),
            });
          }

          const { error: reviewErr } = await supabase.from("reviews").insert(reviews);
          if (!reviewErr) {
            totalReviewsCreated += reviews.length;
          } else {
            console.error(`Failed to insert reviews for product ${product.id}:`, reviewErr);
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Seeded ${totalProductsCreated} products and ${totalReviewsCreated} reviews`,
      details: shopResults,
    });
  } catch (error) {
    console.error("[POST /api/admin/seed-products] Exception:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
