<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ArrowLeft, Calendar, User } from '@vicons/tabler';

const route = useRoute();
const router = useRouter();

// Fake data cho các bài viết
const articlesData: Record<number, any> = {
  1: {
    id: 1,
    title: "Top 5+ giỏ quà Tết Nhật sang trọng giá tốt năm 2026",
    date: "03/12/2025",
    author: "14 Elevent",
    desc: "Khám phá 5 lựa chọn giỏ quà Tết Nhật chính hãng, sang trọng năm 2026.",
    image: "https://images.unsplash.com/photo-1511690656952-34342bb7c2f2?auto=format&fit=crop&w=1200&q=80",
    content: `
      <p class="mb-4">Tết Nguyên Đán là dịp quan trọng nhất trong năm của người Việt Nam. Việc chọn quà Tết ý nghĩa, sang trọng để biếu tặng người thân, bạn bè và đối tác là điều vô cùng quan trọng. Năm 2026, xu hướng chọn quà Tết Nhật Bản đang trở nên phổ biến hơn bao giờ hết.</p>
      
      <h2 class="text-2xl font-bold mb-4 mt-8">1. Giỏ quà Tết Nhật cao cấp - Bộ sưu tập Wagashi</h2>
      <p class="mb-4">Wagashi là những món bánh kẹo truyền thống Nhật Bản được làm thủ công với nguyên liệu tự nhiên. Bộ sưu tập Wagashi thường bao gồm:</p>
      <ul class="list-disc list-inside mb-4 space-y-2">
        <li>Mochi - bánh gạo dẻo với nhiều hương vị khác nhau</li>
        <li>Yokan - thạch đậu đỏ ngọt ngào</li>
        <li>Manju - bánh nhân đậu đỏ mềm mịn</li>
        <li>Senbei - bánh gạo giòn tan</li>
      </ul>
      <p class="mb-4">Giá tham khảo: 800.000đ - 1.500.000đ</p>
      
      <h2 class="text-2xl font-bold mb-4 mt-8">2. Giỏ quà Tết Nhật - Bộ trà xanh Matcha Premium</h2>
      <p class="mb-4">Trà xanh Matcha Nhật Bản nổi tiếng với chất lượng cao và hương vị đặc trưng. Bộ quà tặng thường bao gồm:</p>
      <ul class="list-disc list-inside mb-4 space-y-2">
        <li>Trà Matcha cao cấp từ Uji, Kyoto</li>
        <li>Bộ dụng cụ pha trà truyền thống</li>
        <li>Bánh kẹo đi kèm</li>
        <li>Hộp đựng sang trọng</li>
      </ul>
      <p class="mb-4">Giá tham khảo: 1.200.000đ - 2.500.000đ</p>
      
      <h2 class="text-2xl font-bold mb-4 mt-8">3. Giỏ quà Tết Nhật - Bộ rượu Sake và đồ nhắm</h2>
      <p class="mb-4">Rượu Sake Nhật Bản là món quà tặng cao cấp, phù hợp cho các dịp đặc biệt. Bộ quà tặng bao gồm:</p>
      <ul class="list-disc list-inside mb-4 space-y-2">
        <li>Rượu Sake cao cấp (720ml)</li>
        <li>Bộ ly uống Sake truyền thống</li>
        <li>Đồ nhắm Nhật Bản (cá khô, hải sản)</li>
        <li>Hộp quà sang trọng</li>
      </ul>
      <p class="mb-4">Giá tham khảo: 1.500.000đ - 3.000.000đ</p>
      
      <h2 class="text-2xl font-bold mb-4 mt-8">4. Giỏ quà Tết Nhật - Bộ snack cao cấp</h2>
      <p class="mb-4">Snack Nhật Bản nổi tiếng với chất lượng và hương vị độc đáo. Bộ quà tặng thường có:</p>
      <ul class="list-disc list-inside mb-4 space-y-2">
        <li>Pocky - bánh que socola nhiều vị</li>
        <li>Kit Kat Nhật Bản - các vị độc đáo</li>
        <li>Snack khoai tây các loại</li>
        <li>Kẹo dẻo Nhật Bản</li>
      </ul>
      <p class="mb-4">Giá tham khảo: 500.000đ - 1.000.000đ</p>
      
      <h2 class="text-2xl font-bold mb-4 mt-8">5. Giỏ quà Tết Nhật - Bộ thực phẩm khô cao cấp</h2>
      <p class="mb-4">Thực phẩm khô Nhật Bản là lựa chọn hoàn hảo cho quà Tết. Bộ quà tặng bao gồm:</p>
      <ul class="list-disc list-inside mb-4 space-y-2">
        <li>Rong biển khô (Nori) cao cấp</li>
        <li>Cá khô các loại</li>
        <li>Mực khô Nhật Bản</li>
        <li>Gia vị và nước sốt Nhật</li>
      </ul>
      <p class="mb-4">Giá tham khảo: 600.000đ - 1.200.000đ</p>
      
      <h2 class="text-2xl font-bold mb-4 mt-8">Lời kết</h2>
      <p class="mb-4">Chọn giỏ quà Tết Nhật Bản không chỉ thể hiện sự tinh tế mà còn mang đến trải nghiệm ẩm thực độc đáo. Với chất lượng cao và thiết kế sang trọng, những món quà này chắc chắn sẽ làm hài lòng người nhận.</p>
      <p class="mb-4">Hãy đến với 14 Elevent để khám phá thêm nhiều bộ quà Tết Nhật Bản hấp dẫn khác!</p>
    `
  },
  2: {
    id: 2,
    title: "Top 10+ quà Tết 2026 sang trọng cho doanh nghiệp",
    date: "28/11/2025",
    author: "14 Elevent",
    desc: "Quà tặng chuẩn Nhật ý nghĩa, ghi điểm và gắn kết mối quan hệ.",
    image: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1200&q=80",
    content: `
      <p class="mb-4">Quà Tết cho doanh nghiệp là một phần quan trọng trong văn hóa kinh doanh Việt Nam. Việc chọn quà tặng phù hợp không chỉ thể hiện sự trân trọng mà còn góp phần củng cố mối quan hệ đối tác lâu dài.</p>
      
      <h2 class="text-2xl font-bold mb-4 mt-8">1. Bộ quà Tết Nhật Bản cao cấp cho đối tác</h2>
      <p class="mb-4">Bộ quà tặng này được thiết kế đặc biệt cho các đối tác quan trọng, bao gồm:</p>
      <ul class="list-disc list-inside mb-4 space-y-2">
        <li>Rượu Sake cao cấp từ các nhà sản xuất nổi tiếng</li>
        <li>Bộ trà xanh Matcha Premium</li>
        <li>Wagashi - bánh kẹo truyền thống Nhật</li>
        <li>Hộp quà thiết kế sang trọng, có thể tùy chỉnh logo công ty</li>
      </ul>
      <p class="mb-4">Giá tham khảo: 2.000.000đ - 5.000.000đ</p>
      
      <h2 class="text-2xl font-bold mb-4 mt-8">2. Giỏ quà Tết cho nhân viên</h2>
      <p class="mb-4">Thể hiện sự quan tâm đến nhân viên với bộ quà tặng ý nghĩa:</p>
      <ul class="list-disc list-inside mb-4 space-y-2">
        <li>Snack Nhật Bản đa dạng</li>
        <li>Bánh kẹo cao cấp</li>
        <li>Thực phẩm khô tiện lợi</li>
        <li>Hộp quà đẹp mắt, phù hợp số lượng lớn</li>
      </ul>
      <p class="mb-4">Giá tham khảo: 300.000đ - 800.000đ</p>
      
      <h2 class="text-2xl font-bold mb-4 mt-8">3. Bộ quà Tết cho khách hàng VIP</h2>
      <p class="mb-4">Dành cho những khách hàng đặc biệt quan trọng:</p>
      <ul class="list-disc list-inside mb-4 space-y-2">
        <li>Rượu Sake cực kỳ cao cấp</li>
        <li>Trà xanh Matcha hạng nhất</li>
        <li>Wagashi thủ công từ các nghệ nhân nổi tiếng</li>
        <li>Hộp quà gỗ cao cấp, có thể khắc tên</li>
      </ul>
      <p class="mb-4">Giá tham khảo: 5.000.000đ - 10.000.000đ</p>
      
      <h2 class="text-2xl font-bold mb-4 mt-8">4. Combo quà Tết số lượng lớn</h2>
      <p class="mb-4">Phù hợp cho các doanh nghiệp cần số lượng lớn:</p>
      <ul class="list-disc list-inside mb-4 space-y-2">
        <li>Giảm giá đặc biệt khi đặt số lượng lớn</li>
        <li>Thiết kế hộp quà có thể in logo công ty</li>
        <li>Đa dạng sản phẩm để lựa chọn</li>
        <li>Giao hàng tận nơi, đúng thời hạn</li>
      </ul>
      <p class="mb-4">Liên hệ để được báo giá tốt nhất</p>
      
      <h2 class="text-2xl font-bold mb-4 mt-8">Lời khuyên khi chọn quà Tết cho doanh nghiệp</h2>
      <ul class="list-disc list-inside mb-4 space-y-2">
        <li>Chọn quà phù hợp với ngân sách và số lượng</li>
        <li>Đảm bảo chất lượng và nguồn gốc rõ ràng</li>
        <li>Thiết kế hộp quà chuyên nghiệp, có thể in logo</li>
        <li>Đặt hàng sớm để đảm bảo giao hàng đúng thời hạn</li>
        <li>Chọn quà có ý nghĩa, phù hợp với văn hóa</li>
      </ul>
      
      <h2 class="text-2xl font-bold mb-4 mt-8">Lời kết</h2>
      <p class="mb-4">Quà Tết Nhật Bản là lựa chọn hoàn hảo cho doanh nghiệp muốn thể hiện sự tinh tế và chuyên nghiệp. Với chất lượng cao và thiết kế sang trọng, những món quà này sẽ để lại ấn tượng sâu sắc với đối tác và khách hàng.</p>
    `
  },
  3: {
    id: 3,
    title: "Review chi tiết các mẫu giỏ quà Tết Nhật mới nhất 2026",
    date: "27/11/2025",
    author: "14 Elevent",
    desc: "Giỏ quà Tết Nhật bản chất lượng, thiết kế ấn tượng, phù hợp biếu tặng.",
    image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?auto=format&fit=crop&w=1200&q=80",
    content: `
      <p class="mb-4">Năm 2026, thị trường quà Tết Nhật Bản tiếp tục phát triển với nhiều mẫu giỏ quà mới, đẹp mắt và ý nghĩa. Hãy cùng chúng tôi điểm qua những mẫu giỏ quà Tết Nhật nổi bật nhất năm nay.</p>
      
      <h2 class="text-2xl font-bold mb-4 mt-8">1. Giỏ quà Tết Nhật - Bộ Wagashi Premium 2026</h2>
      <p class="mb-4">Đây là mẫu giỏ quà mới nhất với thiết kế hiện đại nhưng vẫn giữ được nét truyền thống Nhật Bản.</p>
      <p class="mb-4"><strong>Điểm nổi bật:</strong></p>
      <ul class="list-disc list-inside mb-4 space-y-2">
        <li>Hộp quà làm từ giấy washi truyền thống</li>
        <li>Bánh kẹo Wagashi được làm thủ công</li>
        <li>Thiết kế họa tiết hoa anh đào tinh xảo</li>
        <li>Giá: 1.200.000đ - 2.000.000đ</li>
      </ul>
      
      <h2 class="text-2xl font-bold mb-4 mt-8">2. Giỏ quà Tết Nhật - Bộ Matcha Experience</h2>
      <p class="mb-4">Trải nghiệm trà đạo Nhật Bản đích thực với bộ quà tặng này.</p>
      <p class="mb-4"><strong>Điểm nổi bật:</strong></p>
      <ul class="list-disc list-inside mb-4 space-y-2">
        <li>Trà Matcha cao cấp từ Uji, Kyoto</li>
        <li>Bộ dụng cụ pha trà đầy đủ</li>
        <li>Bánh kẹo đi kèm hài hòa</li>
        <li>Hướng dẫn pha trà chi tiết</li>
        <li>Giá: 1.800.000đ - 3.000.000đ</li>
      </ul>
      
      <h2 class="text-2xl font-bold mb-4 mt-8">3. Giỏ quà Tết Nhật - Bộ Sake Collection</h2>
      <p class="mb-4">Bộ sưu tập rượu Sake đa dạng, phù hợp cho những người yêu thích ẩm thực Nhật.</p>
      <p class="mb-4"><strong>Điểm nổi bật:</strong></p>
      <ul class="list-disc list-inside mb-4 space-y-2">
        <li>3 loại Sake khác nhau (Junmai, Ginjo, Daiginjo)</li>
        <li>Bộ ly uống Sake truyền thống</li>
        <li>Đồ nhắm Nhật Bản cao cấp</li>
        <li>Hộp quà gỗ sang trọng</li>
        <li>Giá: 2.500.000đ - 4.500.000đ</li>
      </ul>
      
      <h2 class="text-2xl font-bold mb-4 mt-8">4. Giỏ quà Tết Nhật - Bộ Snack Deluxe</h2>
      <p class="mb-4">Cho những người yêu thích snack Nhật Bản với đa dạng hương vị.</p>
      <p class="mb-4"><strong>Điểm nổi bật:</strong></p>
      <ul class="list-disc list-inside mb-4 space-y-2">
        <li>Hơn 20 loại snack khác nhau</li>
        <li>Bao gồm các thương hiệu nổi tiếng</li>
        <li>Hộp quà lớn, đẹp mắt</li>
        <li>Phù hợp cho gia đình</li>
        <li>Giá: 800.000đ - 1.500.000đ</li>
      </ul>
      
      <h2 class="text-2xl font-bold mb-4 mt-8">5. Giỏ quà Tết Nhật - Bộ Thực phẩm khô Premium</h2>
      <p class="mb-4">Bộ quà tặng thực phẩm khô cao cấp, tiện lợi và bổ dưỡng.</p>
      <p class="mb-4"><strong>Điểm nổi bật:</strong></p>
      <ul class="list-disc list-inside mb-4 space-y-2">
        <li>Rong biển khô cao cấp</li>
        <li>Cá khô các loại</li>
        <li>Mực khô Nhật Bản</li>
        <li>Gia vị và nước sốt đặc trưng</li>
        <li>Giá: 900.000đ - 1.800.000đ</li>
      </ul>
      
      <h2 class="text-2xl font-bold mb-4 mt-8">Đánh giá tổng quan</h2>
      <p class="mb-4">Tất cả các mẫu giỏ quà Tết Nhật năm 2026 đều được thiết kế tỉ mỉ, chú trọng đến chất lượng sản phẩm và trải nghiệm người dùng. Mỗi bộ quà đều mang ý nghĩa riêng, phù hợp với từng đối tượng khác nhau.</p>
      
      <h2 class="text-2xl font-bold mb-4 mt-8">Lời kết</h2>
      <p class="mb-4">Với sự đa dạng và chất lượng cao, các mẫu giỏ quà Tết Nhật 2026 chắc chắn sẽ làm hài lòng mọi khách hàng. Hãy đến với 14 Elevent để được tư vấn và chọn lựa bộ quà phù hợp nhất!</p>
    `
  },
  4: {
    id: 4,
    title: "Vui mua sắm – Rinh lịch để bàn 2026 phong cách Nhật Bản",
    date: "05/12/2025",
    author: "14 Elevent",
    desc: "Hóa đơn từ 600.000đ tặng lịch để bàn 2026 phong cách Nhật.",
    image: "https://images.unsplash.com/photo-1462396881884-de2c07cb95ed?auto=format&fit=crop&w=800&q=80",
    content: `
      <p class="mb-4">Chương trình khuyến mãi đặc biệt: Mua sắm tại 14 Elevent và nhận ngay lịch để bàn 2026 phong cách Nhật Bản xinh xắn!</p>
      
      <h2 class="text-2xl font-bold mb-4 mt-8">Thời gian áp dụng</h2>
      <p class="mb-4">Từ ngày 01/12/2025 đến hết ngày 31/12/2025</p>
      
      <h2 class="text-2xl font-bold mb-4 mt-8">Điều kiện nhận quà</h2>
      <ul class="list-disc list-inside mb-4 space-y-2">
        <li>Đơn hàng từ 600.000đ trở lên</li>
        <li>Áp dụng cho tất cả sản phẩm</li>
        <li>Mỗi đơn hàng chỉ được nhận 1 lịch để bàn</li>
        <li>Số lượng quà có hạn, ưu tiên khách hàng đặt hàng sớm</li>
      </ul>
      
      <h2 class="text-2xl font-bold mb-4 mt-8">Về lịch để bàn 2026</h2>
      <p class="mb-4">Lịch để bàn 2026 phong cách Nhật Bản được thiết kế đặc biệt với:</p>
      <ul class="list-disc list-inside mb-4 space-y-2">
        <li>Thiết kế tinh tế, mang đậm phong cách Nhật Bản</li>
        <li>Họa tiết hoa anh đào, núi Phú Sĩ và các biểu tượng văn hóa Nhật</li>
        <li>Chất lượng giấy cao cấp, bền đẹp</li>
        <li>Kích thước vừa phải, phù hợp để bàn làm việc</li>
        <li>In đầy đủ ngày lễ Việt Nam và Nhật Bản</li>
      </ul>
      
      <h2 class="text-2xl font-bold mb-4 mt-8">Cách nhận quà</h2>
      <ol class="list-decimal list-inside mb-4 space-y-2">
        <li>Mua sắm sản phẩm tại 14 Elevent</li>
        <li>Đơn hàng đạt giá trị từ 600.000đ</li>
        <li>Lịch để bàn sẽ được gửi kèm theo đơn hàng</li>
        <li>Không cần làm thêm thủ tục gì</li>
      </ol>
      
      <h2 class="text-2xl font-bold mb-4 mt-8">Lưu ý</h2>
      <ul class="list-disc list-inside mb-4 space-y-2">
        <li>Chương trình không áp dụng kèm với các khuyến mãi khác</li>
        <li>Số lượng quà có hạn, khi hết quà chương trình sẽ kết thúc sớm</li>
        <li>Áp dụng cho cả mua hàng online và tại cửa hàng</li>
        <li>Quà tặng không có giá trị quy đổi thành tiền mặt</li>
      </ul>
      
      <h2 class="text-2xl font-bold mb-4 mt-8">Lời kết</h2>
      <p class="mb-4">Đừng bỏ lỡ cơ hội sở hữu lịch để bàn 2026 phong cách Nhật Bản độc đáo này! Hãy mua sắm ngay tại 14 Elevent để nhận quà tặng hấp dẫn.</p>
    `
  },
  5: {
    id: 5,
    title: "Đua đơn Black Friday – Nhận quà cực đã cùng 14 Elevent",
    date: "23/11/2025",
    author: "14 Elevent",
    desc: "Sale bùng cháy, quà tặng hấp dẫn cho mọi đơn hàng.",
    image: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=800&q=80",
    content: `
      <p class="mb-4">Black Friday 2025 - Cơ hội vàng để mua sắm sản phẩm Nhật Bản với giá cực kỳ ưu đãi cùng nhiều quà tặng hấp dẫn!</p>
      
      <h2 class="text-2xl font-bold mb-4 mt-8">Thời gian khuyến mãi</h2>
      <p class="mb-4">Từ 00:00 ngày 24/11/2025 đến 23:59 ngày 30/11/2025</p>
      
      <h2 class="text-2xl font-bold mb-4 mt-8">Ưu đãi đặc biệt</h2>
      <ul class="list-disc list-inside mb-4 space-y-2">
        <li><strong>Giảm giá lên đến 50%</strong> cho tất cả sản phẩm</li>
        <li><strong>Miễn phí vận chuyển</strong> cho đơn hàng từ 500.000đ</li>
        <li><strong>Tặng quà</strong> cho mọi đơn hàng</li>
        <li><strong>Flash sale</strong> mỗi giờ với giá sốc</li>
      </ul>
      
      <h2 class="text-2xl font-bold mb-4 mt-8">Quà tặng theo giá trị đơn hàng</h2>
      <ul class="list-disc list-inside mb-4 space-y-2">
        <li><strong>Đơn từ 500.000đ:</strong> Tặng bộ snack Nhật Bản</li>
        <li><strong>Đơn từ 1.000.000đ:</strong> Tặng bộ trà xanh Matcha</li>
        <li><strong>Đơn từ 2.000.000đ:</strong> Tặng bộ quà Tết Nhật cao cấp</li>
        <li><strong>Đơn từ 5.000.000đ:</strong> Tặng rượu Sake cao cấp + quà đặc biệt</li>
      </ul>
      
      <h2 class="text-2xl font-bold mb-4 mt-8">Flash Sale mỗi giờ</h2>
      <p class="mb-4">Mỗi giờ sẽ có một sản phẩm được bán với giá cực kỳ ưu đãi:</p>
      <ul class="list-disc list-inside mb-4 space-y-2">
        <li>10:00 - Snack Nhật Bản giảm 70%</li>
        <li>14:00 - Trà xanh Matcha giảm 60%</li>
        <li>18:00 - Rượu Sake giảm 50%</li>
        <li>20:00 - Bộ quà Tết giảm 40%</li>
      </ul>
      
      <h2 class="text-2xl font-bold mb-4 mt-8">Cách tham gia</h2>
      <ol class="list-decimal list-inside mb-4 space-y-2">
        <li>Truy cập website 14 Elevent</li>
        <li>Chọn sản phẩm yêu thích</li>
        <li>Thêm vào giỏ hàng và thanh toán</li>
        <li>Nhận quà tặng kèm theo đơn hàng</li>
      </ol>
      
      <h2 class="text-2xl font-bold mb-4 mt-8">Lưu ý</h2>
      <ul class="list-disc list-inside mb-4 space-y-2">
        <li>Ưu đãi chỉ áp dụng trong thời gian khuyến mãi</li>
        <li>Số lượng sản phẩm flash sale có hạn</li>
        <li>Quà tặng không có giá trị quy đổi thành tiền mặt</li>
        <li>Áp dụng cho cả mua hàng online và tại cửa hàng</li>
      </ul>
      
      <h2 class="text-2xl font-bold mb-4 mt-8">Lời kết</h2>
      <p class="mb-4">Đừng bỏ lỡ cơ hội mua sắm Black Friday với giá cực kỳ ưu đãi và nhận nhiều quà tặng hấp dẫn tại 14 Elevent. Hãy nhanh tay đặt hàng ngay!</p>
    `
  },
  6: {
    id: 6,
    title: "Mừng 20 tháng 10 – Săn quà Nhật rạng rỡ",
    date: "20/10/2025",
    author: "14 Elevent",
    desc: "Đơn 600k/1 triệu/2 triệu nhận quà xinh dịp 20/10.",
    image: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=800&q=80",
    content: `
      <p class="mb-4">Chào mừng ngày Phụ nữ Việt Nam 20/10! 14 Elevent dành tặng những ưu đãi đặc biệt và quà tặng xinh xắn cho phái đẹp.</p>
      
      <h2 class="text-2xl font-bold mb-4 mt-8">Thời gian khuyến mãi</h2>
      <p class="mb-4">Từ ngày 15/10/2025 đến hết ngày 25/10/2025</p>
      
      <h2 class="text-2xl font-bold mb-4 mt-8">Quà tặng theo giá trị đơn hàng</h2>
      <ul class="list-disc list-inside mb-4 space-y-2">
        <li><strong>Đơn từ 600.000đ:</strong> Tặng bộ mỹ phẩm Nhật Bản mini</li>
        <li><strong>Đơn từ 1.000.000đ:</strong> Tặng bộ trà xanh Matcha + bánh kẹo Wagashi</li>
        <li><strong>Đơn từ 2.000.000đ:</strong> Tặng bộ quà Tết Nhật cao cấp + voucher giảm giá 10%</li>
      </ul>
      
      <h2 class="text-2xl font-bold mb-4 mt-8">Sản phẩm nổi bật</h2>
      <ul class="list-disc list-inside mb-4 space-y-2">
        <li>Mỹ phẩm Nhật Bản cao cấp</li>
        <li>Trà xanh Matcha và các loại trà thảo mộc</li>
        <li>Bánh kẹo Wagashi xinh xắn</li>
        <li>Snack Nhật Bản đa dạng</li>
        <li>Thực phẩm chức năng Nhật Bản</li>
      </ul>
      
      <h2 class="text-2xl font-bold mb-4 mt-8">Ưu đãi đặc biệt</h2>
      <ul class="list-disc list-inside mb-4 space-y-2">
        <li>Giảm giá 20% cho tất cả sản phẩm mỹ phẩm</li>
        <li>Giảm giá 15% cho các sản phẩm trà và bánh kẹo</li>
        <li>Miễn phí vận chuyển cho đơn hàng từ 500.000đ</li>
        <li>Tặng kèm thiệp chúc mừng xinh xắn</li>
      </ul>
      
      <h2 class="text-2xl font-bold mb-4 mt-8">Cách nhận quà</h2>
      <ol class="list-decimal list-inside mb-4 space-y-2">
        <li>Mua sắm sản phẩm tại 14 Elevent</li>
        <li>Đơn hàng đạt giá trị theo các mức trên</li>
        <li>Quà tặng sẽ được gửi kèm theo đơn hàng</li>
        <li>Không cần làm thêm thủ tục gì</li>
      </ol>
      
      <h2 class="text-2xl font-bold mb-4 mt-8">Lời kết</h2>
      <p class="mb-4">Nhân dịp ngày Phụ nữ Việt Nam, 14 Elevent xin gửi lời chúc tốt đẹp nhất đến tất cả phái đẹp. Hãy dành tặng những món quà ý nghĩa cho người phụ nữ bạn yêu thương!</p>
    `
  }
};

const articleId = computed(() => {
  const id = route.params.id;
  if (!id) return null;
  const numId = typeof id === 'string' ? parseInt(id, 10) : Number(id);
  return isNaN(numId) ? null : numId;
});

const article = computed(() => {
  if (!articleId.value) return null;
  return articlesData[articleId.value] || null;
});

onMounted(() => {
  if (!article.value) {
    router.push({ name: 'Home' });
  } else {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
});
</script>

<template>
  <div v-if="article" class="min-h-screen bg-white">
    <!-- Hero Section -->
    <section class="relative bg-black text-white py-16 md:py-24">
      <div class="absolute inset-0 bg-gradient-to-r from-black via-black/90 to-black/70"></div>
      <div class="relative z-10 max-w-4xl mx-auto px-6 md:px-10 lg:px-14">
        <button
          @click="router.push({ name: 'Home' })"
          class="mb-6 flex items-center gap-2 text-neutral-300 hover:text-white transition-colors"
        >
          <ArrowLeft class="h-5 w-5" />
          <span>Quay lại trang chủ</span>
        </button>
        <h1 class="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">{{ article.title }}</h1>
        <div class="flex items-center gap-4 text-neutral-300 text-sm">
          <div class="flex items-center gap-2">
            <Calendar class="h-4 w-4" />
            <span>{{ article.date }}</span>
          </div>
          <div class="flex items-center gap-2">
            <User class="h-4 w-4" />
            <span>{{ article.author }}</span>
          </div>
        </div>
      </div>
    </section>

    <!-- Article Content -->
    <article class="max-w-4xl mx-auto px-6 md:px-10 lg:px-14 py-12">
      <div class="mb-8">
        <img
          :src="article.image"
          :alt="article.title"
          class="w-full h-96 object-cover rounded-lg shadow-lg"
        />
      </div>
      <div
        class="prose prose-lg max-w-none"
        v-html="article.content"
      ></div>
    </article>

    <!-- Related Articles Section -->
    <section class="bg-[#f7f7f7] py-12 px-6 md:px-10 lg:px-14">
      <div class="max-w-6xl mx-auto">
        <h2 class="text-2xl font-bold mb-6">Bài viết liên quan</h2>
        <div class="grid gap-6 md:grid-cols-3">
          <div
            v-for="related in Object.values(articlesData).filter(a => a.id !== article.id).slice(0, 3)"
            :key="related.id"
            @click="router.push({ name: 'ArticleDetail', params: { id: related.id } })"
            class="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow cursor-pointer"
          >
            <img
              :src="related.image"
              :alt="related.title"
              class="w-full h-48 object-cover"
            />
            <div class="p-4">
              <h3 class="font-semibold text-lg mb-2 line-clamp-2">{{ related.title }}</h3>
              <p class="text-sm text-neutral-500 mb-2">{{ related.date }}</p>
              <p class="text-sm text-neutral-600 line-clamp-2">{{ related.desc }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.prose h2 {
  font-size: 1.5rem;
  line-height: 2rem;
  font-weight: 700;
  margin-bottom: 1rem;
  margin-top: 2rem;
  color: #171717;
}

.prose p {
  margin-bottom: 1rem;
  color: #404040;
  line-height: 1.75;
}

.prose ul {
  margin-bottom: 1rem;
  margin-top: 0.5rem;
}

.prose ul > li {
  margin-top: 0.5rem;
}

.prose li {
  color: #404040;
}

.prose ol {
  margin-bottom: 1rem;
  margin-top: 0.5rem;
}

.prose ol > li {
  margin-top: 0.5rem;
}

.prose strong {
  font-weight: 600;
  color: #171717;
}
</style>

