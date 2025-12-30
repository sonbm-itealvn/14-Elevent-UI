<script setup lang="ts">
const heroImage =
  "https://images.unsplash.com/photo-1545134969-8debd725b007?auto=format&fit=crop&w=1600&q=80";

const bestSellers = [
  {
    id: 1,
    title: "Premium Sushi Set",
    jpTitle: "プレミアム寿司セット",
    desc: "Freshly made sushi set with premium ingredients",
    price: "450.000 đ",
    image:
      "https://images.unsplash.com/photo-1553621042-f6e147245754?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: 2,
    title: "Traditional Ramen",
    jpTitle: "ラーメン",
    desc: "Rich and flavorful traditional Japanese ramen",
    price: "120.000 đ",
    image:
      "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: 3,
    title: "Matcha Tea Set",
    jpTitle: "抹茶セット",
    desc: "Premium matcha tea powder from Kyoto",
    price: "180.000 đ",
    image:
      "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: 4,
    title: "Mochi Dessert Box",
    jpTitle: "もちデザート",
    desc: "Assorted mochi with classic Japanese flavors",
    price: "150.000 đ",
    image:
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80",
  },
];

const promotionProducts = [
  {
    id: 1,
    title: "Premium Sushi Set",
    jpTitle: "プレミアム寿司セット",
    category: "FOOD",
    price: "450.000 đ",
    tag: "NEW",
    image:
      "https://images.unsplash.com/photo-1553621042-f6e147245754?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: 2,
    title: "Traditional Ramen",
    jpTitle: "ラーメン",
    category: "FOOD",
    price: "120.000 đ",
    tag: "NEW",
    image:
      "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: 3,
    title: "Matcha Tea Set",
    jpTitle: "抹茶セット",
    category: "DRINK",
    price: "180.000 đ",
    tag: "NEW",
    image:
      "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: 4,
    title: "Premium Sake",
    jpTitle: "プレミアム日本酒",
    category: "DRINK",
    price: "350.000 đ",
    tag: "NEW",
    image:
      "https://images.unsplash.com/photo-1481391204139-7c1d3d98adf1?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: 5,
    title: "Onigiri Combo",
    jpTitle: "おにぎりセット",
    category: "SNACK",
    price: "90.000 đ",
    tag: "SALE",
    oldPrice: "120.000 đ",
    image:
      "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=1200&q=80&sat=-50",
  },
  {
    id: 6,
    title: "Takoyaki Box",
    jpTitle: "たこ焼きボックス",
    category: "FOOD",
    price: "110.000 đ",
    tag: "SALE",
    oldPrice: "140.000 đ",
    image:
      "https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: 7,
    title: "Dorayaki Mix",
    jpTitle: "どら焼きミックス",
    category: "SNACK",
    price: "95.000 đ",
    tag: "SALE",
    oldPrice: "120.000 đ",
    image:
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80&sat=-30",
  },
  {
    id: 8,
    title: "Uji Matcha Latte",
    jpTitle: "宇治抹茶ラテ",
    category: "DRINK",
    price: "75.000 đ",
    tag: "SALE",
    oldPrice: "95.000 đ",
    image:
      "https://images.unsplash.com/photo-1481391032119-d89fee407e44?auto=format&fit=crop&w=1200&q=80",
  },
];

const newsFeatured = [
  {
    id: 1,
    title: "Top 5+ giỏ quà Tết Nhật sang trọng giá tốt năm 2026",
    date: "03/12/2025",
    desc: "Khám phá 5 lựa chọn giỏ quà Tết Nhật chính hãng, sang trọng năm 2026.",
    image:
      "https://images.unsplash.com/photo-1511690656952-34342bb7c2f2?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: 2,
    title: "Top 10+ quà Tết 2026 sang trọng cho doanh nghiệp",
    date: "28/11/2025",
    desc: "Quà tặng chuẩn Nhật ý nghĩa, ghi điểm và gắn kết mối quan hệ.",
    image:
      "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: 3,
    title: "Review chi tiết các mẫu giỏ quà Tết Nhật mới nhất 2026",
    date: "27/11/2025",
    desc: "Giỏ quà Tết Nhật bản chất lượng, thiết kế ấn tượng, phù hợp biếu tặng.",
    image:
      "https://images.unsplash.com/photo-1523365280197-f21d6cfc1c67?auto=format&fit=crop&w=1200&q=80",
  },
];

const newsList = [
  {
    id: 4,
    title: "Vui mua sắm – Rinh lịch để bàn 2026 phong cách Nhật Bản",
    date: "05/12/2025",
    desc: "Hóa đơn từ 600.000đ tặng lịch để bàn 2026 phong cách Nhật.",
    image:
      "https://images.unsplash.com/photo-1462396881884-de2c07cb95ed?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 5,
    title: "Đua đơn Black Friday – Nhận quà cực đã cùng Nihon Market",
    date: "23/11/2025",
    desc: "Sale bùng cháy, quà tặng hấp dẫn cho mọi đơn hàng.",
    image:
      "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 6,
    title: "Mừng 20 tháng 10 – Săn quà Nhật rạng rỡ",
    date: "20/10/2025",
    desc: "Đơn 600k/1 triệu/2 triệu nhận quà xinh dịp 20/10.",
    image:
      "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=800&q=80",
  },
];
</script>

<template>
  <section class="relative min-h-[calc(100vh-80px)] bg-black text-white overflow-hidden">
    <div class="absolute inset-0">
      <img
        :src="heroImage"
        alt="Nihon Market Background"
        class="w-full h-full object-cover opacity-80"
      />
      <div
        class="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-black/30"
      ></div>
    </div>

    <div class="relative z-10 max-w-6xl mx-auto px-6 md:px-10 lg:px-14 py-16 lg:py-24 h-full flex items-center">
      <div class="space-y-6 max-w-3xl">
        <div class="flex items-center gap-3 text-sm uppercase tracking-[0.25em] text-red-500 font-semibold">
          <span class="h-[2px] w-12 bg-red-600"></span>
          <span>Authentic Japanese Taste</span>
        </div>

        <h1 class="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
          Hương Vị <span class="text-red-500">Nhật Bản</span><br />
          Chính Gốc
        </h1>

        <p class="text-lg md:text-xl text-neutral-200 max-w-2xl leading-relaxed">
          Trải nghiệm tinh hoa ẩm thực Nhật Bản với bộ sưu tập cao cấp được tuyển chọn
          từ các vùng nổi tiếng nhất xứ sở hoa anh đào.
        </p>

        <div class="flex flex-wrap gap-4 pt-2">
          <button
            class="px-6 py-3 bg-[#b3000f] hover:bg-[#c00015] text-white font-semibold rounded-md shadow-lg shadow-red-900/30 transition-all duration-200"
          >
            KHÁM PHÁ NGAY
          </button>
          <button
            class="px-6 py-3 bg-white text-black font-semibold rounded-md hover:bg-neutral-100 transition-all duration-200"
          >
            SẢN PHẨM HOT
          </button>
        </div>
      </div>
    </div>
  </section>

  <section class="bg-[#f7f7f7] py-14 px-4 md:px-8 lg:px-12">
    <div class="max-w-6xl mx-auto text-center mb-10">
      <div class="flex items-center justify-center gap-3 text-sm uppercase tracking-[0.2em] text-red-600 font-semibold mb-3">
        <span class="h-[2px] w-12 bg-red-600"></span>
        <span>Sản phẩm bán chạy</span>
        <span class="h-[2px] w-12 bg-red-600"></span>
      </div>
      <p class="text-neutral-500 text-sm">ベストセラー商品</p>
    </div>

    <div class="max-w-6xl mx-auto grid gap-8 md:grid-cols-2 lg:grid-cols-4">
      <div
        v-for="item in bestSellers"
        :key="item.id"
        class="bg-white shadow-md hover:shadow-lg transition-shadow duration-200 border border-neutral-200 flex flex-col"
      >
        <div class="relative">
          <img :src="item.image" :alt="item.title" class="w-full h-56 object-cover" />
          <div class="absolute top-3 left-3 bg-[#b3000f] text-white px-3 py-1 text-sm font-semibold rounded">
            #{{ item.id }}
          </div>
        </div>

        <div class="p-5 flex-1 flex flex-col gap-3">
          <div>
            <h3 class="text-lg font-semibold text-neutral-900 uppercase tracking-wide">{{ item.title }}</h3>
            <p class="text-sm text-neutral-500">{{ item.jpTitle }}</p>
          </div>
          <p class="text-sm text-neutral-600 leading-relaxed flex-1">{{ item.desc }}</p>
          <div class="flex items-center justify-between pt-2">
            <span class="text-red-600 font-semibold text-lg">{{ item.price }}</span>
            <button
              class="flex items-center gap-2 px-4 py-2 bg-black text-white uppercase text-sm font-semibold hover:bg-neutral-800 transition-colors duration-200"
            >
              <span class="text-xs">Add</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </section>

  <section class="bg-white py-14 px-4 md:px-8 lg:px-12">
    <div class="max-w-6xl mx-auto text-center mb-10">
      <div class="flex items-center justify-center gap-3 text-sm uppercase tracking-[0.2em] text-red-600 font-semibold mb-3">
        <span class="h-[2px] w-12 bg-red-600"></span>
        <span>Sản phẩm khuyến mãi</span>
        <span class="h-[2px] w-12 bg-red-600"></span>
      </div>
      <p class="text-neutral-500 text-sm">セール商品</p>
    </div>

    <div class="max-w-6xl mx-auto grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
      <div
        v-for="item in promotionProducts"
        :key="item.id"
        class="border border-neutral-200 shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col"
      >
        <div class="relative">
          <img :src="item.image" :alt="item.title" class="w-full h-56 object-cover" />
          <div
            class="absolute top-3 left-3 bg-black text-white px-3 py-1 text-sm font-semibold rounded"
            :class="item.tag === 'SALE' ? 'bg-[#b3000f]' : 'bg-black'"
          >
            {{ item.tag }}
          </div>
        </div>
        <div class="p-5 flex-1 flex flex-col gap-3">
          <div class="text-xs font-semibold tracking-wide text-neutral-500 uppercase">
            {{ item.category }}
          </div>
          <div>
            <h3 class="text-lg font-semibold text-neutral-900">{{ item.title }}</h3>
            <p class="text-sm text-neutral-500">{{ item.jpTitle }}</p>
          </div>
          <div class="flex items-center justify-between pt-2">
            <div class="flex items-baseline gap-2">
              <span class="text-red-600 font-semibold text-lg">{{ item.price }}</span>
              <span
                v-if="item.oldPrice"
                class="text-sm text-neutral-400 line-through"
              >
                {{ item.oldPrice }}
              </span>
            </div>
            <button
              class="h-9 w-9 flex items-center justify-center border border-neutral-300 hover:border-neutral-500 transition-colors duration-200"
            >
              🛒
            </button>
          </div>
        </div>
      </div>
    </div>
  </section>

  <section class="bg-white py-14 px-4 md:px-8 lg:px-12">
    <div class="max-w-6xl mx-auto">
      <div class="flex items-center justify-between mb-8">
        <div>
          <div class="flex items-center gap-3 text-sm uppercase tracking-[0.2em] text-red-600 font-semibold mb-2">
            <span class="h-[2px] w-12 bg-red-600"></span>
            <span>Tin tức & Blog</span>
          </div>
          <p class="text-neutral-500 text-sm">Cập nhật ưu đãi, bài viết, tin nổi bật</p>
        </div>
        <a class="text-red-600 font-semibold text-sm hover:underline cursor-pointer">Xem tất cả</a>
      </div>

      <div class="grid gap-6 lg:grid-cols-3 mb-10">
        <div
          v-for="item in newsFeatured"
          :key="item.id"
          class="border border-neutral-200 shadow-sm hover:shadow-md transition-shadow duration-200 bg-white"
        >
          <img :src="item.image" :alt="item.title" class="w-full h-52 object-cover" />
          <div class="p-5 space-y-2">
            <div class="text-xs font-semibold text-red-600">{{ item.date }}</div>
            <h3 class="text-lg font-semibold text-neutral-900 leading-snug">
              {{ item.title }}
            </h3>
            <p class="text-sm text-neutral-600 leading-relaxed">
              {{ item.desc }}
            </p>
          </div>
        </div>
      </div>

      <div class="grid gap-6 lg:grid-cols-[1.5fr,1fr] items-start">
        <div class="space-y-4">
          <div
            v-for="item in newsList"
            :key="item.id"
            class="flex gap-4 border border-neutral-200 p-4 hover:shadow-sm transition-shadow duration-200"
          >
            <img :src="item.image" :alt="item.title" class="w-28 h-20 object-cover flex-shrink-0" />
            <div class="space-y-1">
              <div class="text-xs font-semibold text-red-600">{{ item.date }}</div>
              <h4 class="text-base font-semibold text-neutral-900 leading-snug">
                {{ item.title }}
              </h4>
              <p class="text-sm text-neutral-600">{{ item.desc }}</p>
            </div>
          </div>
        </div>

        <div class="border border-neutral-200 bg-[#f7f7f7] p-6 text-center flex flex-col items-center gap-3">
          <div class="text-2xl font-semibold text-red-600">Nihon Market cần bạn</div>
          <p class="text-neutral-700 text-sm leading-relaxed">
            Tham gia đội ngũ để lan tỏa hương vị Nhật Bản chính gốc. Ứng tuyển ngay!
          </p>
          <button class="px-5 py-2 bg-black text-white font-semibold uppercase text-sm hover:bg-neutral-800 transition-colors duration-200">
            Ứng tuyển
          </button>
        </div>
      </div>
    </div>
  </section>
</template>
