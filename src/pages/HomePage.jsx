import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import Layout from '@/components/layout/Layout';
import JoinModal from '@/components/modals/JoinModal';
import homeHero from '@/assets/images/home-hero.jpg';
import homeFeatureFood from '@/assets/images/home-feature-food.jpg';
import homeFeatureRestaurant from '@/assets/images/home-feature-restaurant.jpg';

export default function HomePage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const [showJoinModal, setShowJoinModal] = useState(false);

  const handleCreateLunch = () => {
    if (isAuthenticated()) {
      navigate('/create');
    } else {
      navigate('/register');
    }
  };

  const handleJoin = () => {
    setShowJoinModal(true);
  };

  const handleSuggest = () => {
    navigate('/suggest');
  };

  return (
    <Layout>
      {/* ── Hero Section ── */}
      <section className="relative px-6 max-w-screen-2xl mx-auto overflow-hidden py-16 md:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

            {/* Left: Copy */}
            <div className="lg:col-span-7 z-10">
              <h1 className="text-5xl md:text-7xl font-extrabold leading-[1.1] tracking-tight mb-6 font-['Plus_Jakarta_Sans',sans-serif]"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                Giúp cả nhóm chọn bữa trưa trong{' '}
                <span className="text-[#9a410f] italic not-italic font-black">3 phút</span>
              </h1>
              <p className="text-xl text-[#56423a] max-w-xl mb-10 leading-relaxed">
                Tạm biệt những cuộc thảo luận kéo dài vô tận. LunchSync kết nối đồng nghiệp qua những bữa trưa ấm cúng và nhanh chóng.
              </p>

              {/* CTA buttons */}
              <div className="flex flex-wrap gap-4">
                <button
                  onClick={handleCreateLunch}
                  className="px-8 py-4 bg-gradient-to-br from-[#9a410f] to-[#ba5826] text-white rounded-xl text-lg font-bold transition-all hover:scale-[1.02] active:scale-95 duration-300"
                  style={{ boxShadow: '0 20px 40px rgba(28, 28, 25, 0.06)' }}
                >
                  Tạo bữa trưa
                </button>
                <button
                  onClick={handleJoin}
                  className="px-8 py-4 bg-[#ebe8e3] text-[#715000] rounded-xl text-lg font-bold transition-all hover:bg-[#e6e2dd] active:scale-95 duration-300"
                >
                  Tham gia
                </button>
              </div>

              {/* Stats */}
              <div className="mt-12 flex flex-wrap gap-8">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-[#ffc247] flex items-center justify-center text-[#8a4b31]">
                    <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>group</span>
                  </div>
                  <div>
                    <p className="font-bold text-[#1c1c19]">3-8 người</p>
                    <p className="text-sm text-[#56423a]">Quy mô lý tưởng</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-[#ffc247] flex items-center justify-center text-[#8a4b31]">
                    <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>schedule</span>
                  </div>
                  <div>
                    <p className="font-bold text-[#1c1c19]">3 phút</p>
                    <p className="text-sm text-[#56423a]">Chốt nhanh chóng</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-[#ffc247] flex items-center justify-center text-[#8a4b31]">
                    <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>how_to_vote</span>
                  </div>
                  <div>
                    <p className="font-bold text-[#1c1c19]">Bỏ phiếu dễ dàng</p>
                    <p className="text-sm text-[#56423a]">Minh bạch &amp; vui vẻ</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Hero image */}
            <div className="lg:col-span-5 relative">
              <div
                className="relative w-full aspect-square rounded-[3rem] overflow-hidden transform rotate-2"
                style={{ boxShadow: '0 20px 40px rgba(28, 28, 25, 0.06)' }}
              >
                <img
                  alt="Colleagues having lunch together"
                  className="w-full h-full object-cover"
                  src={homeHero}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#9a410f]/20 to-transparent" />
              </div>

              {/* Hearth badge */}
              <div
                className="absolute -bottom-6 -left-6 bg-white p-6 rounded-2xl z-20 flex flex-col gap-1"
                style={{ boxShadow: '0 20px 40px rgba(28, 28, 25, 0.06)', border: '1px solid rgba(220, 193, 182, 0.3)' }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-8 h-8 rounded-full bg-[#9a410f]/10 flex items-center justify-center">
                    <span className="material-symbols-outlined text-[#9a410f] text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>timer</span>
                  </div>
                  <span className="font-bold text-[#1c1c19] font-['Plus_Jakarta_Sans',sans-serif]">Quyết định nhanh</span>
                </div>
                <p className="text-xs text-[#56423a] font-medium">
                  Trung bình tiết kiệm <span className="text-[#9a410f] font-bold">15 phút</span> mỗi ngày
                </p>
              </div>
            </div>

          </div>
        </section>

        {/* ── Bento Features Section ── */}
        <section className="bg-[#f7f3ee] py-24 px-6">
          <div className="max-w-screen-2xl mx-auto">
            <h2 className="text-4xl font-extrabold mb-16 text-center font-['Plus_Jakarta_Sans',sans-serif]">
              Trải nghiệm bữa trưa hiện đại
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

              {/* Feature 1 — 2 cols */}
              <div className="md:col-span-2 bg-white p-10 rounded-lg flex flex-col md:flex-row gap-8 items-center border border-[rgba(220,193,182,0.2)] transition-all hover:scale-[1.01]"
                style={{ borderRadius: '1rem' }}
              >
                <div className="flex-1">
                  <h3 className="text-2xl font-bold mb-4 text-[#9a410f] font-['Plus_Jakarta_Sans',sans-serif]">Khám phá hương vị mới</h3>
                  <p className="text-[#56423a] leading-relaxed">
                    Hệ thống gợi ý thông minh dựa trên sở thích của cả nhóm, giúp bạn không bao giờ phải ăn đi ăn lại một món nhàm chán.
                  </p>
                </div>
                <div className="w-full md:w-64 h-48 rounded-lg overflow-hidden">
                  <img
                    alt="Delicious dishes variety"
                    className="w-full h-full object-cover"
                    src={homeFeatureFood}
                  />
                </div>
              </div>

              {/* Feature 2 — accent card */}
              <div className="bg-[#ba5826] p-10 rounded-lg text-white flex flex-col justify-between transition-all hover:scale-[1.01]"
                style={{ borderRadius: '1rem' }}
              >
                <span className="material-symbols-outlined text-5xl mb-6" style={{ fontVariationSettings: "'FILL' 1" }}>timer</span>
                <div>
                  <h3 className="text-2xl font-bold mb-4 font-['Plus_Jakarta_Sans',sans-serif]">Tiết kiệm thời gian</h3>
                  <p className="opacity-90 leading-relaxed">
                    Quy trình vote được tối ưu hóa để đưa ra quyết định nhanh nhất, dành thêm thời gian cho việc thưởng thức.
                  </p>
                </div>
              </div>

              {/* Feature 3 */}
              <div className="bg-[#e6e2dd] p-10 rounded-lg flex flex-col transition-all hover:scale-[1.01]"
                style={{ borderRadius: '1rem' }}
              >
                <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center mb-6">
                  <span className="material-symbols-outlined text-[#9a410f] text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
                </div>
                <h3 className="text-2xl font-bold mb-4 text-[#1c1c19] font-['Plus_Jakarta_Sans',sans-serif]">Kết nối đồng nghiệp</h3>
                <p className="text-[#56423a] leading-relaxed">
                  Bữa trưa không chỉ là ăn uống, đó là lúc chúng ta xích lại gần nhau hơn trong một không gian ấm cúng.
                </p>
              </div>

              {/* Feature 4 — 2 cols, reversed */}
              <div className="md:col-span-2 bg-white p-10 rounded-lg flex flex-col md:flex-row-reverse gap-8 items-center border border-[rgba(220,193,182,0.2)] transition-all hover:scale-[1.01]"
                style={{ borderRadius: '1rem' }}
              >
                <div className="flex-1">
                  <h3 className="text-2xl font-bold mb-4 text-[#7c5800] font-['Plus_Jakarta_Sans',sans-serif]">Đề xuất địa điểm</h3>
                  <p className="text-[#56423a] leading-relaxed">
                    Thêm những quán "ruột" của bạn vào danh sách chung để cả nhóm cùng trải nghiệm những khám phá mới của bạn.
                  </p>
                </div>
                <div className="w-full md:w-64 h-48 rounded-[2rem] overflow-hidden">
                  <img
                    alt="Cozy restaurant interior"
                    className="w-full h-full object-cover"
                    src={homeFeatureRestaurant}
                  />
                </div>
              </div>

            </div>
          </div>
        </section>

      {/* ── CTA Section ── */}
      <section className="py-24 px-6 max-w-screen-xl mx-auto text-center">
        <div
          className="bg-[#ebe8e3] rounded-[4rem] p-16 relative overflow-hidden"
          style={{ borderRadius: '4rem' }}
        >
          <div className="relative z-10">
            <h2 className="text-4xl md:text-5xl font-extrabold mb-8 font-['Plus_Jakarta_Sans',sans-serif]">
              Sẵn sàng cho bữa trưa hôm nay?
            </h2>
            <p className="text-xl text-[#56423a] mb-12 max-w-2xl mx-auto">
              Đừng để việc chọn món làm hỏng tâm trạng của cả nhóm. Bắt đầu ngay với LunchSync.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-6">
              <button
                onClick={handleCreateLunch}
                className="px-12 py-5 bg-[#9a410f] text-white rounded-full text-xl font-bold hover:bg-[#ba5826] transition-all"
                style={{ boxShadow: '0 20px 40px rgba(28, 28, 25, 0.06)' }}
              >
                Tạo bữa trưa ngay
              </button>
            </div>
          </div>
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-[#ffc247]/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-[#9a410f]/10 rounded-full blur-3xl" />
        </div>
      </section>
      <JoinModal
        open={showJoinModal}
        onClose={() => setShowJoinModal(false)}
      />
    </Layout>
  );
}
