<script setup lang="ts">
import { ref, onMounted } from 'vue';
import PublicProductService from '@/core/services/api/public-product.service';
import type { PublicProduct } from '@/core/services/api/public-product.service';
import { useMessage } from 'naive-ui';
import ContactService from '@/core/services/api/contact.service';
import YoutubeService, { type YoutubeVideo } from '@/core/services/api/youtube.service';
import { Bolt } from '@vicons/tabler';

const message = useMessage();
const heroImage =
  "https://images.unsplash.com/photo-1545134969-8debd725b007?auto=format&fit=crop&w=1600&q=80";

const bestSellers = ref<PublicProduct[]>([]);
const promotionProducts = ref<PublicProduct[]>([]);
const loading = ref(false);

// YouTube latest videos
const youtubeVideos = ref<YoutubeVideo[]>([]);
const loadingYoutube = ref(false);

const formatPrice = (price?: number) => {
  if (!price) return '0 đ';
  return new Intl.NumberFormat('vi-VN').format(price) + ' đ';
};

const calculateOriginalPrice = (salePrice: number, salePercentage: number): number => {
  // Giá gốc = Giá sale / (1 - salePercentage/100)
  const originalPrice = salePrice / (1 - salePercentage / 100);
  // Làm tròn đến hàng nghìn
  return Math.round(originalPrice / 1000) * 1000;
};

const loadBestSellers = async () => {
  try {
    loading.value = true;
    const products = await PublicProductService.getTopSelling(4);
    bestSellers.value = products;
  } catch (error: any) {
    console.error('Error loading best sellers:', error);
    message.error('Lỗi khi tải sản phẩm bán chạy');
  } finally {
    loading.value = false;
  }
};

const loadPromotionProducts = async () => {
  try {
    // Load products with pagination
    const response = await PublicProductService.getProducts({
      page: 0,
      size: 100, // Load nhiều hơn để filter sản phẩm đang sale
      sort: 'newest'
    });
    // Chỉ hiển thị sản phẩm có isOnSale = true
    promotionProducts.value = response.content.filter(product => product.isOnSale === true).slice(0, 8);
  } catch (error: any) {
    console.error('Error loading promotion products:', error);
    message.error('Lỗi khi tải sản phẩm khuyến mãi');
  }
};

const loadYoutubeLatest = async () => {
  try {
    loadingYoutube.value = true;
    const videos = await YoutubeService.getLatest();
    // Lấy 3 video mới nhất (phòng khi API trả nhiều hơn)
    youtubeVideos.value = Array.isArray(videos) ? videos.slice(0, 3) : [];
  } catch (error: any) {
    console.error('Error loading latest YouTube videos:', error);
    message.error('Lỗi khi tải video mới nhất từ YouTube');
  } finally {
    loadingYoutube.value = false;
  }
};

onMounted(() => {
  loadBestSellers();
  loadPromotionProducts();
  loadYoutubeLatest();
});

// Mock news data (giữ lại cho block phía trên)
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
      "https://images.unsplash.com/photo-1578662996442-48f60103fc96?auto=format&fit=crop&w=1200&q=80",
  },
];

// Danh sách bài viết text cũ bên phải đã được thay bằng video YouTube mới nhất

const showApplyForm = ref(false);
const applyForm = ref({
  name: '',
  email: '',
  phone: '',
});
const submittingApply = ref(false);

const openApplyForm = () => {
  showApplyForm.value = true;
};

const closeApplyForm = () => {
  if (submittingApply.value) return;
  showApplyForm.value = false;
};

const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePhone = (phone: string): boolean => {
  if (!phone.trim()) return true; // Phone is optional
  // Chấp nhận số điện thoại Việt Nam: 0xxxxxxxxx hoặc +84xxxxxxxxx hoặc 84xxxxxxxxx
  const phoneRegex = /^(0|\+84|84)[1-9][0-9]{8,9}$/;
  const cleanPhone = phone.replace(/[\s-]/g, '');
  return phoneRegex.test(cleanPhone);
};

const submitApply = async () => {
  if (submittingApply.value) return;
  
  // Validate email
  if (!applyForm.value.email.trim()) {
    message.warning('Vui lòng nhập email.');
    return;
  }
  if (!validateEmail(applyForm.value.email)) {
    message.warning('Email không hợp lệ. Vui lòng nhập đúng định dạng email.');
    return;
  }
  
  // Validate phone (optional but if provided must be valid)
  if (applyForm.value.phone.trim() && !validatePhone(applyForm.value.phone)) {
    message.warning('Số điện thoại không hợp lệ. Vui lòng nhập số điện thoại Việt Nam (10-11 số, bắt đầu bằng 0 hoặc +84).');
    return;
  }
  
  submittingApply.value = true;
  try {
    await ContactService.sendContact({
      name: applyForm.value.name,
      email: applyForm.value.email,
      phone: applyForm.value.phone,
      title: 'Ứng tuyển',
      subject: 'Nhân viên bán hàng',
      content: 'Ứng tuyển làm việc',
    });
    message.success('Đã gửi thông tin ứng tuyển thành công!');
    applyForm.value = {
      name: '',
      email: '',
      phone: '',
    };
    showApplyForm.value = false;
  } catch (error) {
    console.error('Error sending application:', error);
    message.error('Gửi thông tin ứng tuyển thất bại, vui lòng thử lại sau.');
  } finally {
    submittingApply.value = false;
  }
};
</script>

<template>
  <section class="relative min-h-[calc(100vh-80px)] bg-black text-white overflow-hidden">
    <div class="absolute inset-0">
      <img
        :src="heroImage"
        alt="14 Elevent Background"
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
          <router-link
            :to="{ name: 'Products' }"
            class="px-6 py-3 bg-[#b3000f] hover:bg-[#c00015] text-white font-semibold rounded-md shadow-lg shadow-red-900/30 transition-all duration-200 inline-block"
          >
            KHÁM PHÁ NGAY
          </router-link>
          <router-link
            :to="{ name: 'BestSellers' }"
            class="px-6 py-3 bg-white text-black font-semibold rounded-md hover:bg-neutral-100 transition-all duration-200 inline-block"
          >
            SẢN PHẨM HOT
          </router-link>
        </div>
      </div>
    </div>
  </section>

  <section v-if="bestSellers.length > 0 || loading" class="bg-[#f7f7f7] py-14 px-4 md:px-8 lg:px-12">
    <div class="max-w-6xl mx-auto text-center mb-10">
      <div class="flex items-center justify-center gap-3 text-sm uppercase tracking-[0.2em] text-red-600 font-semibold mb-3">
        <span class="h-[2px] w-12 bg-red-600"></span>
        <span>Sản phẩm bán chạy</span>
        <span class="h-[2px] w-12 bg-red-600"></span>
      </div>
      <p class="text-neutral-500 text-sm">ベストセラー商品</p>
    </div>

    <div v-if="loading" class="max-w-6xl mx-auto text-center py-10">
      <p class="text-neutral-500">Đang tải...</p>
    </div>
    <div v-else-if="bestSellers.length > 0" class="max-w-6xl mx-auto grid gap-8 md:grid-cols-2 lg:grid-cols-4">
      <div
        v-for="(item, index) in bestSellers"
        :key="item.id"
        class="bg-white shadow-md hover:shadow-lg transition-shadow duration-200 border border-neutral-200 flex flex-col rounded-md overflow-hidden"
      >
        <router-link :to="{ name: 'ProductDetail', params: { slug: item.slug } }" class="block flex-1">
          <div class="relative bg-neutral-50 flex items-center justify-center" style="height: 200px;">
            <img :src="item.thumbnail || 'https://via.placeholder.com/400'" :alt="item.name" class="max-w-full max-h-full object-contain" />
            <!-- Badge góc trên bên trái -->
            <div v-if="item.isOnSale" class="absolute top-3 left-3 bg-red-600 text-white px-3 py-1 text-sm font-semibold rounded flex items-center gap-1">
              <Bolt class="h-4 w-4" />
              FLASH SALE
            </div>
            <div v-else class="absolute top-3 left-3 bg-[#b3000f] text-white px-3 py-1 text-sm font-semibold rounded">
              #{{ index + 1 }}
            </div>
            <!-- % Sale góc trên bên phải -->
            <div v-if="item.isOnSale && item.salePercentage" class="absolute top-3 right-3 bg-red-600 text-white px-3 py-1 text-sm font-bold rounded">
              -{{ item.salePercentage }}%
            </div>
          </div>

          <div class="p-5 flex flex-col gap-3">
            <div>
              <h3 class="text-lg font-semibold text-neutral-900 uppercase tracking-wide line-clamp-2">{{ item.name }}</h3>
              <p v-if="item.brand" class="text-sm text-neutral-500">{{ item.brand }}</p>
            </div>
          </div>
        </router-link>
        <div class="px-5 pb-4 pt-0 flex flex-col gap-1 border-t border-neutral-100">
          <div v-if="item.isOnSale && item.salePercentage && item.minPrice" class="flex flex-col gap-1">
            <!-- Giá gốc với đường gạch ngang -->
            <span class="text-neutral-400 text-sm line-through">
              {{ formatPrice(calculateOriginalPrice(item.minPrice, item.salePercentage)) }}
            </span>
            <!-- Giá sale -->
            <span class="text-red-600 font-semibold text-lg">{{ formatPrice(item.minPrice) }}</span>
          </div>
          <div v-else>
            <span class="text-red-600 font-semibold text-lg">{{ formatPrice(item.minPrice) }}</span>
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
        class="border border-neutral-200 shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col rounded-md overflow-hidden"
      >
        <router-link :to="{ name: 'ProductDetail', params: { slug: item.slug } }" class="block flex-1">
          <div class="relative bg-neutral-50 flex items-center justify-center" style="height: 200px;">
            <img :src="item.thumbnail || 'https://via.placeholder.com/400'" :alt="item.name" class="max-w-full max-h-full object-contain" />
            <!-- Badge góc trên bên trái -->
            <div v-if="item.isOnSale" class="absolute top-3 left-3 bg-red-600 text-white px-3 py-1 text-sm font-semibold rounded flex items-center gap-1">
              <Bolt class="h-4 w-4" />
              FLASH SALE
            </div>
            <div v-else class="absolute top-3 left-3 bg-black text-white px-3 py-1 text-sm font-semibold rounded">
              NEW
            </div>
            <!-- % Sale góc trên bên phải -->
            <div v-if="item.isOnSale && item.salePercentage" class="absolute top-3 right-3 bg-red-600 text-white px-3 py-1 text-sm font-bold rounded">
              -{{ item.salePercentage }}%
            </div>
          </div>
          <div class="p-5 flex flex-col gap-3">
            <div v-if="item.brand" class="text-xs font-semibold tracking-wide text-neutral-500 uppercase">
              {{ item.brand }}
            </div>
            <div>
              <h3 class="text-lg font-semibold text-neutral-900 line-clamp-2">{{ item.name }}</h3>
              <p v-if="item.origin" class="text-sm text-neutral-500">{{ item.origin }}</p>
            </div>
          </div>
        </router-link>
        <div class="px-5 pb-4 pt-0 flex flex-col gap-1 border-t border-neutral-100">
          <div v-if="item.isOnSale && item.salePercentage && item.minPrice" class="flex flex-col gap-1">
            <!-- Giá gốc với đường gạch ngang -->
            <span class="text-neutral-400 text-sm line-through">
              {{ formatPrice(calculateOriginalPrice(item.minPrice, item.salePercentage)) }}
            </span>
            <!-- Giá sale -->
            <span class="text-red-600 font-semibold text-lg">{{ formatPrice(item.minPrice) }}</span>
          </div>
          <div v-else class="flex items-baseline gap-2">
            <span class="text-red-600 font-semibold text-lg">{{ formatPrice(item.minPrice) }}</span>
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
        <router-link
          v-for="item in newsFeatured"
          :key="item.id"
          :to="{ name: 'ArticleDetail', params: { id: item.id } }"
          class="border border-neutral-200 shadow-sm hover:shadow-md transition-shadow duration-200 bg-white cursor-pointer block"
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
        </router-link>
      </div>

      <div class="grid gap-6 lg:grid-cols-[1.5fr,1fr] items-start">
        <div class="space-y-4">
          <a
            v-for="item in youtubeVideos"
            :key="item.videoId"
            :href="`https://www.youtube.com/watch?v=${item.videoId}`"
            target="_blank"
            rel="noopener noreferrer"
            class="flex gap-4 border border-neutral-200 p-4 hover:shadow-sm transition-shadow duration-200 cursor-pointer block"
          >
            <img
              :src="item.thumbnailUrl"
              :alt="item.title"
              class="w-28 h-20 object-cover flex-shrink-0"
            />
            <div class="space-y-1">
              <div class="text-xs font-semibold text-red-600">
                {{ item.publishedAt }}
              </div>
              <h4 class="text-base font-semibold text-neutral-900 leading-snug line-clamp-2">
                {{ item.title }}
              </h4>
              <p class="text-sm text-neutral-600 line-clamp-2">
                {{ item.description }}
              </p>
            </div>
          </a>
        </div>
        <div class="border border-neutral-200 bg-[#f7f7f7] p-6 text-center flex flex-col items-center gap-3">
          <div class="text-2xl font-semibold text-red-600">14Elevent cần bạn</div>
          <p class="text-neutral-700 text-sm leading-relaxed">
            Tham gia đội ngũ để lan tỏa hương vị Nhật Bản chính gốc. Ứng tuyển ngay!
          </p>
          <button
            class="px-5 py-2 bg-black text-white font-semibold uppercase text-sm hover:bg-neutral-800 transition-colors duration-200" style="cursor: pointer;"
            @click="openApplyForm"
          >
            Ứng tuyển
          </button>
        </div>
      </div>
    </div>
  </section>

  <div
    v-if="showApplyForm"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
  >
    <div class="bg-white w-full max-w-md rounded-md shadow-xl p-6 relative">
      <button
        class="absolute top-3 right-3 text-neutral-500 hover:text-black text-xl leading-none"
        type="button"
        @click="closeApplyForm"
      >
        ×
      </button>
      <h2 class="text-xl font-semibold mb-4 text-neutral-900 text-center">
        Ứng tuyển vị trí <span class="text-red-600">Nhân viên bán hàng</span>
      </h2>
      <form class="space-y-4" @submit.prevent="submitApply">
        <div>
          <label class="block text-sm font-medium text-neutral-700 mb-1">Họ và tên *</label>
          <input
            v-model="applyForm.name"
            type="text"
            required
            class="w-full px-3 py-2 border border-neutral-300 focus:border-red-600 focus:outline-none focus:ring-1 focus:ring-red-500 text-sm"
            placeholder="Nhập họ và tên"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-neutral-700 mb-1">Email *</label>
          <input
            v-model="applyForm.email"
            type="email"
            required
            class="w-full px-3 py-2 border border-neutral-300 focus:border-red-600 focus:outline-none focus:ring-1 focus:ring-red-500 text-sm"
            placeholder="your.email@example.com"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-neutral-700 mb-1">Số điện thoại</label>
          <input
            v-model="applyForm.phone"
            type="tel"
            class="w-full px-3 py-2 border border-neutral-300 focus:border-red-600 focus:outline-none focus:ring-1 focus:ring-red-500 text-sm"
            placeholder="+84 123 456 789"
          />
        </div>
        <p class="text-xs text-neutral-500">
          Khi gửi, hệ thống sẽ chuyển thông tin của bạn đến bộ phận tuyển dụng với tiêu đề
          "<span class="font-semibold">Ứng tuyển - Nhân viên bán hàng</span>".
        </p>
        <button
          type="submit"
          :disabled="submittingApply"
          class="w-full mt-2 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white text-sm font-semibold uppercase tracking-wide transition-colors duration-200"
        >
          {{ submittingApply ? 'Đang gửi...' : 'Gửi ứng tuyển' }}
        </button>
      </form>
    </div>
  </div>
</template>
