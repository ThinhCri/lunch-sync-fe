import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChartBar, faGlobe } from '@fortawesome/free-solid-svg-icons';

export default function Footer() {
  const navigate = useNavigate();

  return (
    <footer className="bg-[#f7f3ee]">
      <div className="w-full py-12 px-8 flex flex-col md:flex-row justify-between items-center gap-6 max-w-screen-2xl mx-auto">
        <div className="flex flex-col items-center md:items-start gap-4">
          <div
            className="text-lg font-semibold text-[#56423a] font-['Plus_Jakarta_Sans',sans-serif] cursor-pointer"
            onClick={() => navigate('/')}
          >
            LunchSync
          </div>
          <p className="text-sm text-[#56423a]">© 2024 LunchSync Editorial. All rights reserved.</p>
        </div>
        <div className="flex flex-wrap justify-center gap-8">
          <button
            className="text-sm font-medium text-[#56423a] hover:text-[#9a410f] transition-all"
            onClick={() => navigate('/about')}
          >
            Về chúng tôi
          </button>
          <button
            className="text-sm font-medium text-[#56423a] hover:text-[#9a410f] transition-all"
            onClick={() => navigate('/terms')}
          >
            Điều khoản dịch vụ
          </button>
          <button
            className="text-sm font-medium text-[#56423a] hover:text-[#9a410f] transition-all"
            onClick={() => navigate('/privacy')}
          >
            Chính sách bảo mật
          </button>
          <button
            className="text-sm font-medium text-[#56423a] hover:text-[#9a410f] transition-all"
            onClick={() => navigate('/contact')}
          >
            Hỗ trợ khách hàng
          </button>
        </div>
        <div className="flex gap-4">
          <FontAwesomeIcon icon={faChartBar} className="text-[#9a410f] cursor-pointer text-xl" />
          <FontAwesomeIcon icon={faGlobe} className="text-[#9a410f] cursor-pointer text-xl" />
        </div>
      </div>
    </footer>
  );
}
