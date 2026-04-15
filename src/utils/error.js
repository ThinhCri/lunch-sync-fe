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
};

export function parseApiError(error) {
  const data = error?.response?.data;
  const errorObj = data?.error;

  // Lấy code: ưu tiên trong error object, sau đó là root data
  const code = errorObj?.code || data?.code;
  
  // Lấy message: ưu tiên trong error object, sau đó là root data
  const message = errorObj?.message || data?.message;
  
  // Lấy detail/details: ưu tiên trong error object, sau đó là root data
  const details = errorObj?.details || errorObj?.detail || data?.details || data?.detail;
  
  const status = error?.response?.status;

  // Xử lý các lỗi hệ thống (Proxy, Gateway, Server Down)
  if (status === 502 || status === 503 || status === 504) {
    return {
      code: 'SERVER_UNREACHABLE',
      message: 'Server hiện không khả dụng (Bad Gateway). Vui lòng kiểm tra lại backend.',
      details: error.message
    };
  }

  // Ưu tiên: details/detail từ BE -> message từ BE -> mapping theo code -> fallback mặc định
  const finalMessage = details || message || ERROR_CODE_MAP[code] || 'Đã xảy ra lỗi hệ thống. Vui lòng thử lại.';

  return {
    code: code || 'UNKNOWN',
    status: status || null,
    message: finalMessage,
    details: details || error.message || null,
  };
}
