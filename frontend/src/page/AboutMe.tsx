import { Link } from 'react-router-dom';
import { ShieldCheck, Award, Sparkles, Building2, Utensils, Compass, Waves, CheckCircle2, ArrowRight, HeartHandshake, Lock, Star } from 'lucide-react';
import Button from '../components/ui/Button';
import PATH from '../configs/path';

export default function AboutMe() {
  return (
    <div className="min-h-screen bg-cream-50 text-navy-900 font-sans selection:bg-gold-500 selection:text-navy-900">
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-20 md:pt-24 md:pb-28 bg-gradient-to-b from-cream-100 via-cream-50 to-cream-50 border-b border-cream-200">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-gold-500/10 via-transparent to-transparent pointer-events-none" />
        <div className="container-page relative z-10 text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold-100 border border-gold-300 text-gold-800 text-xs font-bold uppercase tracking-widest mb-6 shadow-xs">
            <Sparkles size={14} className="text-gold-600" /> Chào mừng tới Grandeur Luxury Resort
          </div>

          <h1 className="text-4xl sm:text-6xl font-black text-navy-900 tracking-tight leading-tight">
            Kiến tạo Trải nghiệm <br className="hidden sm:inline" />
            <span className="bg-linear-to-r from-gold-600 via-amber-600 to-gold-700 bg-clip-text text-transparent">
              Đẳng cấp Thượng lưu & An toàn Bảo mật
            </span>
          </h1>

          <p className="mt-6 text-base sm:text-lg text-ink-600 max-w-2xl mx-auto leading-relaxed">
            Grandeur Hotel & Resort tự hào là thương hiệu khách sạn nghỉ dưỡng 5 sao hàng đầu, nơi hòa quyện hoàn hảo giữa kiến trúc đương đại tinh tế, ẩm thực thượng hạng và hạ tầng công nghệ bảo vệ tuyệt đối dữ liệu cá nhân du khách.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link to={PATH.ROOMS}>
              <Button size="lg" className="bg-gold-500 hover:bg-gold-600 text-navy-950 font-bold px-8 shadow-md">
                Khám phá Phòng nghỉ <ArrowRight size={18} className="ml-2 inline" />
              </Button>
            </Link>
            <a href="#compliance">
              <Button variant="outline" size="lg" className="border-cream-300 text-navy-900 hover:bg-white">
                Chính sách Pháp lý & Bảo mật
              </Button>
            </a>
          </div>

          {/* Stats Bar */}
          <div className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-6 p-6 rounded-2xl bg-white border border-cream-200 shadow-soft">
            <div className="text-center">
              <div className="text-3xl font-black text-gold-700">5★ Luxe</div>
              <div className="text-xs text-ink-400 font-medium mt-1">Tiêu chuẩn Quốc tế</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-black text-gold-700">120+</div>
              <div className="text-xs text-ink-400 font-medium mt-1">Phòng & Royal Suite</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-black text-emerald-700">100%</div>
              <div className="text-xs text-ink-400 font-medium mt-1">Bảo vệ Dữ liệu (ND356)</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-black text-gold-700">99.8%</div>
              <div className="text-xs text-ink-400 font-medium mt-1">Hài lòng từ Du khách</div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Brand Story / Về Khách sạn */}
      <section className="py-20 bg-white">
        <div className="container-page grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-block px-3 py-1 rounded-md bg-gold-100 text-gold-800 text-xs font-bold uppercase tracking-wider">
              Câu chuyện Thương hiệu
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-navy-900 leading-snug">
              Kiến trúc tuyệt tác hòa quyện cùng sự an tâm trọn vẹn
            </h2>
            <p className="text-ink-600 leading-relaxed text-base">
              Tọa lạc tại vị trí độc tôn ven đại dương, Grandeur Hotel được xây dựng với tầm nhìn trở thành biểu tượng nghỉ dưỡng hàng đầu. Mỗi phòng nghỉ và biệt thự đều mang dấu ấn thiết kế riêng biệt, tràn ngập ánh sáng tự nhiên và mở ra tầm nhìn hướng biển tuyệt đẹp.
            </p>
            <p className="text-ink-500 leading-relaxed text-sm">
              Chúng tôi không chỉ chăm chút từng bữa ăn, giấc ngủ của khách hàng mà còn tiên phong ứng dụng công nghệ mã hóa số hóa thông tin cá nhân, mang lại trải nghiệm nghỉ dưỡng riêng tư tuyệt đối.
            </p>
            <div className="space-y-3 pt-2">
              {[
                'Phục vụ phòng riêng biệt & dịch vụ Butler 24/7',
                'Quy trình Check-in số hóa nhanh gọn, bảo mật thông tin CCCD',
                'Ẩm thực phong phú chế biến từ các siêu đầu bếp Michelin',
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-3 text-sm font-semibold text-navy-900">
                  <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-2 rounded-3xl bg-gradient-to-r from-gold-400/20 to-emerald-400/20 blur-lg" />
            <img
              src="https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1000&q=80"
              alt="Grandeur Hotel Architecture"
              className="relative rounded-2xl border border-cream-200 shadow-card object-cover aspect-4/3 w-full"
            />
          </div>
        </div>
      </section>

      {/* 3. Giá trị Cốt lõi (Core Values) */}
      <section className="py-16 bg-cream-100/60 border-y border-cream-200">
        <div className="container-page">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <div className="inline-block px-3 py-1 rounded-md bg-gold-100 text-gold-800 text-xs font-bold uppercase tracking-wider mb-2">
              Triết lý Kinh doanh
            </div>
            <h2 className="text-3xl font-extrabold text-navy-900">5 Giá Trị Cốt Lõi Của Grandeur</h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Lock, title: 'Bảo mật Tuyệt đối', desc: 'Ứng dụng chuẩn mã hóa PII & Nghị định 356/2025/NĐ-CP để giữ an toàn 100% dữ liệu riêng tư của du khách.' },
              { icon: Award, title: 'Đẳng cấp 5 Sao', desc: 'Tiêu chuẩn phục vụ tận tâm, chu đáo trong từng chi tiết nhỏ nhất.' },
              { icon: HeartHandshake, title: 'Tận tâm Phục vụ', desc: 'Đội ngũ lễ tân và nhân viên luôn sẵn sàng hỗ trợ khách hàng 24/7 với nụ cười thân thiện.' },
              { icon: Utensils, title: 'Ẩm thực Tinh tế', desc: 'Nguyên liệu tươi ngon thượng hạng chọn lọc kỹ lưỡng bởi các chuyên gia ẩm thực.' },
              { icon: ShieldCheck, title: 'Pháp lý Minh bạch', desc: 'Tuân thủ nghiêm túc Luật Cư trú, Luật Du lịch và công khai minh bạch mọi chi phí.' },
            ].map((v, i) => (
              <div key={i} className="p-6 rounded-2xl bg-white border border-cream-200 shadow-soft hover:shadow-md transition-all">
                <div className="h-10 w-10 rounded-xl bg-gold-100 text-gold-800 flex items-center justify-center mb-4">
                  <v.icon size={20} />
                </div>
                <h3 className="text-base font-bold text-navy-900 mb-2">{v.title}</h3>
                <p className="text-xs text-ink-600 leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Luxury Amenities / Dịch vụ Thượng thượng */}
      <section className="py-20 bg-white">
        <div className="container-page text-center">
          <div className="inline-block px-3 py-1 rounded-md bg-gold-100 text-gold-800 text-xs font-bold uppercase tracking-wider mb-3">
            Hệ sinh thái Tiện ích
          </div>
          <h2 className="text-3xl font-extrabold text-navy-900">Dịch vụ & Trải nghiệm Độc bản</h2>
          <p className="text-ink-600 max-w-xl mx-auto mt-2 text-sm">
            Tận hưởng trọn vẹn chuỗi tiện ích cao cấp ngay tại không gian resort 5 sao.
          </p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
            {[
              { icon: Waves, title: 'Hồ bơi Vô cực', desc: 'Hồ bơi nước mặn tràn viền tầng cao hướng thẳng tầm nhìn ra đại dương.' },
              { icon: Utensils, title: 'Ocean Restaurant', desc: 'Nhà hàng ẩm thực Á - Âu thượng hạng ngắm hoàng hôn lãng mạn.' },
              { icon: Compass, title: 'Tour Du thuyền', desc: 'Hành trình hải trình khám phá đảo ngọc và lặn biển ngắm san hô.' },
              { icon: Building2, title: 'Trung tâm Hội nghị', desc: 'Phòng khánh tiết tiêu chuẩn quốc tế trang bị âm thanh ánh sáng hiện đại.' },
            ].map((card, idx) => (
              <div key={idx} className="p-6 rounded-2xl bg-cream-50/80 border border-cream-200 hover:border-gold-400 transition-all text-left group hover:shadow-soft">
                <div className="h-12 w-12 rounded-xl bg-gold-500/10 text-gold-700 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <card.icon size={24} />
                </div>
                <h3 className="text-lg font-bold text-navy-900 mb-2">{card.title}</h3>
                <p className="text-ink-500 text-xs leading-relaxed">{card.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Compliance & Legal Section (Bảo vệ Dữ liệu, Luật Cư trú & Luật Du lịch) */}
      <section id="compliance" className="py-20 bg-cream-100/80 border-t border-cream-200">
        <div className="container-page max-w-5xl">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-bold uppercase tracking-wider mb-3">
              <ShieldCheck size={16} /> Tuân thủ Pháp lý & Bảo vệ Dữ liệu
            </div>
            <h2 className="text-3xl font-extrabold text-navy-900">Cam kết Tuân thủ Quy định Pháp luật</h2>
            <p className="text-ink-600 text-sm mt-2 max-w-2xl mx-auto">
              Grandeur Hotel nghiêm túc chấp hành các quy chuẩn pháp lý Việt Nam để đảm bảo an toàn tuyệt đối cho du khách.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Nghị định 356/2025 */}
            <div className="p-6 rounded-2xl bg-white border border-emerald-200 shadow-soft space-y-3">
              <div className="h-10 w-10 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                01
              </div>
              <h3 className="text-base font-bold text-navy-900">Nghị định 356/2025/NĐ-CP</h3>
              <p className="text-xs text-ink-600 leading-relaxed">
                Mọi thông tin cá nhân và số CCCD được mã hóa bảo mật chuẩn AES. Giao diện hiển thị luôn được che giấu riêng tư (dạng <code className="font-mono text-emerald-800 font-bold">********1234</code>) và chỉ xử lý khi có sự đồng ý (Consent) của khách hàng.
              </p>
            </div>

            {/* Luật Cư trú */}
            <div className="p-6 rounded-2xl bg-white border border-blue-200 shadow-soft space-y-3">
              <div className="h-10 w-10 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center font-bold">
                02
              </div>
              <h3 className="text-base font-bold text-navy-900">Luật Cư trú & Khai báo</h3>
              <p className="text-xs text-ink-600 leading-relaxed">
                Quy trình lễ tân tiếp nhận thông tin khai báo lưu trú nhanh chóng, truyền nhận dữ liệu thông báo lưu trú chính xác tới cơ quan chức năng, tiết kiệm thời gian check-in cho khách hàng.
              </p>
            </div>

            {/* Luật Du lịch */}
            <div className="p-6 rounded-2xl bg-white border border-gold-200 shadow-soft space-y-3">
              <div className="h-10 w-10 rounded-lg bg-gold-100 text-gold-800 flex items-center justify-center font-bold">
                03
              </div>
              <h3 className="text-base font-bold text-navy-900">Luật Du lịch Việt Nam</h3>
              <p className="text-xs text-ink-600 leading-relaxed">
                Minh bạch toàn bộ bảng giá niêm yết, chính sách hoàn hủy cọc phòng và đảm bảo an toàn chất lượng dịch vụ du lịch theo đúng chuẩn 5 sao.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Testimonials */}
      <section className="py-20 bg-white">
        <div className="container-page max-w-4xl text-center">
          <div className="inline-block px-3 py-1 rounded-md bg-gold-100 text-gold-800 text-xs font-bold uppercase tracking-wider mb-3">
            Đánh giá từ Du khách
          </div>
          <h2 className="text-3xl font-extrabold text-navy-900">Trải nghiệm Thực tế</h2>

          <div className="mt-10 grid md:grid-cols-2 gap-6 text-left">
            <div className="p-6 rounded-2xl bg-cream-50 border border-cream-200">
              <div className="flex gap-1 text-gold-500 mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} fill="currentColor" />
                ))}
              </div>
              <p className="text-xs text-ink-600 leading-relaxed italic">
                "Khách sạn vô cùng sang trọng, thủ tục check-in cực kỳ nhanh gọn và thông tin cá nhân của tôi được bảo mật chu đáo. Sẽ quay lại trong kỳ nghỉ tới!"
              </p>
              <div className="mt-4 font-bold text-navy-900 text-sm">— Anh Trần Minh Hoàng (TP. Hồ Chí Minh)</div>
            </div>

            <div className="p-6 rounded-2xl bg-cream-50 border border-cream-200">
              <div className="flex gap-1 text-gold-500 mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} fill="currentColor" />
                ))}
              </div>
              <p className="text-xs text-ink-600 leading-relaxed italic">
                "Amazing experience at Grandeur! The ocean view suites are breathtaking and the staff made us feel truly welcomed and safe."
              </p>
              <div className="mt-4 font-bold text-navy-900 text-sm">— Ms. Sarah Jenkins (Australia)</div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Call To Action (CTA) */}
      <section className="py-16 bg-gradient-to-r from-navy-950 via-navy-900 to-navy-950 text-white text-center">
        <div className="container-page max-w-3xl">
          <Award size={40} className="mx-auto text-gold-500 mb-4" />
          <h2 className="text-3xl font-extrabold text-white">Sẵn sàng cho Kỳ nghỉ Đẳng cấp Thượng lưu?</h2>
          <p className="text-cream-200/80 text-sm mt-3 mb-8">
            Đặt phòng ngay hôm nay để nhận ưu đãi cọc hấp dẫn và dịch vụ đưa đón cao cấp.
          </p>
          <Link to={PATH.ROOMS}>
            <Button size="lg" className="bg-gold-500 hover:bg-gold-600 text-navy-950 font-bold px-10 shadow-lg">
              Đặt phòng Ngay bây giờ
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
