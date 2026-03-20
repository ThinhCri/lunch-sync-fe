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
  { key: 'duoi_40k', label: 'Dưới 40k' },
  { key: '40_70k', label: '40–70k' },
  { key: '70_120k', label: '70–120k' },
  { key: 'tren_120k', label: 'Trên 120k' },
];

// Voting config
export const TIMER_DURATION = 15;    // giây/câu
export const MIN_PARTICIPANTS = 3;
export const MAX_PARTICIPANTS = 8;
export const SESSION_EXPIRY_MINUTES = 15;

// Binary choice IDs (thứ tự cố định BC-1 → BC-8)
export const BINARY_CHOICES_IDS = ['BC-1', 'BC-2', 'BC-3', 'BC-4', 'BC-5', 'BC-6', 'BC-7', 'BC-8'];
