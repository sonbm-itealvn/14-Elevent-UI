<script setup lang="ts">
import { ref } from 'vue';
import { useMessage } from 'naive-ui';
import { PhoneCall, Mail, MapPin, BrandFacebook, BrandInstagram, Send, BrandTiktok } from '@vicons/tabler';
import ContactService from '@/core/services/api/contact.service';

const messageApi = useMessage();

const formData = ref({
  name: '',
  email: '',
  phone: '',
  subject: '',
  message: '',
});

const contactInfo = [
  {
    icon: PhoneCall,
    title: 'Điện Thoại',
    jpTitle: '電話',
    content: '+84 812 325 555',
    subContent: 'Mon - Sun: 8:00 - 22:00',
  },
  {
    icon: Mail,
    title: 'Email',
    jpTitle: 'メール',
    content: 'contact@nihonmarket.vn',
    subContent: 'support@nihonmarket.vn',
  },
  {
    icon: MapPin,
    title: 'Địa Chỉ',
    jpTitle: '住所',
    content: 'Số 13, Bùi Ngọc Dương, Bạch Mai',
    subContent: 'Hà Nội, Việt Nam',
  },
];

// Google Maps embed cho địa chỉ cửa hàng
const mapEmbedUrl =
  'https://www.google.com/maps?q=13%20B%C3%B9i%20Ng%E1%BB%8Dc%20D%C6%B0%C6%A1ng,%20B%E1%BA%A1ch%20Mai,%20H%C3%A0%20N%E1%BB%99i&output=embed';

const handleSubmit = async (e: Event) => {
  e.preventDefault();
  try {
    await ContactService.sendContact({
      name: formData.value.name,
      email: formData.value.email,
      phone: formData.value.phone,
      title: 'Liên hệ',
      subject: formData.value.subject,
      content: formData.value.message,
    });
    messageApi.success('Cảm ơn bạn đã liên hệ! Chúng tôi sẽ phản hồi sớm nhất có thể.');
    formData.value = {
      name: '',
      email: '',
      phone: '',
      subject: '',
      message: '',
    };
  } catch (error) {
    console.error('Error sending contact:', error);
    messageApi.error('Gửi liên hệ thất bại, vui lòng thử lại sau.');
  }
};
</script>

<template>
  <!-- Hero Section -->
  <section class="relative bg-black text-white py-16 md:py-24">
    <div class="absolute inset-0 bg-gradient-to-r from-black via-black/90 to-black/70"></div>
    <div class="relative z-10 max-w-6xl mx-auto px-6 md:px-10 lg:px-14">
      <div class="text-center space-y-4">
        <div class="flex items-center justify-center gap-3 text-sm uppercase tracking-[0.25em] text-red-500 font-semibold">
          <span class="h-[2px] w-12 bg-red-600"></span>
          <span>Contact Us</span>
          <span class="h-[2px] w-12 bg-red-600"></span>
        </div>
        <h1 class="text-4xl md:text-5xl lg:text-6xl font-bold">
          Liên Hệ <span class="text-red-500">Với Chúng Tôi</span>
        </h1>
        <p class="text-lg md:text-xl text-neutral-200 max-w-2xl mx-auto">
          お問い合わせ
        </p>
      </div>
    </div>
  </section>

  <!-- Contact Section -->
  <section class="bg-white py-14 px-4 md:px-8 lg:px-12">
    <div class="max-w-6xl mx-auto">
      <div class="text-center mb-12">
        <div class="flex items-center justify-center gap-3 text-sm uppercase tracking-[0.2em] text-red-600 font-semibold mb-3">
          <span class="h-[2px] w-12 bg-red-600"></span>
          <span>Chúng Tôi Luôn Sẵn Sàng Lắng Nghe</span>
          <span class="h-[2px] w-12 bg-red-600"></span>
        </div>
        <p class="text-neutral-500 text-sm">お気軽にお問い合わせください</p>
      </div>

      <div class="grid gap-12 lg:grid-cols-2">
        <!-- Contact Form -->
        <div class="bg-[#f7f7f7] p-8 border border-neutral-200">
          <h2 class="text-2xl font-bold text-neutral-900 mb-6">Gửi Tin Nhắn</h2>
          <form @submit="handleSubmit" class="space-y-5">
            <div>
              <label for="name" class="block text-sm font-semibold text-neutral-700 mb-2 uppercase tracking-wide">
                Họ và Tên *
              </label>
              <input
                id="name"
                v-model="formData.name"
                type="text"
                required
                class="w-full px-4 py-3 border border-neutral-300 focus:border-[#b3000f] focus:outline-none focus:ring-2 focus:ring-red-500/20 bg-white text-neutral-900"
                placeholder="Nhập họ và tên của bạn"
              />
            </div>

            <div>
              <label for="email" class="block text-sm font-semibold text-neutral-700 mb-2 uppercase tracking-wide">
                Email *
              </label>
              <input
                id="email"
                v-model="formData.email"
                type="email"
                required
                class="w-full px-4 py-3 border border-neutral-300 focus:border-[#b3000f] focus:outline-none focus:ring-2 focus:ring-red-500/20 bg-white text-neutral-900"
                placeholder="your.email@example.com"
              />
            </div>

            <div>
              <label for="phone" class="block text-sm font-semibold text-neutral-700 mb-2 uppercase tracking-wide">
                Số Điện Thoại
              </label>
              <input
                id="phone"
                v-model="formData.phone"
                type="tel"
                class="w-full px-4 py-3 border border-neutral-300 focus:border-[#b3000f] focus:outline-none focus:ring-2 focus:ring-red-500/20 bg-white text-neutral-900"
                placeholder="+84 123 456 789"
              />
            </div>

            <div>
              <label for="subject" class="block text-sm font-semibold text-neutral-700 mb-2 uppercase tracking-wide">
                Chủ Đề *
              </label>
              <input
                id="subject"
                v-model="formData.subject"
                type="text"
                required
                class="w-full px-4 py-3 border border-neutral-300 focus:border-[#b3000f] focus:outline-none focus:ring-2 focus:ring-red-500/20 bg-white text-neutral-900"
                placeholder="Tiêu đề tin nhắn"
              />
            </div>

            <div>
              <label for="message" class="block text-sm font-semibold text-neutral-700 mb-2 uppercase tracking-wide">
                Tin Nhắn *
              </label>
              <textarea
                id="message"
                v-model="formData.message"
                required
                rows="5"
                class="w-full px-4 py-3 border border-neutral-300 focus:border-[#b3000f] focus:outline-none focus:ring-2 focus:ring-red-500/20 bg-white text-neutral-900 resize-none"
                placeholder="Nhập nội dung tin nhắn của bạn..."
              ></textarea>
            </div>

            <button
              type="submit"
              class="w-full px-6 py-3 bg-[#b3000f] hover:bg-[#c00015] text-white font-semibold uppercase text-sm transition-colors duration-200 flex items-center justify-center gap-2"
            >
              <Send class="h-5 w-5" />
              Gửi Tin Nhắn
            </button>
          </form>
        </div>

        <!-- Contact Information -->
        <div class="space-y-8">
          <div>
            <h2 class="text-2xl font-bold text-neutral-900 mb-6">Thông Tin Liên Hệ</h2>
            <p class="text-neutral-600 leading-relaxed mb-6">
              Chúng tôi luôn sẵn sàng hỗ trợ và giải đáp mọi thắc mắc của bạn. 
              Hãy liên hệ với chúng tôi qua các kênh sau:
            </p>
          </div>

          <div class="space-y-6">
            <div
              v-for="info in contactInfo"
              :key="info.title"
              class="flex gap-4 p-5 border border-neutral-200 hover:shadow-md transition-shadow duration-200 bg-white"
            >
              <div class="flex-shrink-0">
                <div class="h-12 w-12 bg-[#b3000f] flex items-center justify-center text-white">
                  <component :is="info.icon" class="h-6 w-6" />
                </div>
              </div>
              <div class="flex-1">
                <h3 class="text-lg font-semibold text-neutral-900 mb-1">{{ info.title }}</h3>
                <p class="text-xs text-neutral-500 mb-2">{{ info.jpTitle }}</p>
                <p class="text-neutral-700 font-medium">{{ info.content }}</p>
                <p v-if="info.subContent" class="text-sm text-neutral-500 mt-1">
                  {{ info.subContent }}
                </p>
              </div>
            </div>
          </div>

          <!-- Social Media -->
          <div class="pt-6 border-t border-neutral-200">
            <h3 class="text-lg font-semibold text-neutral-900 mb-4 uppercase tracking-wide">
              Theo Dõi Chúng Tôi
            </h3>
            <div class="flex items-center gap-3">
              <a
                href="https://www.facebook.com/share/187u9XAvb2/?mibextid=wwXIfr"
                class="h-12 w-12 border border-neutral-300 hover:border-[#b3000f] hover:bg-[#b3000f] hover:text-white flex items-center justify-center transition-all duration-200"
              >
                <BrandFacebook class="h-6 w-6" />
              </a>
              <a
                href="https://www.instagram.com/14elevent_jp/?igsh=NjZhZGFob2JzZWdh&utm_source=qr"
                class="h-12 w-12 border border-neutral-300 hover:border-[#b3000f] hover:bg-[#b3000f] hover:text-white flex items-center justify-center transition-all duration-200"
              >
                <BrandInstagram class="h-6 w-6" />
              </a>
              <a
                href="https://www.tiktok.com/@14elevent.jp?_r=1&_t=ZS-92rnoFw1euj"
                class="h-12 w-12 border border-neutral-300 hover:border-[#b3000f] hover:bg-[#b3000f] hover:text-white flex items-center justify-center transition-all duration-200"
              >
                <BrandTiktok class="h-6 w-6" />
              </a>
            </div>
          </div>

          <!-- Map Section -->
          <div class="pt-6 border-t border-neutral-200">
            <h3 class="text-lg font-semibold text-neutral-900 mb-4 uppercase tracking-wide">
              Vị Trí Cửa Hàng
            </h3>
            <div class="relative h-72 bg-neutral-200 border border-neutral-300 overflow-hidden rounded-lg">
              <iframe
                :src="mapEmbedUrl"
                width="100%"
                height="100%"
                style="border:0;"
                allowfullscreen
                loading="lazy"
                referrerpolicy="no-referrer-when-downgrade"
                title="Bản đồ cửa hàng"
              ></iframe>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- FAQ Section -->
  <section class="bg-[#f7f7f7] py-14 px-4 md:px-8 lg:px-12">
    <div class="max-w-6xl mx-auto">
      <div class="text-center mb-12">
        <div class="flex items-center justify-center gap-3 text-sm uppercase tracking-[0.2em] text-red-600 font-semibold mb-3">
          <span class="h-[2px] w-12 bg-red-600"></span>
          <span>Câu Hỏi Thường Gặp</span>
          <span class="h-[2px] w-12 bg-red-600"></span>
        </div>
        <p class="text-neutral-500 text-sm">よくある質問</p>
      </div>

      <div class="grid gap-6 md:grid-cols-2">
        <div class="bg-white p-6 border border-neutral-200">
          <h3 class="text-lg font-semibold text-neutral-900 mb-2">
            Làm thế nào để đặt hàng?
          </h3>
          <p class="text-sm text-neutral-600 leading-relaxed">
            Bạn có thể đặt hàng trực tiếp trên website hoặc liên hệ với chúng tôi qua hotline. 
            Chúng tôi sẽ xử lý đơn hàng trong vòng 24 giờ.
          </p>
        </div>

        <div class="bg-white p-6 border border-neutral-200">
          <h3 class="text-lg font-semibold text-neutral-900 mb-2">
            Phương thức thanh toán nào được chấp nhận?
          </h3>
          <p class="text-sm text-neutral-600 leading-relaxed">
            Chúng tôi chấp nhận thanh toán qua thẻ tín dụng, chuyển khoản ngân hàng, 
            và thanh toán khi nhận hàng (COD).
          </p>
        </div>

        <div class="bg-white p-6 border border-neutral-200">
          <h3 class="text-lg font-semibold text-neutral-900 mb-2">
            Thời gian giao hàng là bao lâu?
          </h3>
          <p class="text-sm text-neutral-600 leading-relaxed">
            Thời gian giao hàng từ 2-5 ngày làm việc tùy thuộc vào địa điểm. 
            Đối với khu vực nội thành, giao hàng trong ngày.
          </p>
        </div>

        <div class="bg-white p-6 border border-neutral-200">
          <h3 class="text-lg font-semibold text-neutral-900 mb-2">
            Có chính sách đổi trả không?
          </h3>
          <p class="text-sm text-neutral-600 leading-relaxed">
            Chúng tôi có chính sách đổi trả trong vòng 7 ngày kể từ ngày nhận hàng 
            nếu sản phẩm còn nguyên vẹn và chưa sử dụng.
          </p>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
input::placeholder,
textarea::placeholder {
  color: #9ca3af;
}
</style>

