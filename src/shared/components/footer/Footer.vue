<script setup lang="ts">
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
            <li class="flex items-center gap-2 hover:text-white cursor-pointer transition-colors">
              <ArrowRight class="h-4 w-4" /> Đồ ăn Nhật Bản
            </li>
            <li class="flex items-center gap-2 hover:text-white cursor-pointer transition-colors">
              <ArrowRight class="h-4 w-4" /> Đồ uống truyền thống
            </li>
            <li class="flex items-center gap-2 hover:text-white cursor-pointer transition-colors">
              <ArrowRight class="h-4 w-4" /> Snack cao cấp
            </li>
            <li class="flex items-center gap-2 hover:text-white cursor-pointer transition-colors">
              <ArrowRight class="h-4 w-4" /> Sản phẩm bán chạy
            </li>
          </ul>
        </div>

        <div class="space-y-3">
          <h4 class="text-lg font-semibold uppercase tracking-wide">Hỗ trợ</h4>
          <ul class="space-y-2 text-sm text-neutral-300">
            <li class="flex items-center gap-2 hover:text-white cursor-pointer transition-colors">
              <ArrowRight class="h-4 w-4" /> Chính sách vận chuyển
            </li>
            <li class="flex items-center gap-2 hover:text-white cursor-pointer transition-colors">
              <ArrowRight class="h-4 w-4" /> Đổi trả hàng
            </li>
            <li class="flex items-center gap-2 hover:text-white cursor-pointer transition-colors">
              <ArrowRight class="h-4 w-4" /> Câu hỏi thường gặp
            </li>
            <li class="flex items-center gap-2 hover:text-white cursor-pointer transition-colors">
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
              <span>contact@nihonmarket.vn</span>
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