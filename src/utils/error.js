// Error factory: parse API error → Vietnamese message + error code

const ERROR_CODE_MAP = {
  SESSION_NOT_FOUND: 'Không tìm thấy phiên với mã PIN này.',
  SESSION_EXPIRED: 'Phiên đã hết hạn. Vui lòng tạo phiên mới.',
  SESSION_FULL: 'Phiên đã đầy (8 người).',
  NICKNAME_TAKEN: 'Nickname đã tồn tại trong phiên này.',
  VOTING_CLOSED: 'Voting đã đóng.',
  UNAUTHORIZED: 'Bạn không có quyền thực hiện thao tác này.',
  VALIDATION_ERROR: 'Dữ liệu không hợp lệ.',
  WRONG_PASSWORD: 'Mật khẩu không đúng.',
  EMAIL_EXISTS: 'Email đã được sử dụng.',
  USER_DUPLICATE: 'Email đã được sử dụng.',
  EMAIL_NOT_VERIFIED: 'Tài khoản chưa được xác minh. Vui lòng xác nhận OTP.',
  INVALID_CREDENTIALS: 'Email hoặc mật khẩu không đúng.',
};

// Chuyển tiếng Việt không dấu → có dấu
const VIETNAMESE_UNACCENT_MAP = [
  // Từ đơn
  ['thong tin', 'thông tin'],
  ['dang ky', 'đăng ký'],
  ['dang nhap', 'đăng nhập'],
  ['mat khau', 'mật khẩu'],
  ['tai khoan', 'tài khoản'],
  ['xac nhan', 'xác nhận'],
  ['chua', 'chưa'],
  ['khong', 'không'],
  ['co', 'có'],
  ['voi', 'với'],
  ['truoc', 'trước'],
  ['lai', 'lại'],
  ['vao', 'vào'],
  ['duoc', 'được'],
  ['trong', 'trong'],
  ['hien', 'hiện'],
  ['het han', 'hết hạn'],
  ['vui long', 'vui lòng'],
  ['thong bao', 'thông báo'],
  ['thanh cong', 'thành công'],
  ['that bai', 'thất bại'],
  ['loi', 'lỗi'],
  ['tai', 'tải'],
  ['bieu do', 'biểu đồ'],
  ['danh sach', 'danh sách'],
  ['thong tin', 'thông tin'],
  ['ma xac nhan', 'mã xác nhận'],
  ['ma otp', 'mã OTP'],
  ['het han', 'hết hạn'],
  ['da', 'đã'],
  ['du lieu', 'dữ liệu'],
  ['hop le', 'hợp lệ'],
  ['khong hop le', 'không hợp lệ'],
  ['ban', 'bạn'],
  ['nguoi dung', 'người dùng'],
  ['ngay', 'ngày'],
  ['gio', 'giờ'],
  ['phut', 'phút'],
  ['tai khoan', 'tài khoản'],
  ['mat khau', 'mật khẩu'],
  ['xin chao', 'xin chào'],
  ['chao mung', 'chào mừng'],
  ['cam on', 'cảm ơn'],
  ['nen', 'nên'],
  ['muon', 'muốn'],
  ['can', 'cần'],
  ['chi', 'chỉ'],
  ['nay', 'này'],
  ['khi', 'khi'],
  ['roi', 'rồi'],
  ['di', 'đi'],
  ['ra', 'ra'],
  ['va', 'và'],
  ['o', 'ở'],
  ['bo', 'bỏ'],
  ['toi', 'tôi'],
  ['ho', 'họ'],
  ['se', 'sẽ'],
  ['du', 'đủ'],
  ['duoc', 'được'],
  ['theo', 'theo'],
  ['luc', 'lúc'],
  ['bat dau', 'bắt đầu'],
  ['ket thuc', 'kết thúc'],
  ['khong dung', 'không đúng'],
  ['ma', 'mã'],
  ['sai', 'sai'],
  ['het', 'hết'],
  ['so', 'số'],
  ['lan', 'lần'],
  ['thu', 'thử'],
  ['thu lai', 'thử lại'],
  ['nhap', 'nhập'],
  ['yeu cau', 'yêu cầu'],
  ['lam', 'làm'],
  ['nhan', 'nhận'],
  ['gui', 'gửi'],
  ['chua xac nhan', 'chưa xác nhận'],
  ['tai khoan', 'tài khoản'],
  ['dang ky', 'đăng ký'],
  ['dang nhap', 'đăng nhập'],
];

function capitalizeSentences(str) {
  if (!str) return str;
  return str.replace(/(^\s*|[.!?]\s+)(.)/g, (match, prefix, char) => {
    return prefix + char.toUpperCase();
  });
}

function addVietnameseAccents(str) {
  if (!str) return str;
  let result = str.toLowerCase();
  for (const [unaccented, accented] of VIETNAMESE_UNACCENT_MAP) {
    result = result.replace(new RegExp(unaccented, 'g'), accented);
  }
  return capitalizeSentences(result);
}

export function parseApiError(error) {
  const data = error?.response?.data;
  const errorObj = data?.error;

  // Lấy code: ưu tiên trong error object, sau đó là root data
  const code = errorObj?.code || data?.code;
  
  // Lấy message: ưu tiên trong error object, sau đó là root data
  const message = errorObj?.message || data?.message;
  
  // Lấy detail/details: ưu tiên trong error object, sau đó là root data
  // details/detail có thể là string hoặc object (VD: {email: "..."})
  const rawDetails = errorObj?.details || errorObj?.detail || data?.details || data?.detail;
  const details = typeof rawDetails === 'string' ? rawDetails
    : typeof rawDetails === 'object' && rawDetails !== null
      ? Object.values(rawDetails).join(' ').trim()
      : null;
  
  const status = error?.response?.status;

  // Xử lý các lỗi hệ thống (Proxy, Gateway, Server Down)
  if (status === 502 || status === 503 || status === 504) {
    return {
      code: 'SERVER_UNREACHABLE',
      message: 'Server hiện không khả dụng (Bad Gateway). Vui lòng kiểm tra lại backend.',
      details: error.message
    };
  }

  // Lấy raw message từ BE (trước khi map) để check keywords
  const rawMsg = (details || message || '').toLowerCase();

  // Xử lý lỗi OTP cụ thể - kiểm tra details.otp trước
  const otpErrorDetail = rawDetails?.otp?.toLowerCase?.() || '';
  let finalMessage;

  if (
    (code === 'VALIDATION_ERROR' && otpErrorDetail) ||
    otpErrorDetail.includes('invalid verification code') ||
    otpErrorDetail.includes('incorrect') ||
    rawMsg.includes('invalid verification code') ||
    rawMsg.includes('ma otp khong dung') ||
    rawMsg.includes('otp incorrect') ||
    rawMsg.includes('wrong otp')
  ) {
    finalMessage = 'Mã OTP không đúng. Vui lòng kiểm tra và thử lại.';
  } else {
    // Ưu tiên: details/detail từ BE (chuyển không dấu → có dấu) → CODE_MAP → message từ BE → fallback
    // details từ BE luôn giữ nguyên nội dung gốc (có dấu tiếng Việt)
    finalMessage = addVietnameseAccents(details) || ERROR_CODE_MAP[code] || message || 'Đã xảy ra lỗi hệ thống. Vui lòng thử lại.';
  }

  // Detect: email chưa xác minh → cần redirect sang /verify
  const shouldRedirectToVerify =
    code === 'EMAIL_NOT_VERIFIED' ||
    rawMsg.includes('chưa xác minh') ||
    rawMsg.includes('chua xac nhan') ||
    rawMsg.includes('xac nhan email') ||
    rawMsg.includes('not verified') ||
    rawMsg.includes('unverified') ||
    rawMsg.includes('tai khoan chua duoc xac nhan');

  return {
    code: code || 'UNKNOWN',
    status: status || null,
    message: finalMessage,
    details: details || error.message || null,
    shouldRedirectToVerify,
  };
}
