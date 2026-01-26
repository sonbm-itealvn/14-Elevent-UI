<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import Logo from '@/shared/components/logo/Logo.vue';
import {
  PhoneCall,
  Mail,
  MapPin,
  BrandFacebook,
  BrandInstagram,
  ArrowRight,
  BrandTiktok
} from '@vicons/tabler';
import CategoryService from '@/core/services/api/category.service';
import type { CategoryTreeResponse } from '@/domain/models/category.model';

const router = useRouter();

const handleSupportClick = () => {
  router.push({ name: 'Contact' }).then(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
};

// Danh mục trong footer với mapping tên -> slug
const footerCategories = ref<Array<{ name: string; slug: string | null }>>([
  { name: 'Đồ ăn Nhật Bản', slug: null },
  { name: 'Đồ uống truyền thống', slug: null },
  { name: 'Snack cao cấp', slug: null },
  { name: 'Sản phẩm bán chạy', slug: null },
]);

// Load categories và map với footer categories
const loadCategorySlugs = async () => {
  try {
    const categories = await CategoryService.getCategoryTree();
    
    // Tìm slug cho mỗi danh mục trong footer
    const findSlugByName = (name: string): string | null => {
      // Tìm trong parent categories
      for (const cat of categories) {
        if (cat.name === name || cat.name.trim() === name.trim()) {
          return cat.slug;
        }
        // Tìm trong children
        if (cat.children) {
          for (const child of cat.children) {
            if (child.name === name || child.name.trim() === name.trim()) {
              return child.slug;
            }
          }
        }
      }
      // Nếu không tìm thấy, log để debug
      console.log('Category not found:', name, 'Available categories:', categories.map(c => c.name));
      return null;
    };
    
    footerCategories.value = footerCategories.value.map(cat => ({
      ...cat,
      slug: findSlugByName(cat.name)
    }));
  } catch (error) {
    console.error('Error loading categories for footer:', error);
  }
};

onMounted(() => {
  loadCategorySlugs();
});
</script>

<template>
  <footer class="bg-black text-white border-t-4 border-[#b3000f]">
    <div class="max-w-6xl mx-auto px-4 md:px-8 lg:px-12 py-12">
      <div class="grid gap-10 md:grid-cols-4">
        <div class="space-y-4">
          <Logo />
          <p class="text-sm text-neutral-300 leading-relaxed">
            Nơi hội tụ tinh hoa ẩm thực Nhật Bản, mang đến trải nghiệm chân thực nhất từ xứ sở hoa anh đào.
          </p>
        </div>

        <div class="space-y-3">
          <h4 class="text-lg font-semibold uppercase tracking-wide">Danh mục</h4>
          <ul class="space-y-2 text-sm text-neutral-300">
            <li v-for="category in footerCategories" :key="category.name">
              <router-link
                v-if="category.name === 'Sản phẩm bán chạy'"
                :to="{ name: 'BestSellers' }"
                class="flex items-center gap-2 hover:text-white transition-colors cursor-pointer"
              >
                <ArrowRight class="h-4 w-4" /> {{ category.name }}
              </router-link>
              <router-link
                v-else
                :to="category.slug ? { name: 'Products', query: { categorySlug: category.slug } } : { name: 'Products' }"
                class="flex items-center gap-2 hover:text-white transition-colors cursor-pointer"
              >
                <ArrowRight class="h-4 w-4" /> {{ category.name }}
              </router-link>
            </li>
          </ul>
        </div>

        <div class="space-y-3">
          <h4 class="text-lg font-semibold uppercase tracking-wide">Hỗ trợ</h4>
          <ul class="space-y-2 text-sm text-neutral-300">
            <li @click="handleSupportClick" class="flex items-center gap-2 hover:text-white cursor-pointer transition-colors">
              <ArrowRight class="h-4 w-4" /> Chính sách vận chuyển
            </li>
            <li @click="handleSupportClick" class="flex items-center gap-2 hover:text-white cursor-pointer transition-colors">
              <ArrowRight class="h-4 w-4" /> Đổi trả hàng
            </li>
            <li @click="handleSupportClick" class="flex items-center gap-2 hover:text-white cursor-pointer transition-colors">
              <ArrowRight class="h-4 w-4" /> Câu hỏi thường gặp
            </li>
            <li @click="handleSupportClick" class="flex items-center gap-2 hover:text-white cursor-pointer transition-colors">
              <ArrowRight class="h-4 w-4" /> Điều khoản dịch vụ
            </li>
          </ul>
        </div>

        <div class="space-y-4">
          <h4 class="text-lg font-semibold uppercase tracking-wide">Liên hệ</h4>
          <div class="space-y-3 text-sm text-neutral-300">
            <div class="flex items-center gap-2">
              <PhoneCall class="h-5 w-5 text-[#b3000f]" />
              <div>
                <div class="font-semibold text-white">+84 812 325 555</div>
                <div class="text-xs text-neutral-400">Mon - Sun: 8:00 - 22:00</div>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <Mail class="h-5 w-5 text-[#b3000f]" />
              <span>14elevent@gmail.com</span>
            </div>
            <div class="flex items-center gap-2">
              <MapPin class="h-5 w-5 text-[#b3000f]" />
              <span>Số 13, Bùi Ngọc Dương, Bạch Mai, Hà Nội, Việt Nam</span>
            </div>
          </div>
          <div class="flex items-center gap-3 pt-2">
            <a href="https://www.facebook.com/share/187u9XAvb2/?mibextid=wwXIfr" target="_blank" rel="noopener noreferrer"
              class="h-10 w-10 border border-neutral-500 hover:border-white flex items-center justify-center transition-colors">
              <BrandFacebook class="h-5 w-5" />
            </a>

            <a href="https://www.instagram.com/14elevent_jp/?igsh=NjZhZGFob2JzZWdh&utm_source=qr" target="_blank" rel="noopener noreferrer"
              class="h-10 w-10 border border-neutral-500 hover:border-white flex items-center justify-center transition-colors">
              <BrandInstagram class="h-5 w-5" />
            </a>

            <a href="https://www.tiktok.com/@14elevent.jp?_r=1&_t=ZS-92rnoFw1euj" target="_blank" rel="noopener noreferrer"
              class="h-10 w-10 border border-neutral-500 hover:border-white flex items-center justify-center transition-colors">
              <BrandTiktok class="h-5 w-5" />
            </a>
          </div>
        </div>
      </div>

      <div class="border-t border-neutral-800 mt-10 pt-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4 text-sm text-neutral-400">
        <div>© 2026 SC Software. All rights reserved.</div>
        <div class="flex items-center gap-4 text-xs uppercase tracking-wide">
          <span class="hover:text-white cursor-pointer">Privacy Policy</span>
          <span class="hover:text-white cursor-pointer">Terms of Service</span>
          <span class="hover:text-white cursor-pointer">Cookie Policy</span>
        </div>
      </div>
    </div>
  </footer>
</template>