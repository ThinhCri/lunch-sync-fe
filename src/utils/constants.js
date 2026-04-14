// Session statuses
export const SESSION_STATUS = {
  WAITING: 'waiting',
  VOTING: 'voting',
  RESULTS: 'results',
  PICKING: 'picking',
  DONE: 'done',
};

// Price tier options (theo spec)
export const PRICE_TIERS = [
  { key: 'duoi_40k', value: 30, label: 'Dưới 40k', priceDisplay: 'Dưới 40k/phần' },
  { key: '40_70k', value: 60, label: '40–70k', priceDisplay: '40–70k/phần' },
  { key: '70_120k', value: 100, label: '70–120k', priceDisplay: '70–120k/phần' },
  { key: 'tren_120k', value: 150, label: 'Trên 120k', priceDisplay: 'Trên 120k/phần' },
];

// Voting config
export const TIMER_DURATION = 15;    // giây/câu
export const VOTING_AUTO_CLOSE_SECONDS = 90; // giây tự động đóng voting
export const MAX_SKIP_COUNT = 2;      // số câu tối đa được skip
export const MIN_PARTICIPANTS = 3;
export const MAX_PARTICIPANTS = 8;
export const SESSION_EXPIRY_MINUTES = 15;

// Binary choice IDs (thứ tự cố định BC-1 → BC-8)
export const BINARY_CHOICES_IDS = ['BC-1', 'BC-2', 'BC-3', 'BC-4', 'BC-5', 'BC-6', 'BC-7', 'BC-8'];
