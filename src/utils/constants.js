// Session statuses
export const SESSION_STATUS = {
  WAITING: 'waiting',
  VOTING: 'voting',
  RESULTS: 'results',
  PICKING: 'picking',
  DONE: 'done',
};

// Price tier options (tier = giá trị số gửi lên API, key = string dùng nội bộ)
export const PRICE_TIERS = [
  { tier: 0, key: 'under_40k', label: 'Dưới 40k', apiDisplay: 'Under40k/phần' },
  { tier: 1, key: '40_70k',    label: '40–70k',   apiDisplay: 'From40To70k/phần' },
  { tier: 2, key: '70_120k',   label: '70–120k',  apiDisplay: 'From70To120k/phần' },
  { tier: 3, key: 'over_120k',  label: 'Trên 120k', apiDisplay: 'Over120k/phần' },
];

export function formatPriceDisplay(apiDisplay) {
  const map = {
    'Under40k/phần': 'Dưới 40k/phần',
    'From40To70k/phần': '40–70k/phần',
    'From70To120k/phần': '70–120k/phần',
    'Over120k/phần': 'Trên 120k/phần',
  };
  return map[apiDisplay] || apiDisplay || '';
}

// Voting config
export const TIMER_DURATION = 15;    // giây/câu
export const VOTING_AUTO_CLOSE_SECONDS = 90; // giây tự động đóng voting
export const MAX_SKIP_COUNT = 2;      // số câu tối đa được skip
export const MIN_PARTICIPANTS = 3;
export const MAX_PARTICIPANTS = 8;
export const SESSION_EXPIRY_MINUTES = 15;

// Binary choice IDs (thứ tự cố định BC-1 → BC-8)
export const BINARY_CHOICES_IDS = ['BC-1', 'BC-2', 'BC-3', 'BC-4', 'BC-5', 'BC-6', 'BC-7', 'BC-8'];
