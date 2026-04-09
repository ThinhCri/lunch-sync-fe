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
  const code = error?.response?.data?.error?.code;
  const message = error?.response?.data?.error?.message;
  const details = error?.response?.data?.error?.details;
  const status = error?.response?.status;

  // Xử lý các lỗi hệ thống (Proxy, Gateway, Server Down)
  if (status === 502 || status === 503 || status === 504) {
    return {
      code: 'SERVER_UNREACHABLE',
      message: 'Server hiện không khả dụng (Bad Gateway). Vui lòng kiểm tra lại backend.',
      details: error.message
    };
  }

  return {
    code: code || 'UNKNOWN',
    message: message || ERROR_CODE_MAP[code] || 'Đã xảy ra lỗi hệ thống. Vui lòng thử lại.',
    details: details || error.message || null,
  };
}
