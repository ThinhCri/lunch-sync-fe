---
name: LunchSync Frontend Plan
overview: Lên kế hoạch chi tiết xây dựng LunchSync Frontend - ứng dụng web mobile-first giúp nhóm văn phòng chọn món ăn trưa qua cơ chế Binary Choice Voting. Dùng mock data tạm thời, chuẩn bị kiến trúc cho BE sau.
todos:
  - id: phase-1-foundation
    content: "Foundation: dependencies (react-router-dom, axios, antd, framer-motion, zustand, canvas-confetti), vite.config.js, index.html, folder structure, CSS variables, breakpoints, safe-area, SessionContext, ErrorBoundary, AsyncBoundary, constants, error utils, reconnect utils, mock data, API client (axios + interceptors), stores"
    status: pending
  - id: phase-2-auth
    content: "Auth Flow: HomePage, LoginPage (optimistic redirect), RegisterPage, authStore, useAuth (restoreSession)"
    status: pending
  - id: phase-3-session
    content: "Session Flow: CreateSessionPage, JoinPage (restore session + optimistic redirect), LobbyPage (timeout countdown + reconnect + cancel), WaitingRoomPage (reconnect), sessionStore"
    status: pending
  - id: phase-4-voting
    content: "Voting Flow: VotingPage (optimistic UI + resume vote + reconnect), VotingWaitPage, votingStore, useVoting hook"
    status: pending
  - id: phase-5-results
    content: "Results: ResultsPage, BoomPage (T+2s sync, public route, framer-motion animation)"
    status: pending
  - id: phase-6-boom-done
    content: "Boom + Done: BoomPage, DonePage (canvas-confetti + Google Maps + Share API)"
    status: pending
  - id: phase-7-admin
    content: "Crowdsource + Admin: CrowdsourcePage, SubmissionsPage, DishManagementPage (cache reload)"
    status: pending
  - id: phase-8-polish
    content: "Polish: Error boundaries, AsyncBoundary, responsive 375px, reconnect utils, session history auto-fill, mobile UX (safe area, haptic)"
    status: pending
isProject: false
---

## LunchSync Frontend - Kế hoạch Chi tiết

---

## 1. Thiết lập Foundation (Ngày 1)

### 1.1 Cài đặt dependencies mới

Thêm các package cần thiết vào `package.json`:

```bash
npm install react-router-dom axios antd @ant-design/icons framer-motion zustand canvas-confetti
```


| Package               | Mục đích                                |
| --------------------- | --------------------------------------- |
| `react-router-dom` v7 | Routing cho 13+ screens                 |
| `axios`               | HTTP client (chuẩn bị cho BE)           |
| `antd`                | UI component library (đã có trong spec) |
| `@ant-design/icons`   | Icons cho Ant Design                    |
| `framer-motion`       | Animation (Boom, celebration)           |
| `zustand`             | Lightweight state management            |
| `canvas-confetti`     | Confetti animation trên Done screen     |


### 1.2 Cập nhật Vite config

File: `vite.config.js`

```js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
});
```

### 1.2b Cập nhật index.html

File: `index.html` (trong root project)

```html
<!doctype html>
<html lang="vi">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover, maximum-scale=1.0, user-scalable=no" />
    <meta name="theme-color" content="#6C63FF" />
    <meta name="description" content="LunchSync — Giúp nhóm chọn bữa trưa trong 3 phút" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
    <title>LunchSync</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

- `viewport-fit=cover`: hỗ trợ notch / dynamic island trên iPhone
- `user-scalable=no`: ngăn zoom khi tap input (mobile-first UX)
- `lang="vi"`: khai báo ngôn ngữ tiếng Việt

### 1.3 Constants

File: `src/utils/constants.js`

```js
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
```

> **Lưu ý**: BINARY_CHOICES được lấy từ API `GET /sessions/{pin}/choices`. API trả về 8 câu (id + optionA + optionB), **KHÔNG có impact vectors** — logic tính vector nằm hoàn toàn ở BE. Client chỉ gửi string `choices: 'ABAABBBA'` (8 ký tự 'A'/'B') khi submit vote.

### 1.3 Tái cấu trúc thư mục src

```
src/
├── api/                    # API service layer (axios wrapper + mock)
│   ├── client.js           # Axios instance với interceptors
│   ├── auth.js             # /auth endpoints
│   ├── sessions.js         # /sessions endpoints
│   ├── collections.js     # GET /collections, /collections/{id}
│   ├── admin.js           # Admin endpoints (submissions review, dish CRUD, cache reload)
│   └── mock.js            # Mock data + mock API handlers (session expiry, reconnect)
│
├── components/             # Reusable UI components
│   ├── common/            # Shared components
│   │   ├── AppHeader.jsx  # Sticky header với PIN badge + participant count
│   │   ├── PinBadge.jsx   # Hiển thị 6-digit PIN
│   │   ├── ParticipantCount.jsx
│   │   ├── LoadingSpinner.jsx
│   │   ├── ResultCard.jsx
│   │   ├── RestaurantCard.jsx
│   │   ├── DishCard.jsx
│   │   ├── PriceTierPicker.jsx
│   │   ├── EmptyState.jsx       # Empty state cho từng page
│   │   ├── SessionTimer.jsx     # Countdown timer cho session expiry
│   │   ├── PINInput.jsx         # 6 ô nhập PIN (Ant Design OTP)
│   │   ├── ErrorBoundary.jsx  # Global error boundary
│   │   └── AsyncBoundary.jsx  # Suspense + skeleton wrapper
│   └── voting/           # Voting-specific components
│       ├── BinaryChoiceCard.jsx
│       ├── VoteTimer.jsx
│       └── VotingProgress.jsx
│
├── contexts/               # React Contexts
│   └── SessionContext.jsx  # App-wide session state (pin, participantId, isHost, status)
│
├── pages/                  # Route-level pages
│   ├── HomePage.jsx       # Landing: Login / Tạo bữa trưa
│   ├── LoginPage.jsx      # Host đăng nhập (optimistic redirect)
│   ├── RegisterPage.jsx   # Host đăng ký
│   ├── CreateSessionPage.jsx  # Chọn Collection + Trần giá
│   ├── LobbyPage.jsx      # Waiting room (host view) — countdown timer, cancel
│   ├── JoinPage.jsx       # Nhập PIN → nhập Nickname (restore session)
│   ├── WaitingRoomPage.jsx # Waiting room (participant view) — reconnect
│   ├── VotingPage.jsx     # 8 Binary Choice cards + timer (optimistic UI + resume)
│   ├── VotingWaitPage.jsx # Chờ người khác vote
│   ├── ResultsPage.jsx    # Top 3 dishes + Top 5 restaurants
│   ├── BoomPage.jsx       # Boom animation → 3 quán còn lại (T+2s sync)
│   ├── DonePage.jsx       # Celebration + Google Maps
│   ├── CrowdsourcePage.jsx # Form đề xuất quán mới
│   └── admin/              # Admin pages
│       ├── SubmissionsPage.jsx
│       └── DishManagementPage.jsx
│
├── store/                  # Zustand stores
│   ├── authStore.js       # Host auth state (JWT, user info)
│   ├── sessionStore.js     # Current session state (PIN, participants, status)
│   └── votingStore.js      # Voting state (answers, timer)
│
├── hooks/                  # Custom React hooks
│   ├── useSession.js      # Poll /sessions/{pin}/status + reconnect
│   ├── useVoting.js       # Voting logic + timer
│   ├── useAuth.js         # Auth helpers (restoreSession)
│   ├── useCountdown.js    # Reusable countdown timer
│   └── useReconnect.js    # Visibility change → polling re-sync
│
├── utils/                  # Utility functions
│   ├── constants.js       # SESSION_STATUS, PRICE_TIERS, TIMER_DURATION, MIN/MAX_PARTICIPANTS, BINARY_CHOICES_IDS
│   ├── storage.js         # localStorage helpers
│   ├── format.js          # Vietnamese formatting
│   ├── error.js           # API error → Vietnamese message parser
│   ├── reconnect.js       # Visibility change polling re-sync
│   └── scoring.js         # Client-side scoring logic (mock)
│
├── styles/                # Global styles
│   ├── variables.css      # CSS custom properties (colors, spacing, breakpoints)
│   ├── global.css         # Global resets + typography
│   └── animations.css     # Keyframe animations
│
├── App.jsx                 # Router setup + SessionContext provider
├── main.jsx               # Entry point
└── mockData.js           # Mock collections, restaurants, dishes
```

### 1.4 Thiết lập CSS Foundation

File: `src/styles/variables.css` — CSS custom properties:

```css
:root {
  /* Brand colors */
  --color-primary: #6C63FF;
  --color-primary-light: #8B85FF;
  --color-primary-dark: #4A42E0;
  --color-accent: #FF6B6B;
  --color-success: #51CF66;
  --color-warning: #FFD43B;
  --color-danger: #FF6B6B;

  /* Neutrals */
  --color-bg: #FAFAFA;
  --color-surface: #FFFFFF;
  --color-border: #E9ECEF;
  --color-text-primary: #212529;
  --color-text-secondary: #6C757D;
  --color-text-muted: #ADB5BD;

  /* Dark mode overrides */
  --color-bg-dark: #121212;
  --color-surface-dark: #1E1E1E;
  --color-text-primary-dark: #F8F9FA;

  /* Spacing (8px grid) */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-8: 32px;
  --space-10: 40px;
  --space-12: 48px;

  /* Typography */
  --font-family: 'Inter', -apple-system, sans-serif;
  --font-size-xs: 12px;
  --font-size-sm: 14px;
  --font-size-base: 16px;
  --font-size-lg: 18px;
  --font-size-xl: 20px;
  --font-size-2xl: 24px;
  --font-size-3xl: 28px;
  --font-size-4xl: 32px;

  /* Border radius */
  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 16px;
  --radius-xl: 20px;
  --radius-full: 9999px;

  /* Shadows */
  --shadow-sm: 0 1px 3px rgba(0,0,0,0.08);
  --shadow-md: 0 4px 12px rgba(0,0,0,0.10);
  --shadow-lg: 0 8px 24px rgba(0,0,0,0.12);
  --shadow-glow: 0 0 20px rgba(108,99,255,0.3);

  /* Animation */
  --transition-fast: 150ms ease;
  --transition-base: 250ms ease;
  --transition-slow: 400ms ease;

  /* Mobile-first breakpoints */
  --bp-sm: 375px;
  --bp-md: 768px;
  --bp-lg: 1024px;

  /* Safe area (iPhone notch / dynamic island) */
  --safe-area-inset-top: env(safe-area-inset-top, 0px);
  --safe-area-inset-bottom: env(safe-area-inset-bottom, 0px);
  --safe-area-inset-left: env(safe-area-inset-left, 0px);
  --safe-area-inset-right: env(safe-area-inset-right, 0px);
}

### 1.5 Mock Data Foundation

File: `src/mockData.js` — Tạo mock data phong phú:

```js
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
  { id: 'dish-1', name: 'Phở bò', category: 'Phở & Bún nước', profile: { soupy: 0.9, temperature: 0.95, heaviness: 0.4, flavor_intensity: 0.7, spicy: 0.1, texture_complexity: 0.5, time_required: 0.3, novelty: -0.8, healthy: 0.5, communal: 0.3 } },
  { id: 'dish-2', name: 'Bún riêu', category: 'Phở & Bún nước', profile: { soupy: 0.85, temperature: 0.9, heaviness: 0.5, flavor_intensity: 0.8, spicy: 0.3, texture_complexity: 0.6, time_required: 0.3, novelty: -0.7, healthy: 0.4, communal: 0.3 } },
  { id: 'dish-3', name: 'Bún bò Huế', category: 'Phở & Bún nước', profile: { soupy: 0.9, temperature: 0.9, heaviness: 0.7, flavor_intensity: 0.9, spicy: 0.7, texture_complexity: 0.5, time_required: 0.3, novelty: -0.5, healthy: 0.3, communal: 0.3 } },
  { id: 'dish-4', name: 'Cơm tấm', category: 'Cơm', profile: { soupy: -0.8, temperature: 0.6, heaviness: 0.6, flavor_intensity: 0.6, spicy: 0.2, texture_complexity: 0.4, time_required: 0.2, novelty: -0.6, healthy: 0.5, communal: -0.3 } },
  { id: 'dish-5', name: 'Bánh mì', category: 'Ăn nhanh', profile: { soupy: -0.9, temperature: 0.5, heaviness: 0.3, flavor_intensity: 0.7, spicy: 0.1, texture_complexity: 0.5, time_required: 0.05, novelty: -0.9, healthy: 0.2, communal: -0.5 } },
  { id: 'dish-6', name: 'Lẩu bò', category: 'Lẩu', profile: { soupy: 0.95, temperature: 0.95, heaviness: 0.8, flavor_intensity: 0.9, spicy: 0.6, texture_complexity: 0.8, time_required: 0.8, novelty: 0.3, healthy: 0.3, communal: 0.95 } },
  { id: 'dish-7', name: 'Gỏi cuốn', category: 'Món cuốn', profile: { soupy: -0.9, temperature: 0.2, heaviness: 0.1, flavor_intensity: 0.5, spicy: 0.1, texture_complexity: 0.4, time_required: 0.1, novelty: 0.2, healthy: 0.9, communal: 0.5 } },
  { id: 'dish-8', name: 'Bún chả Hà Nội', category: 'Phở & Bún nước', profile: { soupy: 0.3, temperature: 0.6, heaviness: 0.5, flavor_intensity: 0.7, spicy: 0.0, texture_complexity: 0.5, time_required: 0.2, novelty: -0.7, healthy: 0.4, communal: 0.6 } },
  { id: 'dish-9', name: 'Mì Quảng', category: 'Mì & Miến', profile: { soupy: 0.7, temperature: 0.85, heaviness: 0.5, flavor_intensity: 0.8, spicy: 0.4, texture_complexity: 0.6, time_required: 0.25, novelty: 0.1, healthy: 0.4, communal: 0.3 } },
  { id: 'dish-10', name: 'Cao lầu', category: 'Mì & Miến', profile: { soupy: 0.2, temperature: 0.5, heaviness: 0.6, flavor_intensity: 0.7, spicy: 0.2, texture_complexity: 0.7, time_required: 0.2, novelty: 0.5, healthy: 0.3, communal: 0.1 } },
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
```

### 1.6 API Client (axios interceptors)

File: `src/api/client.js`

```js
import axios from 'axios';
import { useAuthStore } from '@/store/authStore';
import { message } from 'antd';
import { parseApiError } from '@/utils/error';

const client = axios.create({
  baseURL: '/api',
  timeout: 10000,
});

// Request interceptor: gắn JWT từ authStore
client.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: xử lý 401 → logout, 5xx → retry 1 lần
let isRetrying = false;
client.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // 401 Unauthorized → logout
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      useAuthStore.getState().logout();
      message.error('Phiên đăng nhập hết hạn, vui lòng đăng nhập lại.');
      window.location.href = '/login';
      return Promise.reject(error);
    }

    // 5xx → retry 1 lần
    if (error.response?.status >= 500 && !originalRequest._retry && !isRetrying) {
      originalRequest._retry = true;
      isRetrying = true;
      try {
        const res = await client.request(originalRequest);
        isRetrying = false;
        return res;
      } catch (e) {
        isRetrying = false;
        return Promise.reject(parseApiError(e));
      }
    }

    return Promise.reject(parseApiError(error));
  }
);

export default client;
```

### 1.7 SessionContext

File: `src/contexts/SessionContext.jsx`

```jsx
// App-wide context chứa { pin, participantId, isHost, status }
// Tránh prop drilling giữa 13+ pages
// participantId được restore từ localStorage khi user quay lại bằng share link

import { createContext, useContext, useEffect } from 'react';
import { sessionStore } from '@/store/sessionStore';

const SessionContext = createContext(null);

export function SessionProvider({ children }) {
  // Restore session từ localStorage khi app mount
  useEffect(() => {
    const saved = localStorage.getItem('lunchsync-session');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        sessionStore.getState().restore(parsed);
      } catch {}
    }
  }, []);

  // Persist session khi store thay đổi
  useEffect(() => {
    const unsub = sessionStore.subscribe((state) => {
      localStorage.setItem('lunchsync-session', JSON.stringify({
        pin: state.pin,
        participantId: state.participantId,
        isHost: state.isHost,
      }));
    });
    return unsub;
  }, []);

  return (
    <SessionContext.Provider value={sessionStore}>
      {children}
    </SessionContext.Provider>
  );
}

export const useSessionContext = () => useContext(SessionContext);
```

### 1.8 Error Utilities

File: `src/utils/error.js`

```js
// Error factory: parse API error → Vietnamese message + error code

const ERROR_CODE_MAP = {
  SESSION_NOT_FOUND: 'Không tìm thấy phiên với mã PIN này.',
  SESSION_EXPIRED: 'Phiên đã hết hạn. Vui lòng tạo phiên mới.',
  SESSION_FULL: 'Phiên đã đầy (8 người).',
  NICKNAME_TAKEN: 'Nickname đã tồn tại trong phiên này.',
  VOTING_CLOSED: 'Voting đã đóng.',
  UNAUTHORIZED: 'Bạn không có quyền thực hiện thao tác này.',
  VALIDATION_ERROR: 'Dữ liệu không hợp lệ.',
};

export function parseApiError(error) {
  const code = error?.response?.data?.error?.code;
  const message = error?.response?.data?.error?.message;
  const details = error?.response?.data?.error?.details;

  return {
    code: code || 'UNKNOWN',
    message: message || ERROR_CODE_MAP[code] || 'Đã xảy ra lỗi. Vui lòng thử lại.',
    details: details || null,
  };
}
```

### 1.9 Reconnect Utilities

File: `src/utils/reconnect.js`

```js
// Re-sync polling khi tab quay lại foreground
// Gọi callback khi visibilitychange → visible

export function onVisibilityChange(callback) {
  const handler = () => {
    if (document.visibilityState === 'visible') {
      callback();
    }
  };
  document.addEventListener('visibilitychange', handler);
  return () => document.removeEventListener('visibilitychange', handler);
}

// Polling với exponential backoff khi lỗi
export function createPoller(fn, { interval = 3000, maxRetries = 3 } = {}) {
  let timer = null;
  let retries = 0;

  const poll = async () => {
    try {
      await fn();
      retries = 0;
    } catch (err) {
      retries++;
      if (retries >= maxRetries) {
        console.warn('Polling stopped after max retries');
        return;
      }
    }
    timer = setTimeout(poll, interval);
  };

  return {
    start: () => { if (!timer) poll(); },
    stop: () => { clearTimeout(timer); timer = null; },
  };
}
```

### 1.10 ErrorBoundary & AsyncBoundary

File: `src/components/common/ErrorBoundary.jsx`

```jsx
import { Component } from 'react';
import { Button, Result } from 'antd';

export class ErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Result
          status="error"
          title="Đã xảy ra lỗi"
          subTitle="Vui lòng tải lại trang để tiếp tục."
          extra={<Button type="primary" onClick={() => window.location.reload()}>Tải lại</Button>}
        />
      );
    }
    return this.props.children;
  }
}
```

File: `src/components/common/AsyncBoundary.jsx`

```jsx
import { Suspense } from 'react';
import { Spin } from 'antd';

// Suspense + skeleton loading wrapper cho async components
export function AsyncBoundary({ children, fallback }) {
  return (
    <Suspense fallback={fallback || <Spin size="large" style={{ display: 'block', textAlign: 'center', marginTop: 48 }} />}>
      {children}
    </Suspense>
  );
}
```

### 1.11 API Mock Layer

File: `src/api/mock.js` — Triển khai mock handlers với session expiry và reconnect:

```js
// Mock session state
let mockSession = null;
let sessionExpiryTimer = null;

// Mock handlers trả về Promise để simulate network delay (200–500ms)
export const mockHandlers = {
  createSession: (data) => {
    mockSession = { ...data, status: 'waiting', participants: [], createdAt: Date.now() };
    // Session expires sau 15 phút nếu không ai join
    sessionExpiryTimer = setTimeout(() => {
      mockSession = null;
    }, 15 * 60 * 1000);
    return delay({ sessionId, pin, ... });
  },

  joinSession: (pin, nickname) => {
    // Restore participantId từ localStorage (reconnect flow)
    const saved = localStorage.getItem('lunchsync-session');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.pin === pin) {
        return delay({ participantId: parsed.participantId, nickname, participants: mockSession?.participants });
      }
    }
    return delay({ participantId, nickname, participants: mockSession?.participants });
  },

  getChoices: () => delay(BINARY_CHOICES),

  submitVote: (pin, participantId, choices) => delay({ status: 'voted' }),

  getStatus: (pin) => delay({
    status: mockSession?.status || 'waiting',
    participantsJoined: mockSession?.participants?.length || 0,
    participantsVoted: mockSession?.participantsVoted || 0,
  }),

  getResults: (pin) => delay({ topDishes, topRestaurants, boomTriggeredAt, ... }),

  boom: (pin) => delay({ boomTriggeredAt: new Date().toISOString(), eliminated, remaining }),

  pick: (pin, restaurantId) => delay({ finalRestaurant, status: 'done' }),
};

// Simulate network delay 200–500ms
function delay(value) {
  return new Promise((resolve) => setTimeout(() => resolve(value), 200 + Math.random() * 300));
}
```

### 1.12 Zustand Stores

File: `src/store/authStore.js`:

```js
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      isAuthenticated: () => !!get().token,
      login: (token, user) => set({ token, user }),
      logout: () => set({ token: null, user: null }),
      // Khôi phục session từ localStorage, kiểm tra token hết hạn
      restoreSession: () => {
        const { token, exp } = get();
        if (token && exp && Date.now() > exp * 1000) {
          get().logout();
          return false;
        }
        return !!token;
      },
    }),
    { name: 'lunchsync-auth' }
  )
);
```

File: `src/store/sessionStore.js` — Quản lý toàn bộ session state (PIN, participants, status, results).

File: `src/store/votingStore.js` — Quản lý voting state (answers array, timer, current question index, submitted flag).

---

## 2. Authentication Flow (Ngày 1–2)

### 2.1 HomePage (`/`)

- Hero section với app name "LunchSync" + tagline
- 2 CTA lớn: **"Tạo bữa trưa"** (→ CreateSession, cần login) và **"Tham gia"** (→ Join)
- Nếu đã login → CTA "Tạo bữa trưa" sẽ redirect thẳng sang CreateSession

### 2.2 LoginPage (`/login`)

- Form: Email + Password (Ant Design Form)
- Nút "Đăng nhập với Google" (placeholder)
- Link "Chưa có tài khoản? Đăng ký"
- **Optimistic redirect**: Redirect thẳng sang `/create` ngay khi submit thay vì chờ API response. Nếu API fail → hiện lỗi + rollback.
- Mock: Login thành công → lưu JWT fake vào authStore → redirect `/create`

### 2.3 RegisterPage (`/register`)

- Form: Email + Password + Confirm Password
- Validation: email format, password min 6 chars
- Mock: Đăng ký thành công → auto login → redirect `/create`

### 2.4 Auth Hook

`useAuth()` hook trả về: `{ isAuthenticated, user, login, logout, token, restoreSession }`

`restoreSession()`: kiểm tra token trong localStorage — nếu hết hạn thì auto-logout, nếu còn valid thì restore. Gọi trong `App.jsx` khi app mount.

---

## 3. Session Creation Flow (Ngày 2)

### 3.1 CreateSessionPage (`/create`)

- Bước 1: Chọn Collection — search/pick từ danh sách (Ant Design Select hoặc Card list)
- Bước 2: Chọn Trần giá — 4 preset buttons: `Dưới 40k` | `40–70k` | `70–120k` | `Trên 120k`
- Nút "Tạo bữa trưa" → POST /sessions → nhận PIN → redirect `/lobby/{pin}`
- Khi tạo xong → hiển thị PIN (6 số lớn) + Share Link button (copy to clipboard)
- Host có thể Cancel session

### 3.2 Session Store

```js
{
  pin: '482951',
  collectionId: 'col-1',
  collectionName: 'Quanh Bitexco - Nguyễn Huệ',
  priceTier: '40_70k',
  status: 'waiting', // waiting | voting | results | picking | done
  participants: [{ nickname: 'Minh', joinedAt: '...' }],
  isHost: true,
}
```

---

## 4. Join Flow (Ngày 2)

### 4.1 JoinPage (`/join/:pin?`)

- Nếu có `pin` param → auto-fill → bước tiếp theo
- Nếu không → input 6 ô để nhập PIN (Ant Design Input OTP)
- Validate: 6 chữ số
- Bước tiếp: Nhập Nickname (2–12 ký tự, Ant Design Input)
- **Restore session**: Kiểm tra `localStorage` — nếu đã có `participantId` với cùng PIN → auto-redirect `/waiting/{pin}` mà không cần join lại
- **Optimistic redirect**: Redirect sang `/waiting/{pin}` ngay khi submit, không chờ API
- Nút "Vào bàn" → POST /sessions/{pin}/join
- Xử lý lỗi: "Không tìm thấy phiên" (`SESSION_NOT_FOUND`), "Nickname đã tồn tại" (`NICKNAME_TAKEN`), "Phiên đã đầy" (`SESSION_FULL`)
- Success → redirect `/waiting/{pin}`

---

## 5. Waiting Room / Lobby (Ngày 2)

### 5.1 LobbyPage Host (`/lobby/:pin`)

- Hiển thị PIN lớn (sticky)
- Participant count badge: "3/8 người"
- Danh sách participants đã join (avatar placeholder với initial)
- **Nút "Bắt đầu"** — disabled nếu dưới 3 người
- Cảnh báo "Cần tối thiểu 3 người để bắt đầu"
- **Session countdown timer**: Hiển thị thời gian còn lại trước khi session expire (15 phút tính từ lúc tạo). Khi còn < 2 phút → warning banner màu cam. Khi hết → redirect `/` + thông báo "Phiên đã hết hạn."
- Auto-poll: GET /sessions/{pin}/status mỗi 3s để cập nhật participants
- **Nút Cancel**: Hủy session (DELETE /sessions/{pin} hoặc mock cancel) → redirect `/`
- **Reconnect**: Khi tab quay lại foreground (`useReconnect`) → gọi lại GET /status để sync

### 5.2 WaitingRoomPage Participant (`/waiting/:pin`)

- Tương tự Lobby nhưng:
  - Không có nút "Bắt đầu"
  - Hiển thị "Đang chờ host bắt đầu..."
  - Loading animation
- Auto-poll: GET /sessions/{pin}/status → khi status = 'voting' → redirect `/vote/{pin}`
- **Reconnect**: `useReconnect` hook → khi tab quay lại foreground → gọi lại GET /status để sync

---

## 6. Binary Choice Voting (Ngày 2–3)

### 6.1 VotingPage (`/vote/:pin`)

**UI chính:**

- Progress indicator: "Câu 3/8"
- Timer circular countdown: 15s countdown animation (Ant Design Countdown hoặc custom)
- Binary Choice Card: 2 options hiển thị dạng **2 nút lớn chiếm full width**
- Tap A hoặc B → auto-advance → card tiếp theo
- Progress bar bottom

**Animation:**

- Card swipe animation (framer-motion `AnimatePresence`)
- Progress dot animation

**Logic:**

- `useVoting` hook: quản lý answers array, currentIndex, timer
- **Optimistic UI**: Ngay khi tap A/B → highlight selected + haptic feedback (`navigator.vibrate(10)`) → advance next card. Không chờ API.
- **Resume vote**: Khi mount, kiểm tra `votingStore` — nếu đã có answers trong session này (reload/tab close) → restore và tiếp tục từ câu đang dở
- Submit khi hoàn thành câu 8: POST /sessions/{pin}/vote với body `{ participantId, choices: 'ABAABBBA' }` (string 8 ký tự, mỗi ký tự 'A' hoặc 'B') — gửi background sau optimistic update
- Xử lý hết giờ 15s: auto-select option A
- Submit xong → redirect `/voting-wait/{pin}`
- **Reconnect**: `useReconnect` → nếu tab mất focus rồi quay lại → re-sync status

**Out of MVP (ghi chú):**
- **Skip**: Không hỗ trợ skip trong MVP. Người dùng bắt buộc chọn A hoặc B.
- **Real-time status**: Không hiển thị "X/6 đã vote" trong quá trình voting. Chỉ hiển thị ở VotingWaitPage.

### 6.2 VotingWaitPage (`/voting-wait/:pin`)

- Hiển thị "Đã hoàn thành! Đang chờ {n} người khác..."
- Icon checkmark animation (framer-motion)
- Auto-poll: GET /sessions/{pin}/status mỗi 3s → khi status = 'results' → redirect `/results/{pin}`
- **Reconnect**: `useReconnect` → khi tab quay lại foreground → gọi lại GET /status

---

## 7. Results Page (Ngày 3)

### 7.1 ResultsPage (`/results/:pin`)

**Top 3 Dishes Section:**

- 3 DishCards xếp theo thứ tự rank (1, 2, 3)
- Mỗi card: Tên món + icon/emoji + match score (thanh hoặc %)
- **Reveal animation**: Staggered entrance (framer-motion)
- 3 cards xuất hiện lần lượt với delay 400ms

**Top 5 Restaurants Section:**

- 5 RestaurantCards xếp theo score
- Mỗi card: Tên + khoảng giá (`priceDisplay`) + rating + thumbnail + "Phục vụ: X, Y" (món overlap highlighted)
- Món overlap highlight (bold)

**Host-only actions:**

- **Nút "Boom 🔥"** — POST /sessions/{pin}/boom → redirect `/boom/{pin}`
- **Nút "Chốt kết quả"** — POST /sessions/{pin}/close-voting → force trigger scoring (khi ≥1 người đã vote, host muốn kết thúc sớm hoặc hết 90s timeout)

**All participants:**
- Hiển thị "Đang chờ kết quả..." khi chưa có results
- Khi `status === 'picking'`: redirect `/boom/{pin}`
- Khi `status === 'done'`: redirect `/done/{pin}`

### 7.2 Client-side Scoring Logic

Khi BE chưa ready, triển khai client-side mock scoring:

```js
// src/utils/scoring.js
export function computeMockResults(choices, dishes, restaurants) {
  // Tính individual vector từ 8 binary choices
  // Aggregate → group vector  
  // Score dishes: dot product với group vector
  // Filter restaurants by priceTier
  // Return top 3 dishes + top 5 restaurants
}
```

---

## 8. Boom Animation (Ngày 3)

### 8.1 BoomPage (`/boom/:pin`)

> **Lưu ý route**: BoomPage là **route công khai** — tất cả participants trong session đều xem boom animation, không phải `RequireAuth`.

**Trigger (host):** POST /sessions/{pin}/boom → nhận `boomTriggeredAt` → broadcast `boomTriggeredAt` cho tất cả client

**Boom animation T+2s sync (framer-motion):**

1. **T+0s**: Screen khóa, 5 quán đang hiển thị
2. **T+2s**: Boom! 2 quán bị loại — animation fly out + fade
3. **T+2.5s**: 3 quán còn lại được highlight
4. **T+3s**: Prompt "Chọn chốt 1 quán" hoặc auto-pick top 1

**Sync mechanism:**
- Host trigger boom → POST /boom → nhận `boomTriggeredAt` (timestamp server)
- Các client poll GET /results → thấy `boomTriggeredAt` ≠ null → tính `delay = boomTriggeredAt + 2000ms - Date.now()` → chờ đúng thời điểm rồi bắt đầu animation
- framer-motion: cards bay ra → 3 quán còn lại scale up
- Fire/explosion particle effect (framer-motion `AnimatePresence`)

**Visual:**

- Screen chia làm 5 slots
- 2 slots "eliminated" → slide ra ngoài + grayout
- 3 slots còn lại → scale up nhẹ

**State:** `{ status: 'picking', boomTriggeredAt, eliminated: [...], remaining: [...] }`

**MVP vs Non-MVP:**
- **MVP**: Auto-pick top ranked restaurant → auto POST /sessions/{pin}/pick → redirect `/done/{pin}`
- **Non-MVP** (ghi chú): Host chọn từ 3 remaining → POST /sessions/{pin}/pick

### 8.2 Pick Logic (MVP)

Sau khi boom animation hoàn tất (T+3s):
- Auto-select top ranked restaurant (rank = 1)
- POST /sessions/{pin}/pick với `restaurantId` của top 1
- Redirect `/done/{pin}`
- Cleanup: xóa session khỏi localStorage

---

## 9. Done Page (Ngày 3)

### 9.1 DonePage (`/done/:pin`)

**Celebration screen:**

- **Confetti animation**: Dùng `canvas-confetti` — bắn confetti khi page mount (1 lần duy nhất). Màu sắc matching brand colors (#6C63FF, #FF6B6B, #FFD43B).
- "Chốt rồi!" heading với animation (framer-motion scale + fade)
- Restaurant card: Tên + Address + Price + Rating + Photo
- **Nút "Chỉ đường"** → deep link Google Maps: `https://www.google.com/maps/dir/?api=1&destination=...` hoặc `comgooglemaps://`
- **Nút "Share kết quả"** → Web Share API (`navigator.share`) nếu supported, fallback copy link to clipboard
- **Nút "Làm lại"** → xóa session khỏi localStorage → redirect `/`
- Cleanup: Auto-close session (gọi cleanup nếu chưa done trên server)

---

## 10. Crowdsource Flow (Ngày 4)

### 10.1 CrowdsourcePage (`/suggest`)

- Form đề xuất quán mới:
  - Tên quán (required)
  - Địa chỉ (required)
  - Collection dropdown
  - Price tier
  - Món nổi bật (tags/input)
  - Ảnh (optional, URL)
- Submit → POST /submissions
- Success feedback + link về Home

---

## 11. Admin Pages (Ngày 4)

### 11.1 SubmissionsPage (`/admin/submissions`)

- Table danh sách submissions đang chờ review (Ant Design Table)
- Mỗi row: Tên quán + Địa chỉ + Ngày gửi + Actions (Approve/Reject)
- Approve → POST /admin/submissions/{id}/review → { status: 'approved' }

### 11.2 DishManagementPage (`/admin/dishes`)

- Table toàn bộ dishes trong pool (Ant Design Table với pagination)
- Click row → Drawer hiển thị dish profile (10 dimensions displayed as bars)
- Edit form → PUT /admin/dishes/{id}/profile
- Bulk upload button → Upload JSON → POST /admin/dishes/upload
- Export button → GET /admin/dishes/export → download JSON
- **Nút "Reload Cache"** → POST /admin/dishes/cache/reload → thông báo "Cache đã được cập nhật"

---

## 12. Routing & App Shell (Ngày 1)

### 12.1 Router Setup

```jsx
// App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { SessionProvider } from './contexts/SessionContext';
import { ErrorBoundary } from './components/common/ErrorBoundary';

// Protected route wrapper
function RequireAuth({ children }) {
  const isAuth = useAuthStore(s => !!s.token);
  return isAuth ? children : <Navigate to="/login" />;
}

function App() {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <ConfigProvider theme={{ token: { colorPrimary: '#6C63FF' } }}>
          <SessionProvider>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/join" element={<JoinPage />} />
              <Route path="/join/:pin" element={<JoinPage />} />
              <Route path="/suggest" element={<CrowdsourcePage />} />

              <Route path="/create" element={<RequireAuth><CreateSessionPage /></RequireAuth>} />
              <Route path="/lobby/:pin" element={<RequireAuth><LobbyPage /></RequireAuth>} />
              <Route path="/waiting/:pin" element={<WaitingRoomPage />} />
              <Route path="/vote/:pin" element={<VotingPage />} />
              <Route path="/voting-wait/:pin" element={<VotingWaitPage />} />
              <Route path="/results/:pin" element={<ResultsPage />} />
              {/* BoomPage là PUBLIC — tất cả participants đều xem */}
              <Route path="/boom/:pin" element={<BoomPage />} />
              <Route path="/done/:pin" element={<DonePage />} />

              <Route path="/admin/submissions" element={<RequireAuth><SubmissionsPage /></RequireAuth>} />
              <Route path="/admin/dishes" element={<RequireAuth><DishManagementPage /></RequireAuth>} />
            </Routes>
          </SessionProvider>
        </ConfigProvider>
      </ErrorBoundary>
    </BrowserRouter>
  );
}
```

### 12.3 Ant Design Config

```jsx
<ConfigProvider
  theme={{
    token: {
      colorPrimary: '#6C63FF',
      borderRadius: 10,
      fontFamily: "'Inter', sans-serif",
    },
    components: {
      Button: { controlHeight: 48 }, // Big tap targets (≥48px)
      Input: { controlHeight: 48 },
    },
  }}
>
```

### 12.4 App Entry — Restore Session

```jsx
import { createRoot } from 'react-dom/client';
import './styles/variables.css';
import './styles/global.css';
import App from './App.jsx';
import { useAuthStore } from './store/authStore';

// Restore auth session (kiểm tra token hết hạn)
useAuthStore.getState().restoreSession?.();

createRoot(document.getElementById('root')).render(<App />);
```

### 12.2 Ant Design Config

File: `src/App.jsx` (ConfigProvider được nhúng trong App component):

```jsx
<ConfigProvider
  theme={{
    token: {
      colorPrimary: '#6C63FF',
      borderRadius: 10,
      fontFamily: "'Inter', sans-serif",
    },
    components: {
      Button: { controlHeight: 48 }, // Big tap targets (≥48px)
      Input: { controlHeight: 48 },
    },
  }}
>
```

---

## 13. Error Handling & Polish (Ngày 4)

**Error Boundaries:**
- `ErrorBoundary.jsx` bọc toàn bộ app (trong `App.jsx`)
- `AsyncBoundary.jsx` wrap từng page cho async data

**API Error Handling:**
- Ant Design `message`/`notification` cho feedback
- `src/utils/error.js` parse API errors → Vietnamese messages

**Loading & Empty States:**
- Loading skeletons cho async states (Ant Design Skeleton)
- Empty states cho từng page: empty voting, no participants, no results

**Responsive & Mobile UX:**
- Mobile-first: base 375px, responsive up qua `--bp-sm`, `--bp-md`, `--bp-lg`
- Safe area: `padding-top: var(--safe-area-inset-top)` cho sticky headers
- Bottom-aligned CTAs: các nút chính luôn ở cuối màn hình, không bị che bởi keyboard hoặc navigation bar
- Big tap targets: tất cả nút tối thiểu 48px chiều cao (Ant Design `controlHeight: 48`)
- Haptic feedback: `navigator.vibrate(10)` khi tap vote option

**Session Persistence:**
- Host session history: lưu vào `localStorage` (collection + priceTier gần nhất) → auto-fill khi vào CreateSession
- Participant reconnect: `participantId` + `pin` lưu trong localStorage → restore khi quay lại bằng share link

**Reconnect:**
- `useReconnect.js` hook: lắng nghe `visibilitychange` event → gọi polling lại khi tab quay lại foreground
- Áp dụng cho: VotingPage, VotingWaitPage, WaitingRoomPage

**Session Auto-Cleanup:**
- Khi session status = 'done': xóa session khỏi localStorage
- Khi session expired: redirect về home + thông báo

---

## Thứ tự triển khai đề xuất


| Giai đoạn   | Công việc                                                                      | Ước tính |
| ----------- | ------------------------------------------------------------------------------ | -------- |
| **Phase 1** | Foundation: structure, CSS (breakpoints, safe-area), mock data, API client (axios interceptors), SessionContext, ErrorBoundary, constants, error utils, reconnect utils, stores, routing | 3–4h     |
| **Phase 2** | Auth: Login (optimistic), Register, Home, useAuth (restoreSession)            | 2–3h     |
| **Phase 3** | Session: Create, Lobby (timeout countdown + reconnect), Join (restore + optimistic), WaitingRoom | 2–3h     |
| **Phase 4** | Voting: Binary Choice cards, Timer, Optimistic UI, Resume vote, Submit        | 3–4h     |
| **Phase 5** | Results: Top 3 dishes, Top 5 restaurants, BoomPage (T+2s sync, public route)  | 2–3h     |
| **Phase 6** | Boom + Done: Boom animation, canvas-confetti, Google Maps, Share API           | 2–3h     |
| **Phase 7** | Admin: Submissions review, Dish management (cache reload)                      | 2–3h     |
| **Phase 8** | Polish: Error states, responsive 375px, reconnect utils, session history       | 1–2h     |


**Tổng ước tính: ~15–20 giờ** (chia 2–3 ngày hợp lý)


---

## Các file cần tạo mới

| File | Mô tả |
| ---- | ------ |
| `vite.config.js` | Path alias `@/` + proxy `/api` → localhost:3000 |
| `index.html` | Viewport meta (viewport-fit=cover), font preconnect, title |
| `src/contexts/SessionContext.jsx` | App-wide session state |
| `src/utils/constants.js` | SessionStatus, PriceTiers, TimerDuration, Min/MaxParticipants |
| `src/utils/error.js` | API error → Vietnamese message parser |
| `src/utils/reconnect.js` | Visibility change polling re-sync |
| `src/components/common/ErrorBoundary.jsx` | Global error boundary |
| `src/components/common/AsyncBoundary.jsx` | Suspense + skeleton wrapper |
| `src/api/client.js` | Axios instance + interceptors |
| `src/store/authStore.js` | (cập nhật) thêm restoreSession |
| `src/store/votingStore.js` | (cập nhật) thêm submitted flag |