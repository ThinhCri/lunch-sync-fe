// ─── Collections ───────────────────────────────────────────────────────────────

export const MOCK_COLLECTIONS = [
  {
    id: 'col-1',
    name: 'Quanh Bitexco - Nguyễn Huệ',
    description: 'Khu vực Nguyễn Huệ, Hồ Tùng Mậu, Hàm Nghi — trung tâm Q1',
    restaurantCount: 32,
    coverageRadiusMeters: 250,
    status: 'active',
  },
  {
    id: 'col-2',
    name: 'Quanh Vincom Đồng Khởi',
    description: 'Khu Đồng Khởi, Lê Thánh Tôn, Lý Tự Trọng',
    restaurantCount: 28,
    coverageRadiusMeters: 250,
    status: 'active',
  },
  {
    id: 'col-3',
    name: 'Quanh Landmark 81',
    description: 'Khu vực Vinhomes Central Park, Bình Thạnh',
    restaurantCount: 25,
    coverageRadiusMeters: 250,
    status: 'active',
  },
];

export const PRICE_TIERS = [
  { key: 'duoi_40k', label: 'Dưới 40k', priceDisplay: 'Dưới 40k/phần' },
  { key: '40_70k', label: '40–70k', priceDisplay: '40–70k/phần' },
  { key: '70_120k', label: '70–120k', priceDisplay: '70–120k/phần' },
  { key: 'tren_120k', label: 'Trên 120k', priceDisplay: 'Trên 120k/phần' },
];

// Extra participants injected into the mock session for demo/UI purposes
export const MOCK_EXTRA_PARTICIPANTS = [
  { id: 'mock-1', nickname: 'Lan',     isHost: false },
  { id: 'mock-2', nickname: 'Minh',    isHost: false },
  { id: 'mock-3', nickname: 'Tú',     isHost: false },
  { id: 'mock-4', nickname: 'Huyền',   isHost: false },
  { id: 'mock-5', nickname: 'Nam',     isHost: false },
  { id: 'mock-6', nickname: 'Phương',  isHost: false },
  { id: 'mock-7', nickname: 'Thanh',   isHost: false },
];

// ─── Restaurants ───────────────────────────────────────────────────────────────

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
    dishes: ['Bún riêu', 'Bún bò', 'Bún chả'],
  },
  {
    id: 'rest-2',
    name: 'Phở Thìn',
    address: '45 Lý Tự Trọng, Q1',
    googleMapsUrl: 'https://maps.google.com/?q=Phở Thìn 45 Lý Tự Trọng',
    priceTier: '40_70k',
    priceDisplay: '40–60k/phần',
    rating: 4.5,
    thumbnailUrl: 'https://picsum.photos/seed/rest2/400/300',
    dishes: ['Phở bò', 'Phở gà'],
  },
  {
    id: 'rest-3',
    name: 'Quán Bún Bò Huế Đông Ba',
    address: '78 Pasteur, Q1',
    googleMapsUrl: 'https://maps.google.com/?q=Quán Bún Bò Huế Đông Ba 78 Pasteur',
    priceTier: '40_70k',
    priceDisplay: '40–55k/phần',
    rating: 4.1,
    thumbnailUrl: 'https://picsum.photos/seed/rest3/400/300',
    dishes: ['Bún bò Huế', 'Bún riêu'],
  },
  {
    id: 'rest-4',
    name: 'Quán D',
    address: '12 Hàm Nghi, Q1',
    googleMapsUrl: 'https://maps.google.com/?q=Quán D 12 Hàm Nghi',
    priceTier: '40_70k',
    priceDisplay: '40–65k/phần',
    rating: 4.0,
    thumbnailUrl: 'https://picsum.photos/seed/rest4/400/300',
    dishes: ['Phở bò', 'Bún riêu'],
  },
  {
    id: 'rest-5',
    name: 'Quán E',
    address: '200 Nguyễn Thái Bình, Q1',
    googleMapsUrl: 'https://maps.google.com/?q=Quán E 200 Nguyễn Thái Bình',
    priceTier: '40_70k',
    priceDisplay: '35–50k/phần',
    rating: 3.8,
    thumbnailUrl: null,
    dishes: ['Bún bò Huế'],
  },
];

// ─── Dishes ────────────────────────────────────────────────────────────────────

export const MOCK_DISHES = [
  {
    id: 'dish-1',
    name: 'Phở bò',
    category: 'Phở & Bún nước',
    profile: {
      soupy: 0.9,
      temperature: 0.9,
      heaviness: 0.1,
      flavor_intensity: 0.6,
      spicy: -0.3,
      texture_complexity: 0.4,
      time_required: 0.2,
      novelty: -0.9,
      healthy: 0.3,
      communal: -0.8,
    },
    version: 3,
    restaurantCount: 8,
    updatedAt: '2026-03-20T10:00:00Z',
    updatedBy: null,
  },
  {
    id: 'dish-2',
    name: 'Bún riêu',
    category: 'Phở & Bún nước',
    profile: {
      soupy: 0.8,
      temperature: 0.9,
      heaviness: 0.1,
      flavor_intensity: 0.7,
      spicy: 0.2,
      texture_complexity: 0.5,
      time_required: 0.2,
      novelty: -0.7,
      healthy: 0.2,
      communal: -0.7,
    },
    version: 2,
    restaurantCount: 6,
    updatedAt: '2026-03-18T10:00:00Z',
    updatedBy: null,
  },
  {
    id: 'dish-3',
    name: 'Bún bò Huế',
    category: 'Phở & Bún nước',
    profile: {
      soupy: 0.9,
      temperature: 0.9,
      heaviness: 0.4,
      flavor_intensity: 0.8,
      spicy: 0.5,
      texture_complexity: 0.5,
      time_required: 0.2,
      novelty: -0.5,
      healthy: 0.1,
      communal: -0.6,
    },
    version: 1,
    restaurantCount: 5,
    updatedAt: '2026-03-15T08:00:00Z',
    updatedBy: null,
  },
  {
    id: 'dish-4',
    name: 'Cơm tấm',
    category: 'Cơm',
    profile: {
      soupy: -0.9,
      temperature: 0.5,
      heaviness: 0.7,
      flavor_intensity: 0.7,
      spicy: -0.2,
      texture_complexity: 0.6,
      time_required: -0.5,
      novelty: -0.9,
      healthy: -0.2,
      communal: -0.9,
    },
    version: 5,
    restaurantCount: 12,
    updatedAt: '2026-03-21T10:00:00Z',
    updatedBy: null,
  },
  {
    id: 'dish-5',
    name: 'Bánh mì',
    category: 'Street food / Nhanh',
    profile: {
      soupy: -1.0,
      temperature: 0.5,
      heaviness: 0.4,
      flavor_intensity: 0.7,
      spicy: 0.0,
      texture_complexity: 0.8,
      time_required: -0.8,
      novelty: 0.2,
      healthy: -0.3,
      communal: 0.6,
    },
    version: 2,
    restaurantCount: 15,
    updatedAt: '2026-03-19T10:00:00Z',
    updatedBy: null,
  },
  {
    id: 'dish-6',
    name: 'Lẩu bò',
    category: 'Chia sẻ / Ngồi lâu',
    profile: {
      soupy: 0.9,
      temperature: 0.8,
      heaviness: 0.8,
      flavor_intensity: 0.9,
      spicy: 0.6,
      texture_complexity: 0.7,
      time_required: 0.6,
      novelty: 0.2,
      healthy: 0.0,
      communal: 0.9,
    },
    version: 4,
    restaurantCount: 4,
    updatedAt: '2026-03-17T10:00:00Z',
    updatedBy: null,
  },
  {
    id: 'dish-7',
    name: 'Gỏi cuốn',
    category: 'Healthy / Nhẹ',
    profile: {
      soupy: -0.9,
      temperature: -0.5,
      heaviness: -0.5,
      flavor_intensity: 0.3,
      spicy: 0.0,
      texture_complexity: 0.4,
      time_required: -0.6,
      novelty: 0.3,
      healthy: 0.8,
      communal: 0.5,
    },
    version: 1,
    restaurantCount: 7,
    updatedAt: '2026-03-15T08:00:00Z',
    updatedBy: null,
  },
  {
    id: 'dish-8',
    name: 'Bún chả Hà Nội',
    category: 'Phở & Bún nước',
    profile: {
      soupy: -0.5,
      temperature: 0.5,
      heaviness: 0.5,
      flavor_intensity: 0.8,
      spicy: 0.0,
      texture_complexity: 0.6,
      time_required: -0.3,
      novelty: -0.7,
      healthy: 0.1,
      communal: 0.7,
    },
    version: 3,
    restaurantCount: 9,
    updatedAt: '2026-03-20T10:00:00Z',
    updatedBy: null,
  },
  {
    id: 'dish-9',
    name: 'Mì Quảng',
    category: 'Mì & Miến',
    profile: {
      soupy: 0.6,
      temperature: 0.8,
      heaviness: 0.3,
      flavor_intensity: 0.8,
      spicy: 0.8,
      texture_complexity: 0.6,
      time_required: 0.1,
      novelty: 0.5,
      healthy: 0.1,
      communal: -0.5,
    },
    version: 2,
    restaurantCount: 3,
    updatedAt: '2026-03-16T10:00:00Z',
    updatedBy: null,
  },
  {
    id: 'dish-10',
    name: 'Cao lầu',
    category: 'Đặc sản vùng',
    profile: {
      soupy: -0.3,
      temperature: 0.6,
      heaviness: 0.5,
      flavor_intensity: 0.7,
      spicy: 0.2,
      texture_complexity: 0.7,
      time_required: -0.2,
      novelty: 0.8,
      healthy: -0.1,
      communal: -0.6,
    },
    version: 1,
    restaurantCount: 2,
    updatedAt: '2026-03-15T08:00:00Z',
    updatedBy: null,
  },
];

// ─── Binary Choices ────────────────────────────────────────────────────────────

export const BINARY_CHOICES = [
  { id: 'BC-1', optionA: 'Món nước', optionB: 'Món khô' },
  { id: 'BC-2', optionA: 'Nóng hổi', optionB: 'Mát/nguội' },
  { id: 'BC-3', optionA: 'Ăn nhẹ vừa bụng', optionB: 'No nê' },
  { id: 'BC-4', optionA: 'Mềm mịn', optionB: 'Dai giòn' },
  { id: 'BC-5', optionA: 'Thanh đạm', optionB: 'Đậm đà' },
  { id: 'BC-6', optionA: 'Không cay', optionB: 'Cay được' },
  { id: 'BC-7', optionA: 'Nhanh chóng', optionB: 'Thong thả ☕' },
  { id: 'BC-8', optionA: 'Quen thuộc', optionB: 'Khám phá' },
];

// ─── Mock Submissions ──────────────────────────────────────────────────────────

let MOCK_SUBMISSIONS = [
  {
    id: 'sub-1',
    restaurantName: 'Quán Cơm Bình Dân Nguyễn Trãi',
    address: '88 Nguyễn Trãi, Q1',
    googleMapsUrl: null,
    priceTier: 'duoi_40k',
    priceDisplay: '25–35k/phần',
    notes: 'Quán cơm bình dân ngon, gần trường học.',
    photos: [{ id: 'photo-1', url: 'https://picsum.photos/seed/sub1/400/300', displayOrder: 0 }],
    submittedBy: {
      userId: 'user-1',
      fullName: 'Nguyễn Văn Minh',
      email: 'minh@company.com',
    },
    status: 'pending',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    reviewedBy: null,
    reviewedAt: null,
  },
  {
    id: 'sub-2',
    restaurantName: 'Bún Bò Bà Tuyết',
    address: '33 Đề Thám, Q1',
    googleMapsUrl: 'https://maps.google.com/?q=Bún Bò Bà Tuyết 33 Đề Thám',
    priceTier: '40_70k',
    priceDisplay: '40–55k/phần',
    notes: 'Quán bún bò nổi tiếng, nước dùng đậm đà.',
    photos: [{ id: 'photo-2', url: 'https://picsum.photos/seed/sub2/400/300', displayOrder: 0 }],
    submittedBy: {
      userId: 'user-2',
      fullName: 'Trần Thị Lan',
      email: 'lan@company.com',
    },
    status: 'pending',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    reviewedBy: null,
    reviewedAt: null,
  },
  {
    id: 'sub-3',
    restaurantName: 'Phở Cuốn Hưng Vượng',
    address: '55 Lê Thánh Tôn, Q1',
    googleMapsUrl: 'https://maps.google.com/?q=Phở Cuốn Hưng Vượng 55 Lê Thánh Tôn',
    priceTier: '40_70k',
    priceDisplay: '45–65k/phần',
    notes: 'Phở cuốn đặc biệt, nhiều topping.',
    photos: [{ id: 'photo-3', url: 'https://picsum.photos/seed/sub3/400/300', displayOrder: 0 }],
    submittedBy: {
      userId: 'user-3',
      fullName: 'Lê Hoàng Hùng',
      email: 'hung@company.com',
    },
    status: 'approved',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    reviewedBy: 'admin@lunchsync.com',
    reviewedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

// ─── Helpers ───────────────────────────────────────────────────────────────────

function delay(value) {
  return new Promise((resolve) => setTimeout(() => resolve(value), 200 + Math.random() * 300));
}

function generatePin() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function uuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// ─── Mock Session State ────────────────────────────────────────────────────────

let mockSession = null;

// ─── Mock Handlers ────────────────────────────────────────────────────────────

export const mockHandlers = {

  // ── Auth ──────────────────────────────────────────────────────────────────

  login: (email, password) => {
    if (!email || !password) {
      return delay({ error: { code: 'VALIDATION_ERROR', message: 'Email và mật khẩu không được để trống.' } });
    }
    const fakeToken = 'mock-jwt-' + Date.now();
    const isAdmin = email.toLowerCase().includes('admin');
    const isHost = email.toLowerCase().includes('host');
    return delay({
      accessToken: fakeToken,
      expiresIn: 3600,
      userId: isAdmin ? 'admin-1' : 'user-1',
      email,
      fullName: email.split('@')[0].replace(/\./g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      role: isAdmin ? 'admin' : isHost ? 'host' : 'user',
    });
  },

  register: (email, password, fullName) => {
    if (!email || !password) {
      return delay({ error: { code: 'VALIDATION_ERROR', message: 'Email và mật khẩu không được để trống.' } });
    }
    const fakeToken = 'mock-jwt-' + Date.now();
    const newId = uuid();
    return delay({
      userId: newId,
      email,
      fullName: fullName || email.split('@')[0],
      role: 'host',
      message: 'Đăng ký thành công. Vui lòng xác nhận email nếu cần.',
    });
  },

  // ── Sessions ──────────────────────────────────────────────────────────────

  createSession: ({ collectionId, priceTier, nickname }) => {
    const pin = generatePin();
    const collection = MOCK_COLLECTIONS.find(c => c.id === collectionId) || MOCK_COLLECTIONS[0];
    const hostId = uuid();
    const hostParticipantId = uuid();
    const hostParticipant = {
      id: hostParticipantId,
      userId: hostId,
      nickname: nickname || 'Host',
      joinedAt: new Date().toISOString(),
      isHost: true,
    };
    mockSession = {
      id: uuid(),
      hostId,
      pin,
      collectionId,
      collectionName: collection.name,
      priceTier,
      priceDisplay: PRICE_TIERS.find(t => t.key === priceTier)?.priceDisplay || '40–70k/phần',
      status: 'waiting',
      participants: [hostParticipant],
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
      votingStartedAt: null,
      votedCount: 0,
      results: null,
      boom_eliminated_ids: null,
      final_restaurant_id: null,
    };
    return delay({
      sessionId: mockSession.id,
      pin,
      shareLink: `${window.location.origin}/join/${pin}`,
      status: 'waiting',
      collectionName: collection.name,
      participantId: hostParticipantId,
    });
  },

  getSessionInfo: (pin) => {
    if (!mockSession || mockSession.pin !== pin) {
      return delay({ error: { code: 'SESSION_NOT_FOUND', message: 'Không tìm thấy phiên với mã PIN này.' } });
    }
    const s = mockSession;
    const hostName = s.participants.find(p => p.isHost)?.nickname || 'Host';

    // ── Demo mode: inject extra mock participants into backend state so startSession validates correctly ──
    if (s.status === 'waiting' && s.participants.length < 8) {
      const extraParticipants = MOCK_EXTRA_PARTICIPANTS.slice(0, 8 - s.participants.length);
      s.participants = [...s.participants, ...extraParticipants];
    }

    const participantList = s.participants.map(({ userId, ...rest }) => ({
      ...rest,
      isHost: rest.isHost || false,
    }));

    return delay({
      sessionId: s.id,
      pin: s.pin,
      status: s.status,
      hostName,
      collectionName: s.collectionName,
      priceTier: s.priceTier,
      priceDisplay: s.priceDisplay,
      participants: participantList,
      participantCount: s.participants.length,
      createdAt: s.createdAt,
      expiresAt: s.expiresAt,
    });
  },

  joinSession: (pin, nickname) => {
    if (!mockSession || mockSession.pin !== pin) {
      return delay({ error: { code: 'SESSION_NOT_FOUND', message: 'Không tìm thấy phiên với mã PIN này.' } });
    }
    if (mockSession.status !== 'waiting') {
      return delay({ error: { code: 'VALIDATION_ERROR', message: 'Phiên không còn nhận người tham gia.' } });
    }
    if (mockSession.participants.length >= 8) {
      return delay({ error: { code: 'SESSION_FULL', message: 'Phiên đã đầy (8 người).' } });
    }
    if (mockSession.participants.some(p => p.nickname === nickname)) {
      return delay({ error: { code: 'NICKNAME_TAKEN', message: 'Nickname đã tồn tại trong phiên này.' } });
    }
    const participant = {
      id: uuid(),
      nickname,
      joinedAt: new Date().toISOString(),
    };
    mockSession.participants.push(participant);
    return delay({
      participantId: participant.id,
      sessionId: mockSession.id,
      nickname,
      participants: mockSession.participants.map(({ userId, ...rest }) => rest),
    });
  },

  startSession: (pin) => {
    if (!mockSession || mockSession.pin !== pin) {
      return delay({ error: { code: 'SESSION_NOT_FOUND', message: 'Không tìm thấy phiên với mã PIN này.' } });
    }
    if (mockSession.status !== 'waiting') {
      return delay({ error: { code: 'VALIDATION_ERROR', message: 'Phiên không ở trạng thái chờ.' } });
    }
    if (mockSession.participants.length < 3) {
      return delay({ error: { code: 'VALIDATION_ERROR', message: 'Cần tối thiểu 3 người để bắt đầu.' } });
    }
    mockSession.status = 'voting';
    mockSession.votingStartedAt = new Date().toISOString();
    return delay({
      status: 'voting',
      participantCount: mockSession.participants.length,
      votingStartedAt: mockSession.votingStartedAt,
      message: `Bắt đầu bỏ phiếu với ${mockSession.participants.length} người`,
    });
  },

  getStatus: (pin) => {
    if (!mockSession || mockSession.pin !== pin) {
      return delay({ error: { code: 'SESSION_NOT_FOUND', message: 'Không tìm thấy phiên với mã PIN này.' } });
    }
    return delay({
      status: mockSession.status || 'waiting',
      participantsJoined: mockSession.participants.length,
      participantsVoted: mockSession.votedCount || 0,
      votingStartedAt: mockSession.votingStartedAt || null,
    });
  },

  closeVoting: (pin) => {
    if (!mockSession || mockSession.pin !== pin) {
      return delay({ error: { code: 'SESSION_NOT_FOUND', message: 'Không tìm thấy phiên với mã PIN này.' } });
    }
    const votedCount = mockSession.votedCount || 0;
    if (votedCount < 1) {
      return delay({ error: { code: 'VALIDATION_ERROR', message: 'Cần ít nhất 1 người đã bỏ phiếu để chốt kết quả.' } });
    }
    mockSession.status = 'results';
    mockSession.results = buildResults();
    return delay({
      status: 'results',
      totalVoted: votedCount,
      totalParticipants: mockSession.participants.length,
      message: `Scoring với ${votedCount} người đã vote`,
    });
  },

  getChoices: (pin) => {
    return delay(BINARY_CHOICES);
  },

  submitVote: (pin, participantId, choices) => {
    if (!mockSession || mockSession.pin !== pin) {
      return delay({ error: { code: 'SESSION_NOT_FOUND', message: 'Không tìm thấy phiên với mã PIN này.' } });
    }
    if (mockSession.status !== 'voting') {
      return delay({ error: { code: 'VALIDATION_ERROR', message: 'Phiên không còn trong trạng thái bình chọn.' } });
    }
    const prevVoted = mockSession.votedCount || 0;
    mockSession.votedCount = prevVoted + 1;

    const total = mockSession.participants.length;
    const currentVoted = mockSession.votedCount;

    if (currentVoted >= 1) {
      mockSession.status = 'results';
      mockSession.results = buildResults();
    }

    return delay({ status: 'voted', totalVoted: currentVoted, totalParticipants: total });
  },

  getResults: (pin) => {
    if (!mockSession || mockSession.pin !== pin) {
      return delay({ error: { code: 'SESSION_NOT_FOUND', message: 'Không tìm thấy phiên với mã PIN này.' } });
    }
    const results = mockSession.results || buildResults();
    const restaurants = results.topRestaurants.map(r => {
      const eliminated = mockSession.boom_eliminated_ids || [];
      return {
        ...r,
        eliminated: eliminated.includes(r.id),
      };
    });

    let eliminated = [];
    let remaining = [];
    if (mockSession.boom_eliminated_ids && mockSession.boom_eliminated_ids.length > 0) {
      eliminated = results.topRestaurants
        .filter(r => mockSession.boom_eliminated_ids.includes(r.id))
        .map(r => ({ id: r.id, name: r.name, rank: r.rank }));
      remaining = results.topRestaurants
        .filter(r => !mockSession.boom_eliminated_ids.includes(r.id))
        .map(r => ({ ...r }));
    }

    let finalRestaurant = null;
    if (mockSession.final_restaurant_id) {
      const found = MOCK_RESTAURANTS.find(r => r.id === mockSession.final_restaurant_id) || results.topRestaurants[0];
      finalRestaurant = { ...found };
    }

    return delay({
      topDishes: results.topDishes,
      topRestaurants: results.topRestaurants.map(r => ({ ...r })),
      eliminated,
      remaining,
      finalRestaurant,
      status: mockSession.status,
      boomedAt: mockSession.boomed_at || null,
    });
  },

  boom: (pin) => {
    if (!mockSession || mockSession.pin !== pin) {
      return delay({ error: { code: 'SESSION_NOT_FOUND', message: 'Không tìm thấy phiên với mã PIN này.' } });
    }
    if (mockSession.status !== 'results') {
      return delay({ error: { code: 'VALIDATION_ERROR', message: 'Phiên chưa ở trạng thái kết quả.' } });
    }
    mockSession.status = 'picking';
    const restaurants = mockSession.results?.topRestaurants || [];
    // Randomly eliminate 2 (use rank 4 and 5)
    const elim = restaurants.slice(3, 5).map(r => ({ id: r.id, name: r.name, rank: r.rank }));
    const rem = restaurants.slice(0, 3).map(r => ({ ...r }));
    mockSession.boom_eliminated_ids = elim.map(e => e.id);
    mockSession.boomed_at = new Date().toISOString();
    return delay({
      eliminated: elim,
      remaining: rem,
    });
  },

  pick: (pin, restaurantId) => {
    if (!mockSession || mockSession.pin !== pin) {
      return delay({ error: { code: 'SESSION_NOT_FOUND', message: 'Không tìm thấy phiên với mã PIN này.' } });
    }
    if (mockSession.status !== 'picking') {
      return delay({ error: { code: 'VALIDATION_ERROR', message: 'Phiên chưa ở trạng thái chọn quán.' } });
    }
    const elimIds = mockSession.boom_eliminated_ids || [];
    const remaining = mockSession.results?.topRestaurants?.filter(r => !elimIds.includes(r.id)) || [];
    if (!remaining.find(r => r.id === restaurantId)) {
      return delay({ error: { code: 'VALIDATION_ERROR', message: 'ID quán không hợp lệ.' } });
    }
    const restaurant = MOCK_RESTAURANTS.find(r => r.id === restaurantId) || remaining[0];
    mockSession.status = 'done';
    mockSession.final_restaurant_id = restaurantId;
    return delay({
      finalRestaurant: { ...restaurant },
      status: 'done',
    });
  },

  cancelSession: (pin) => {
    if (!mockSession || mockSession.pin !== pin) {
      return delay({ error: { code: 'SESSION_NOT_FOUND', message: 'Không tìm thấy phiên với mã PIN này.' } });
    }
    mockSession = null;
    return delay({ success: true });
  },

  // ── Collections ────────────────────────────────────────────────────────────

  getCollections: () => {
    return delay(MOCK_COLLECTIONS);
  },

  getCollectionById: (id) => {
    const col = MOCK_COLLECTIONS.find(c => c.id === id);
    if (!col) {
      return delay({ error: { code: 'NOT_FOUND', message: 'Không tìm thấy collection.' } });
    }
    const restaurants = MOCK_RESTAURANTS.map(r => ({
      id: r.id,
      name: r.name,
      address: r.address,
      priceTier: r.priceTier,
      priceDisplay: r.priceDisplay,
      rating: r.rating,
      thumbnailUrl: r.thumbnailUrl,
      dishes: r.dishes,
    }));
    return delay({
      ...col,
      landmarkLat: 10.7717,
      landmarkLng: 106.7043,
      restaurants,
      restaurantCount: restaurants.length,
    });
  },

  // ── Crowdsource ────────────────────────────────────────────────────────────

  submitSuggestion: (data) => {
    const submission = {
      id: uuid(),
      restaurantName: data.restaurantName,
      address: data.address,
      googleMapsUrl: data.googleMapsUrl || null,
      priceTier: data.priceTier,
      priceDisplay: data.priceDisplay || PRICE_TIERS.find(t => t.key === data.priceTier)?.priceDisplay || '',
      notes: data.notes || '',
      photoUrls: data.photoUrls || [],
      dishIds: data.dishIds || [],
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    MOCK_SUBMISSIONS.unshift({
      ...submission,
      submittedBy: {
        userId: 'user-1',
        fullName: 'Người dùng',
        email: 'user@company.com',
      },
      photos: submission.photoUrls.map((url, i) => ({ id: `photo-${i}`, url, displayOrder: i })),
      reviewedBy: null,
      reviewedAt: null,
    });
    return delay({
      submissionId: submission.id,
      status: 'pending',
      restaurantName: submission.restaurantName,
      message: 'Cảm ơn bạn! Đề xuất sẽ được admin duyệt sớm.',
      createdAt: submission.createdAt,
    });
  },

  searchRestaurants: (query) => {
    if (!query || query.trim().length < 2) {
      return delay([]);
    }
    const q = query.toLowerCase().trim();
    const matches = MOCK_RESTAURANTS.filter(r => {
      const nameMatch = r.name.toLowerCase().includes(q);
      const addrMatch = r.address.toLowerCase().includes(q);
      return nameMatch || addrMatch;
    }).map(r => ({
      id: r.id,
      name: r.name,
      address: r.address,
      priceDisplay: r.priceDisplay,
      rating: r.rating,
      thumbnailUrl: r.thumbnailUrl,
      upvotes: r.upvotes || 0,
    }));
    return delay(matches);
  },

  upvoteRestaurant: (restaurantId) => {
    const restaurant = MOCK_RESTAURANTS.find(r => r.id === restaurantId);
    if (!restaurant) return delay({ error: { code: 'NOT_FOUND', message: 'Không tìm thấy quán.' } });
    restaurant.upvotes = (restaurant.upvotes || 0) + 1;
    return delay({ success: true, upvotes: restaurant.upvotes });
  },

  // ── Admin: Submissions ──────────────────────────────────────────────────────

  getSubmissions: ({ status = 'pending', page = 1, pageSize = 20 } = {}) => {
    const filtered = MOCK_SUBMISSIONS.filter(s => status === 'all' || s.status === status);
    const totalItems = filtered.length;
    const totalPages = Math.ceil(totalItems / pageSize);
    const start = (page - 1) * pageSize;
    const items = filtered.slice(start, start + pageSize);
    return delay({
      submissions: items,
      pagination: {
        page,
        pageSize,
        totalItems,
        totalPages,
      },
    });
  },

  reviewSubmission: (id, body) => {
    const sub = MOCK_SUBMISSIONS.find(s => s.id === id);
    if (!sub) return delay({ error: { code: 'NOT_FOUND', message: 'Không tìm thấy submission.' } });
    const { action, collectionIds, notes } = body;
    sub.status = action === 'approved' ? 'approved' : 'rejected';
    sub.reviewedBy = 'admin@lunchsync.com';
    sub.reviewedAt = new Date().toISOString();

    if (action === 'approved') {
      return delay({
        submissionId: id,
        status: 'approved',
        restaurantCreated: {
          id: uuid(),
          name: sub.restaurantName,
          source: 'crowdsource',
        },
        addedToCollections: collectionIds || [],
        reviewedBy: sub.reviewedBy,
        reviewedAt: sub.reviewedAt,
        message: 'Đã duyệt và tạo restaurant + gắn collection',
      });
    }
    return delay({
      submissionId: id,
      status: 'rejected',
      restaurantCreated: null,
      addedToCollections: [],
      reviewedBy: sub.reviewedBy,
      reviewedAt: sub.reviewedAt,
      message: 'Đã từ chối đề xuất',
    });
  },

  // ── Admin: Dishes ──────────────────────────────────────────────────────────

  getDishes: ({ search = '', category = '', page = 1, pageSize = 50 } = {}) => {
    let filtered = [...MOCK_DISHES];
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(d => d.name.toLowerCase().includes(q) || d.category.toLowerCase().includes(q));
    }
    if (category) {
      filtered = filtered.filter(d => d.category === category);
    }
    const categories = [...new Set(MOCK_DISHES.map(d => d.category))].sort();
    const totalItems = filtered.length;
    const totalPages = Math.ceil(totalItems / pageSize);
    const start = (page - 1) * pageSize;
    const items = filtered.slice(start, start + pageSize);
    return delay({
      dishes: items,
      pagination: {
        page,
        pageSize,
        totalItems,
        totalPages,
      },
      categories,
    });
  },

  getDishById: (id) => {
    const dish = MOCK_DISHES.find(d => d.id === id);
    if (!dish) return delay({ error: { code: 'NOT_FOUND', message: 'Không tìm thấy món.' } });
    const restaurants = MOCK_RESTAURANTS
      .filter(r => r.dishes?.includes(dish.name))
      .map(r => ({
        id: r.id,
        name: r.name,
        address: r.address,
        priceTier: r.priceTier,
        collections: ['Quanh Bitexco - Nguyễn Huệ'],
      }));
    return delay({
      ...dish,
      restaurants,
      restaurantCount: restaurants.length,
      createdAt: '2026-03-15T08:00:00Z',
    });
  },

  updateDishProfile: (id, profile) => {
    const dish = MOCK_DISHES.find(d => d.id === id);
    if (!dish) return delay({ error: { code: 'NOT_FOUND', message: 'Không tìm thấy món.' } });
    const oldProfile = dish.profile || {};
    const diff = Object.keys(profile).map(key => {
      const oldVal = oldProfile[key] ?? 0;
      const newVal = profile[key];
      return { dimension: key, oldValue: oldVal, newValue: newVal, delta: newVal - oldVal };
    }).filter(d => d.delta !== 0);
    const newVersion = (dish.version || 1) + 1;
    dish.profile = profile;
    dish.version = newVersion;
    dish.updatedAt = new Date().toISOString();
    return delay({
      dish: { id, name: dish.name, version: newVersion },
      diff,
      message: `Đã cập nhật ${diff.length} dimensions, cache updated`,
    });
  },

  uploadDishes: (dishes) => {
    const details = { added: [], updated: [], unchanged: [], errors: [] };
    dishes.forEach(d => {
      const existing = MOCK_DISHES.find(x => x.name.toLowerCase() === d.name.toLowerCase());
      if (existing) {
        const oldProfile = existing.profile || {};
        const changed = Object.keys(d.profile || {}).some(k => d.profile[k] !== oldProfile[k]);
        if (changed) {
          Object.assign(existing, d, { version: (existing.version || 1) + 1 });
          details.updated.push({ name: d.name, changes: [] });
        } else {
          details.unchanged.push(d.name);
        }
      } else {
        MOCK_DISHES.push({ ...d, id: uuid(), version: 1 });
        details.added.push(d.name);
      }
    });
    return delay({
      summary: {
        added: details.added.length,
        updated: details.updated.length,
        unchanged: details.unchanged.length,
        errors: 0,
        totalInDb: MOCK_DISHES.length,
      },
      details,
      cacheReloadedAt: new Date().toISOString(),
    });
  },

  exportDishes: () => {
    return delay({
      exportedAt: new Date().toISOString(),
      totalDishes: MOCK_DISHES.length,
      dishes: MOCK_DISHES.map(({ id, profile, version, ...rest }) => ({
        ...rest,
        profile: profile || {},
        version: version || 1,
      })),
    });
  },

  reloadDishCache: () => {
    return delay({
      reloadedAt: new Date().toISOString(),
      dishCount: MOCK_DISHES.length,
      cacheSizeBytes: 14820,
      message: 'Cache reloaded thành công',
    });
  },
};

// ─── Build Results Helper ──────────────────────────────────────────────────────

function buildResults() {
  return {
    topDishes: [
      { id: 'dish-2', name: 'Bún riêu', category: 'Phở & Bún nước', score: 0.85, rank: 1 },
      { id: 'dish-1', name: 'Phở bò', category: 'Phở & Bún nước', score: 0.72, rank: 2 },
      { id: 'dish-3', name: 'Bún bò Huế', category: 'Phở & Bún nước', score: 0.68, rank: 3 },
    ],
    topRestaurants: MOCK_RESTAURANTS.map((r, i) => ({
      ...r,
      score: 0.82 - i * 0.04,
      rank: i + 1,
    })),
  };
}
