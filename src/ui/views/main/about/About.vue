<script setup lang="ts">
const features = [
  {
    icon: "🎌",
    title: "Chính Gốc Nhật Bản",
    jpTitle: "本物の日本",
    desc: "100% sản phẩm được nhập khẩu trực tiếp từ Nhật Bản, đảm bảo chất lượng và độ tươi ngon.",
  },
  {
    icon: "⭐",
    title: "Chất Lượng Cao Cấp",
    jpTitle: "高品質",
    desc: "Tuyển chọn kỹ lưỡng từ các nhà cung cấp uy tín, đạt tiêu chuẩn chất lượng quốc tế.",
  },
  {
    icon: "🚚",
    title: "Giao Hàng Nhanh",
    jpTitle: "迅速な配送",
    desc: "Dịch vụ giao hàng tận nơi nhanh chóng, đảm bảo sản phẩm đến tay khách hàng trong tình trạng tốt nhất.",
  },
  {
    icon: "💝",
    title: "Dịch Vụ Tận Tâm",
    jpTitle: "心のこもったサービス",
    desc: "Đội ngũ nhân viên chuyên nghiệp, luôn sẵn sàng hỗ trợ và tư vấn cho khách hàng.",
  },
];

const values = [
  {
    title: "Tôn Trọng",
    jpTitle: "尊重",
    desc: "Tôn trọng văn hóa và truyền thống ẩm thực Nhật Bản trong mọi sản phẩm.",
  },
  {
    title: "Chất Lượng",
    jpTitle: "品質",
    desc: "Cam kết mang đến những sản phẩm tốt nhất, không thỏa hiệp về chất lượng.",
  },
  {
    title: "Đổi Mới",
    jpTitle: "革新",
    desc: "Không ngừng cập nhật và mang đến những sản phẩm mới, độc đáo từ Nhật Bản.",
  },
];

const stats = [
  { number: "500+", label: "Sản phẩm", jpLabel: "商品" },
  { number: "10K+", label: "Khách hàng", jpLabel: "お客様" },
  { number: "50+", label: "Đối tác", jpLabel: "パートナー" },
  { number: "5+", label: "Năm kinh nghiệm", jpLabel: "年の経験" },
];
</script>

<template>
  <!-- Hero Section -->
  <section class="relative bg-black text-white py-16 md:py-24">
    <div class="absolute inset-0 bg-gradient-to-r from-black via-black/90 to-black/70"></div>
    <div class="relative z-10 max-w-6xl mx-auto px-6 md:px-10 lg:px-14">
      <div class="text-center space-y-4">
        <div class="flex items-center justify-center gap-3 text-sm uppercase tracking-[0.25em] text-red-500 font-semibold">
          <span class="h-[2px] w-12 bg-red-600"></span>
          <span>About Us</span>
          <span class="h-[2px] w-12 bg-red-600"></span>
        </div>
        <h1 class="text-4xl md:text-5xl lg:text-6xl font-bold">
          Về <span class="text-red-500">14ELEVENT</span>
        </h1>
        <p class="text-lg md:text-xl text-neutral-200 max-w-2xl mx-auto">
          私たちについて
        </p>
      </div>
    </div>
  </section>

  <!-- Story Section -->
  <section class="bg-white py-14 px-4 md:px-8 lg:px-12">
    <div class="max-w-6xl mx-auto">
      <div class="grid gap-12 lg:grid-cols-2 items-center">
        <div class="space-y-6">
          <div class="flex items-center gap-3 text-sm uppercase tracking-[0.2em] text-red-600 font-semibold">
            <span class="h-[2px] w-12 bg-red-600"></span>
            <span>Câu Chuyện Của Chúng Tôi</span>
          </div>
          <h2 class="text-3xl md:text-4xl font-bold text-neutral-900">
            Mang Hương Vị Nhật Bản Đến Việt Nam
          </h2>
          <p class="text-neutral-600 leading-relaxed">
            14 Elevent được thành lập với sứ mệnh mang đến cho người Việt Nam những trải nghiệm 
            ẩm thực Nhật Bản chân thực nhất. Chúng tôi tin rằng ẩm thực không chỉ là thức ăn, mà còn 
            là cầu nối văn hóa, là cách để hiểu và yêu mến một đất nước.
          </p>
          <p class="text-neutral-600 leading-relaxed">
            Từ những món ăn truyền thống như sushi, ramen đến những món snack độc đáo, mỗi sản phẩm 
            tại 14 Elevent đều được tuyển chọn kỹ lưỡng, đảm bảo chất lượng và độ tươi ngon. Chúng tôi 
            hợp tác trực tiếp với các nhà cung cấp uy tín tại Nhật Bản để mang đến những sản phẩm chính gốc, 
            không qua trung gian.
          </p>
          <p class="text-neutral-600 leading-relaxed">
            Với đội ngũ nhân viên tận tâm và dịch vụ khách hàng chuyên nghiệp, Nihon Market cam kết 
            mang đến trải nghiệm mua sắm tuyệt vời nhất cho mọi khách hàng.
          </p>
        </div>
        <div class="relative">
          <img
            src="https://images.unsplash.com/photo-1545134969-8debd725b007?auto=format&fit=crop&w=1200&q=80"
            alt="Nihon Market Story"
            class="w-full h-[500px] object-cover shadow-lg"
          />
          <div class="absolute -bottom-6 -right-6 bg-[#b3000f] text-white p-6 max-w-xs">
            <div class="text-4xl font-bold mb-2">5+</div>
            <div class="text-sm uppercase tracking-wide">Năm phục vụ khách hàng</div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Features Section -->
  <section class="bg-[#f7f7f7] py-14 px-4 md:px-8 lg:px-12">
    <div class="max-w-6xl mx-auto">
      <div class="text-center mb-12">
        <div class="flex items-center justify-center gap-3 text-sm uppercase tracking-[0.2em] text-red-600 font-semibold mb-3">
          <span class="h-[2px] w-12 bg-red-600"></span>
          <span>Tại Sao Chọn Chúng Tôi</span>
          <span class="h-[2px] w-12 bg-red-600"></span>
        </div>
        <p class="text-neutral-500 text-sm">なぜ私たちを選ぶのか</p>
      </div>

      <div class="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
        <div
          v-for="feature in features"
          :key="feature.title"
          class="bg-white p-6 border border-neutral-200 shadow-sm hover:shadow-md transition-shadow duration-200 text-center"
        >
          <div class="text-5xl mb-4">{{ feature.icon }}</div>
          <h3 class="text-lg font-semibold text-neutral-900 mb-1">{{ feature.title }}</h3>
          <p class="text-sm text-neutral-500 mb-3">{{ feature.jpTitle }}</p>
          <p class="text-sm text-neutral-600 leading-relaxed">{{ feature.desc }}</p>
        </div>
      </div>
    </div>
  </section>

  <!-- Values Section -->
  <section class="bg-white py-14 px-4 md:px-8 lg:px-12">
    <div class="max-w-6xl mx-auto">
      <div class="text-center mb-12">
        <div class="flex items-center justify-center gap-3 text-sm uppercase tracking-[0.2em] text-red-600 font-semibold mb-3">
          <span class="h-[2px] w-12 bg-red-600"></span>
          <span>Giá Trị Cốt Lõi</span>
          <span class="h-[2px] w-12 bg-red-600"></span>
        </div>
        <p class="text-neutral-500 text-sm">コアバリュー</p>
      </div>

      <div class="grid gap-8 md:grid-cols-3">
        <div
          v-for="value in values"
          :key="value.title"
          class="text-center space-y-4"
        >
          <div class="inline-block">
            <div class="h-20 w-20 mx-auto bg-[#b3000f] rounded-full flex items-center justify-center text-white text-3xl font-bold">
              {{ value.title.charAt(0) }}
            </div>
          </div>
          <div>
            <h3 class="text-xl font-semibold text-neutral-900 mb-1">{{ value.title }}</h3>
            <p class="text-sm text-neutral-500 mb-3">{{ value.jpTitle }}</p>
            <p class="text-sm text-neutral-600 leading-relaxed max-w-xs mx-auto">
              {{ value.desc }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Stats Section -->
  <section class="bg-black text-white py-14 px-4 md:px-8 lg:px-12">
    <div class="max-w-6xl mx-auto">
      <div class="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
        <div
          v-for="stat in stats"
          :key="stat.label"
          class="text-center space-y-2"
        >
          <div class="text-4xl md:text-5xl font-bold text-[#b3000f]">{{ stat.number }}</div>
          <div class="text-lg font-semibold uppercase tracking-wide">{{ stat.label }}</div>
          <div class="text-sm text-neutral-400">{{ stat.jpLabel }}</div>
        </div>
      </div>
    </div>
  </section>

  <!-- Mission Section -->
  <section class="bg-white py-14 px-4 md:px-8 lg:px-12">
    <div class="max-w-6xl mx-auto">
      <div class="grid gap-12 lg:grid-cols-2 items-center">
        <div class="relative order-2 lg:order-1">
          <img
            src="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1200&q=80"
            alt="14ELEVENT Mission"
            class="w-full h-[400px] object-cover shadow-lg"
          />
        </div>
        <div class="space-y-6 order-1 lg:order-2">
          <div class="flex items-center gap-3 text-sm uppercase tracking-[0.2em] text-red-600 font-semibold">
            <span class="h-[2px] w-12 bg-red-600"></span>
            <span>Sứ Mệnh & Tầm Nhìn</span>
          </div>
          <h2 class="text-3xl md:text-4xl font-bold text-neutral-900">
            Sứ Mệnh Của Chúng Tôi
          </h2>
          <p class="text-neutral-600 leading-relaxed">
            14Elevent cam kết trở thành cầu nối văn hóa ẩm thực giữa Việt Nam và Nhật Bản. 
            Chúng tôi không chỉ bán sản phẩm, mà còn mang đến những trải nghiệm văn hóa độc đáo, 
            giúp mọi người hiểu và yêu mến ẩm thực Nhật Bản.
          </p>
          <p class="text-neutral-600 leading-relaxed">
            Tầm nhìn của chúng tôi là trở thành thương hiệu hàng đầu về sản phẩm Nhật Bản tại Việt Nam, 
            được khách hàng tin tưởng và yêu mến nhờ chất lượng sản phẩm và dịch vụ xuất sắc.
          </p>
          <button
            class="px-6 py-3 bg-[#b3000f] hover:bg-[#c00015] text-white font-semibold uppercase text-sm transition-colors duration-200"
          >
            Khám Phá Sản Phẩm
          </button>
        </div>
      </div>
    </div>
  </section>
</template>
