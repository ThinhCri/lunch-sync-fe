export const MOCK_COLLECTIONS = [
  {
    id: 'col-1',
    name: 'Quanh Bitexco - Nguyễn Huệ',
    description: 'Khu vực trung tâm Q1, nhiều lựa chọn đa dạng',
    restaurantCount: 12,
  },
  {
    id: 'col-2',
    name: 'Khu Du Lịch Lakeside',
    description: 'Yên tĩnh, nhiều quán view đẹp',
    restaurantCount: 8,
  },
  {
    id: 'col-3',
    name: 'Phố Food Nguyễn Trãi',
    description: 'Đồ ăn nhanh, bún phở, cơm tấm',
    restaurantCount: 15,
  },
];

export const MOCK_RESTAURANTS = [
  {
    id: 'rest-1',
    name: 'Bún riêu Hà Nội',
    address: '123 Nguyễn Huệ, Q1',
    googleMapsUrl: 'https://maps.google.com/?q=Bún riêu Hà Nội 123 Nguyễn Huệ',
    priceTier: '40_70k',
    priceDisplay: '35–55k/phần',
    rating: 4.3,
    thumbnailUrl: 'https://picsum.photos/seed/rest1/400/300',
    matchedDishes: ['Bún riêu', 'Bún bò'],
    dishes: ['Bún riêu', 'Bún bò', 'Bún chả'],
  },
  {
    id: 'rest-2',
    name: 'Phở Thìn',
    address: '45 Đồng Khởi, Q1',
    googleMapsUrl: 'https://maps.google.com/?q=Phở Thìn 45 Đồng Khởi',
    priceTier: '40_70k',
    priceDisplay: '40–60k/phần',
    rating: 4.5,
    thumbnailUrl: 'https://picsum.photos/seed/rest2/400/300',
    matchedDishes: ['Phở bò'],
    dishes: ['Phở bò', 'Phở gà'],
  },
  {
    id: 'rest-3',
    name: 'Cơm Tấm Kiều Giang',
    address: '78 Lê Lợi, Q1',
    priceTier: '40_70k',
    priceDisplay: '45–65k/phần',
    rating: 4.1,
    thumbnailUrl: 'https://picsum.photos/seed/rest3/400/300',
    matchedDishes: ['Cơm tấm'],
    dishes: ['Cơm tấm', 'Cơm sườn'],
  },
  {
    id: 'rest-4',
    name: 'Bánh Mì Huỳnh Hoa',
    address: '26 Lê Thị Riêng, Q1',
    priceTier: 'duoi_40k',
    priceDisplay: '25–40k/phần',
    rating: 4.7,
    thumbnailUrl: 'https://picsum.photos/seed/rest4/400/300',
    matchedDishes: ['Bánh mì'],
    dishes: ['Bánh mì', 'Bánh mì pate'],
  },
  {
    id: 'rest-5',
    name: 'Lẩu Bò Facebook',
    address: '90 Pasteur, Q1',
    priceTier: '70_120k',
    priceDisplay: '80–120k/phần',
    rating: 4.4,
    thumbnailUrl: 'https://picsum.photos/seed/rest5/400/300',
    matchedDishes: ['Lẩu bò'],
    dishes: ['Lẩu bò', 'Lẩu gà'],
  },
];

export const MOCK_DISHES = [
  { id: 'dish-1', name: 'Phở bò', category: 'Phở & Bún nước' },
  { id: 'dish-2', name: 'Bún riêu', category: 'Phở & Bún nước' },
  { id: 'dish-3', name: 'Bún bò Huế', category: 'Phở & Bún nước' },
  { id: 'dish-4', name: 'Cơm tấm', category: 'Cơm' },
  { id: 'dish-5', name: 'Bánh mì', category: 'Ăn nhanh' },
  { id: 'dish-6', name: 'Lẩu bò', category: 'Lẩu' },
  { id: 'dish-7', name: 'Gỏi cuốn', category: 'Món cuốn' },
  { id: 'dish-8', name: 'Bún chả Hà Nội', category: 'Phở & Bún nước' },
  { id: 'dish-9', name: 'Mì Quảng', category: 'Mì & Miến' },
  { id: 'dish-10', name: 'Cao lầu', category: 'Mì & Miến' },
];

export const BINARY_CHOICES = [
  { id: 'BC-1', optionA: 'Món nước', optionB: 'Món khô' },
  { id: 'BC-2', optionA: 'Nóng hổi', optionB: 'Mát/nguội cũng ok' },
  { id: 'BC-3', optionA: 'Ăn nhẹ vừa bụng', optionB: 'No nê chắc bụng' },
  { id: 'BC-4', optionA: 'Mềm mịn', optionB: 'Dai giòn có texture' },
  { id: 'BC-5', optionA: 'Thanh đạm', optionB: 'Đậm đà đậm vị' },
  { id: 'BC-6', optionA: 'Không cay', optionB: 'Cay được' },
  { id: 'BC-7', optionA: 'Ăn nhanh quay lại', optionB: 'Ngồi thong thả ☕' },
  { id: 'BC-8', optionA: 'Quen thuộc comfort', optionB: 'Thử món lạ miệng' },
];

// Simulate network delay 200–500ms
function delay(value) {
  return new Promise((resolve) => setTimeout(() => resolve(value), 200 + Math.random() * 300));
}

function generatePin() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Mock session state
let mockSession = null;

export const mockHandlers = {
  // POST /auth/login + register
  login: (email, password) => {
    if (!email || !password) {
      return delay({ error: { code: 'VALIDATION_ERROR', message: 'Email và mật khẩu không được để trống.' } });
    }
    const fakeToken = 'mock-jwt-' + Date.now();
    const fakeUser = { id: 'user-1', email, nickname: email.split('@')[0] };
    return delay({ token: fakeToken, user: fakeUser });
  },

  register: (email, password) => {
    if (!email || !password) {
      return delay({ error: { code: 'VALIDATION_ERROR', message: 'Email và mật khẩu không được để trống.' } });
    }
    const fakeToken = 'mock-jwt-' + Date.now();
    const fakeUser = { id: 'user-' + Date.now(), email, nickname: email.split('@')[0] };
    return delay({ token: fakeToken, user: fakeUser });
  },

  // POST /sessions
  createSession: ({ collectionId, priceTier }) => {
    const pin = generatePin();
    const collection = MOCK_COLLECTIONS.find(c => c.id === collectionId) || MOCK_COLLECTIONS[0];
    const mockParticipants = [
      { id: 'p-bot-1', nickname: 'Minh', joinedAt: new Date().toISOString() },
      { id: 'p-bot-2', nickname: 'Lan', joinedAt: new Date().toISOString() },
      { id: 'p-bot-3', nickname: 'Tuấn', joinedAt: new Date().toISOString() },
    ];
    mockSession = {
      sessionId: 'session-' + Date.now(),
      pin,
      collectionId,
      collectionName: collection.name,
      priceTier,
      status: 'waiting',
      participants: mockParticipants,
      createdAt: Date.now(),
    };
    return delay({
      sessionId: mockSession.sessionId,
      pin,
      shareLink: `${window.location.origin}/join/${pin}`,
      status: 'waiting',
      collectionName: collection.name,
    });
  },

  // GET /sessions/{pin}
  getSessionInfo: (pin) => {
    if (!mockSession || mockSession.pin !== pin) {
      return delay({ error: { code: 'SESSION_NOT_FOUND', message: 'Không tìm thấy phiên với mã PIN này.' } });
    }
    return delay({ ...mockSession });
  },

  // POST /sessions/{pin}/join
  joinSession: (pin, nickname) => {
    if (!mockSession || mockSession.pin !== pin) {
      return delay({ error: { code: 'SESSION_NOT_FOUND', message: 'Không tìm thấy phiên với mã PIN này.' } });
    }
    if (mockSession.participants.length >= 8) {
      return delay({ error: { code: 'SESSION_FULL', message: 'Phiên đã đầy (8 người).' } });
    }
    if (mockSession.participants.some(p => p.nickname === nickname)) {
      return delay({ error: { code: 'NICKNAME_TAKEN', message: 'Nickname đã tồn tại trong phiên này.' } });
    }
    const participant = { id: 'p-' + Date.now(), nickname, joinedAt: new Date().toISOString() };
    mockSession.participants.push(participant);
    return delay({
      participantId: participant.id,
      sessionId: mockSession.sessionId,
      nickname,
      participants: mockSession.participants,
    });
  },

  // POST /sessions/{pin}/start (host only)
  startSession: (pin) => {
    if (!mockSession || mockSession.pin !== pin) {
      return delay({ error: { code: 'SESSION_NOT_FOUND' } });
    }
    if (mockSession.participants.length < 3) {
      return delay({ error: { code: 'VALIDATION_ERROR', message: 'Cần tối thiểu 3 người để bắt đầu.' } });
    }
    mockSession.status = 'voting';
    mockSession.votingStartedAt = new Date().toISOString();
    return delay({ status: 'voting', votingStartedAt: mockSession.votingStartedAt });
  },

  // GET /sessions/{pin}/status
  getStatus: (pin) => {
    if (!mockSession || mockSession.pin !== pin) {
      return delay({ error: { code: 'SESSION_NOT_FOUND' } });
    }
    return delay({
      status: mockSession.status || 'waiting',
      participantsJoined: mockSession.participants.length,
      participantsVoted: mockSession.votedCount || 0,
      votingStartedAt: mockSession.votingStartedAt || null,
      boomTriggeredAt: mockSession.boomTriggeredAt || null,
    });
  },

  // GET /sessions/{pin}/choices
  getChoices: () => {
    return delay(BINARY_CHOICES);
  },

  // POST /sessions/{pin}/vote
  submitVote: (pin, participantId, choices) => {
    if (!mockSession || mockSession.pin !== pin) {
      return delay({ error: { code: 'SESSION_NOT_FOUND' } });
    }
    mockSession.votedCount = (mockSession.votedCount || 0) + 1;
    const total = mockSession.participants.length;
    if (mockSession.votedCount >= total) {
      mockSession.status = 'results';
      mockSession.results = {
        topDishes: [
          { id: 'dish-2', name: 'Bún riêu', category: 'Phở & Bún nước', score: 0.85, rank: 1 },
          { id: 'dish-1', name: 'Phở bò', category: 'Phở & Bún nước', score: 0.72, rank: 2 },
          { id: 'dish-3', name: 'Bún bò Huế', category: 'Phở & Bún nước', score: 0.68, rank: 3 },
        ],
        topRestaurants: MOCK_RESTAURANTS.map((r, i) => ({ ...r, score: 0.9 - i * 0.1, rank: i + 1 })),
        boomTriggeredAt: null,
        eliminated: [],
        remaining: [],
        finalRestaurant: null,
      };
    }
    return delay({ status: 'voted', totalVoted: mockSession.votedCount, totalParticipants: total });
  },

  // POST /sessions/{pin}/boom
  boom: (pin) => {
    if (!mockSession || mockSession.pin !== pin) {
      return delay({ error: { code: 'SESSION_NOT_FOUND' } });
    }
    mockSession.status = 'picking';
    mockSession.boomTriggeredAt = new Date().toISOString();
    const restaurants = mockSession.results?.topRestaurants || [];
    const eliminated = restaurants.slice(2).map(r => ({ id: r.id, name: r.name, rank: r.rank }));
    const remaining = restaurants.slice(0, 3).map(r => ({ id: r.id, name: r.name, rank: r.rank }));
    return delay({ boomTriggeredAt: mockSession.boomTriggeredAt, eliminated, remaining });
  },

  // POST /sessions/{pin}/pick
  pick: (pin, restaurantId) => {
    if (!mockSession || mockSession.pin !== pin) {
      return delay({ error: { code: 'SESSION_NOT_FOUND' } });
    }
    const restaurant = MOCK_RESTAURANTS.find(r => r.id === restaurantId) || MOCK_RESTAURANTS[0];
    mockSession.status = 'done';
    mockSession.results.finalRestaurant = restaurant;
    return delay({ finalRestaurant: restaurant, status: 'done' });
  },

  // GET /sessions/{pin}/results
  getResults: (pin) => {
    if (!mockSession || mockSession.pin !== pin) {
      return delay({ error: { code: 'SESSION_NOT_FOUND' } });
    }
    return delay({
      ...mockSession.results,
      boomTriggeredAt: mockSession.boomTriggeredAt,
      status: mockSession.status,
    });
  },

  // GET /collections
  getCollections: () => {
    return delay(MOCK_COLLECTIONS);
  },

  // POST /sessions/{pin}/close-voting
  closeVoting: (pin) => {
    if (!mockSession || mockSession.pin !== pin) {
      return delay({ error: { code: 'SESSION_NOT_FOUND' } });
    }
    mockSession.status = 'results';
    return delay({ status: 'results', totalVoted: mockSession.votedCount || 0, totalParticipants: mockSession.participants.length });
  },

  // DELETE /sessions/{pin} (host cancel)
  cancelSession: (pin) => {
    if (!mockSession || mockSession.pin !== pin) {
      return delay({ error: { code: 'SESSION_NOT_FOUND' } });
    }
    mockSession = null;
    return delay({ success: true });
  },
};
