BASE: /api

AUTH 
POST   /auth/register               Host đăng ký
POST   /auth/login                  Host đăng nhập → JWT

SESSIONS 
POST   /sessions                    Tạo session                    [Auth: Host]
GET    /sessions/{pin}              Lấy session info                [Public]
POST   /sessions/{pin}/join         Join session                    [Public]
POST   /sessions/{pin}/start        Bắt đầu voting                 [Auth: Host]
GET    /sessions/{pin}/status       Poll trạng thái                 [Public]
POST   /sessions/{pin}/close-voting Chốt voting (force)           [Auth: Host]

VOTING 
GET    /sessions/{pin}/choices      Lấy 8 binary choices (text)     [Public]
POST   /sessions/{pin}/vote         Submit choices string            [Public]
GET    /sessions/{pin}/results      Lấy kết quả                     [Public]

PICK 
POST   /sessions/{pin}/boom         Trigger boom                    [Auth: Host]
POST   /sessions/{pin}/pick         Chốt quán                       [Auth: Host]

COLLECTIONS 
GET    /collections                 Danh sách collections           [Public]
GET    /collections/{id}            Chi tiết + restaurants           [Public]

CROWDSOURCE 
POST   /submissions                 Đề xuất quán mới                [Auth: User]

ADMIN: SUBMISSIONS 
GET    /admin/submissions                    Review queue           [Auth: Admin]
POST   /admin/submissions/{id}/review        Approve/Reject        [Auth: Admin]

ADMIN: DISH MANAGEMENT 
GET    /admin/dishes                                         List all dishes        [Auth: Admin]
GET    /admin/dishes/{id}                                    Dish detail + profile  [Auth: Admin]
PUT    /admin/dishes/{id}/profile                            Sửa 1 dish profile    [Auth: Admin]
POST   /admin/dishes/upload                                  Bulk JSON upload       [Auth: Admin]
GET    /admin/dishes/export                                  Export dish pool JSON  [Auth: Admin]
POST   /admin/dishes/cache/reload                            Force cache reload     [Auth: Admin]


6.2 Key Request/Response Examples

── AUTH ─────────────────────────────────────────────────────────────────
POST /auth/register
JSON
// Request [Public]
{
  "email": "minh@company.com",
  "password": "Str0ng!Pass",
  "fullName": "Nguyễn Văn Minh"
}
// Response 201
{
  "userId": "uuid",
  "email": "minh@company.com",
  "fullName": "Nguyễn Văn Minh",
  "role": "host",
  "message": "Đăng ký thành công. Vui lòng xác nhận email nếu cần."
}
// Flow: validate → Cognito SignUp → create User row (role=host) → response
// Password rules: min 8 chars, 1 uppercase, 1 number, 1 special (Cognito default)

POST /auth/login
JSON
// Request [Public]
{
  "email": "minh@company.com",
  "password": "Str0ng!Pass"
}
// Response 200
{
  "accessToken": "eyJhbGciOi...",
  "expiresIn": 3600,
  "userId": "uuid",
  "email": "minh@company.com",
  "fullName": "Nguyễn Văn Minh",
  "role": "host"
}
// Flow: Cognito InitiateAuth → return JWT
// Client stores accessToken in memory, userId in localStorage
// All [Auth] endpoints require header: Authorization: Bearer <accessToken>


── SESSIONS ─────────────────────────────────────────────────────────────
POST /sessions
JSON
// Request [Auth: Host JWT]
{
  "collectionId": "uuid",
  "priceTier": "40_70k",
  "nickname": "Minh"
}
// 2–12 ký tự, host tự chọn nickname

// Response 201
{
  "sessionId": "uuid",
  "pin": "482951",
  "shareLink": "https://app.example.com/join/482951",
  "status": "waiting",
  "collectionName": "Quanh Bitexco - Nguyễn Huệ",
  "participantId": "uuid"
}
// Host's participant record — dùng để vote

// Server-side flow:
// 1. Validate input + JWT
// 2. Create session row (host_id = caller's userId)
// 3. Create participant row:
//      session_id = session.id
//      user_id    = caller's userId   // linked to account
//      nickname   = request.nickname
// 4. Return response including participantId
// Client stores participantId — dùng cho POST /vote sau này


GET /sessions/{pin}
JSON
// Response 200 [Public]
{
  "sessionId": "uuid",
  "pin": "482951",
  "status": "waiting",
  "hostName": "Nguyễn Văn Minh",
  "collectionName": "Quanh Bitexco - Nguyễn Huệ",
  "priceTier": "40_70k",
  "priceDisplay": "40–70k/phần",
  "participants": [
    { "nickname": "Minh", "joinedAt": "2026-03-25T11:58:00Z", "isHost": true },
    { "nickname": "Lan", "joinedAt": "2026-03-25T11:59:00Z", "isHost": false },
    { "nickname": "Hùng", "joinedAt": "2026-03-25T12:00:10Z", "isHost": false }
  ],
  "participantCount": 3,
  "createdAt": "2026-03-25T11:57:00Z",
  "expiresAt": "2026-03-25T12:12:00Z"
}
// Dùng cho: Waiting room hiển thị lobby info
// Participants list KHÔNG bao gồm pref_vector (internal)
// isHost computation (server-side):
//   isHost = (participant.user_id IS NOT NULL)
//            AND (participant.user_id = session.host_id)
// Guest participants luôn có isHost = false (user_id = NULL)


POST /sessions/{pin}/join
JSON
// Request [Public]
{ "nickname": "Minh" }
// Response 200
{
  "participantId": "uuid",
  "sessionId": "uuid",
  "nickname": "Minh",
  "participants": [
    { "nickname": "Minh", "joinedAt": "2026-03-25T12:00:00Z" },
    { "nickname": "Lan", "joinedAt": "2026-03-25T11:58:00Z" }
  ]
}
// Client stores participantId in localStorage (Spoofing risk. MVP acceptable)


POST /sessions/{pin}/start
JSON
// Request [Auth: Host JWT]
{}
// Response 200
{
  "status": "voting",
  "participantCount": 5,
  "votingStartedAt": "2026-03-25T12:01:00Z",
  "message": "Bắt đầu bỏ phiếu với 5 người"
}
// Validations:
// - Caller must be host of this session
// - Session status must be 'waiting'
// - participantCount >= 3 AND <= 8
// Side effects:
// - Session status → 'voting'
// - votingStartedAt set to NOW()
// - No more joins allowed after this point
// - 120s auto-close timer starts (server-side check on poll/vote)


GET /sessions/{pin}/status
JSON
// Response 200 [Public]
{
  "status": "voting",
  "participantsJoined": 6,
  "participantsVoted": 4,
  "votingStartedAt": "2026-03-25T12:01:00Z"
}
// votingStartedAt: dùng cho client-side voting timeout display
// Polling interval: client gọi mỗi 3 giây
// Client logic on status transition:
//    waiting → hiển thị lobby, enable "Start" cho host khi ≥3
//    waiting → voting:   GET /choices → hiển thị voting UI
//    voting → results:   GET /results → hiển thị top dishes + restaurants
//    results → picking:  GET /results → play boom animation → hiển thị remaining 3
//    picking → done:     GET /results → celebration screen


POST /sessions/{pin}/close-voting
JSON
// Request [Auth: Host JWT]
{}
// Response 200
{
  "status": "results",
  "totalVoted": 4,
  "totalParticipants": 6,
  "message": "Scoring với 4 người đã vote"
}
// Trigger: Host bấm "Chốt kết quả" hoặc 120s timeout
// Behavior: Aggregate chỉ participants WHERE voted_at IS NOT NULL
// Requires: ≥ 1 participant đã vote


── VOTING ───────────────────────────────────────────────────────────────
GET /sessions/{pin}/choices
JSON
// Response 200 [Public]
// Source: C# code constants, KHÔNG query DB
// KHÔNG trả impact vectors — client không cần biết algorithm
[
  { "id": "BC-1", "optionA": "Món nước", "optionB": "Món khô" },
  { "id": "BC-2", "optionA": "Nóng hổi", "optionB": "Mát/nguội" },
  { "id": "BC-3", "optionA": "Ăn nhẹ vừa bụng", "optionB": "No nê" },
  { "id": "BC-4", "optionA": "Mềm mịn", "optionB": "Dai giòn" },
  { "id": "BC-5", "optionA": "Thanh đạm", "optionB": "Đậm đà" },
  { "id": "BC-6", "optionA": "Không cay", "optionB": "Cay được" },
  { "id": "BC-7", "optionA": "Nhanh chóng", "optionB": "Thong thả ☕" },
  { "id": "BC-8", "optionA": "Quen thuộc", "optionB": "Khám phá" }
]


POST /sessions/{pin}/vote
JSON
// Request [Public — participantId from join response]
{
  "participantId": "uuid",
  "choices": "ABAABBBA"
}
// choices: string, exactly 8 characters, each 'A' or 'B'
// Order matches BC-1 through BC-8

// Response 200
{
  "status": "voted",
  "totalVoted": 4,
  "totalParticipants": 6
}
// Server-side flow (invisible to client):
// 1. Validate: length=8, chars ∈ {A,B}, session=voting, not already voted
// 2. Compute individual vector using code-constant impact vectors
// 3. Store vector as JSONB array on participants.pref_vector
// 4. If all voted → trigger scoring pipeline inline → status=results
// 5. Raw choices string "ABAABBBA" DISCARDED after computation


GET /sessions/{pin}/results
JSON
// Response 200 (available when status ∈ {results, picking, done})
{
  "topDishes": [
    { "id": "uuid", "name": "Bún riêu", "category": "Phở & Bún nước", "score": 0.85, "rank": 1 },
    { "id": "uuid", "name": "Phở bò", "category": "Phở & Bún nước", "score": 0.72, "rank": 2 },
    { "id": "uuid", "name": "Bún bò Huế", "category": "Phở & Bún nước", "score": 0.68, "rank": 3 }
  ],
  "topRestaurants": [
    {
      "id": "uuid",
      "name": "Bún riêu Hà Nội",
      "address": "123 Nguyễn Huệ, Q1",
      "googleMapsUrl": "https://maps.google.com/...",
      "priceTier": "40_70k",
      "priceDisplay": "35–55k/phần",
      "rating": 4.3,
      "thumbnailUrl": "https://cdn.../thumb.jpg",
      "matchedDishes": ["Bún riêu"],
      "score": 0.82,
      "rank": 1
    },
    {
      "id": "uuid",
      "name": "Phở Thìn",
      "address": "45 Lý Tự Trọng, Q1",
      "googleMapsUrl": "https://maps.google.com/...",
      "priceTier": "40_70k",
      "priceDisplay": "45–60k/phần",
      "rating": 4.5,
      "thumbnailUrl": "https://cdn.../thumb2.jpg",
      "matchedDishes": ["Phở bò"],
      "score": 0.78,
      "rank": 2
    },
    {
      "id": "uuid",
      "name": "Quán Bún Bò Huế Đông Ba",
      "address": "78 Pasteur, Q1",
      "googleMapsUrl": "https://maps.google.com/...",
      "priceTier": "40_70k",
      "priceDisplay": "40–55k/phần",
      "rating": 4.1,
      "thumbnailUrl": null,
      "matchedDishes": ["Bún bò Huế", "Bún riêu"],
      "score": 0.75,
      "rank": 3
    },
    {
      "id": "uuid",
      "name": "Quán D",
      "address": "12 Hàm Nghi, Q1",
      "googleMapsUrl": "https://maps.google.com/...",
      "priceTier": "40_70k",
      "priceDisplay": "40–65k/phần",
      "rating": 4.0,
      "thumbnailUrl": "https://cdn.../thumb4.jpg",
      "matchedDishes": ["Phở bò", "Bún riêu"],
      "score": 0.71,
      "rank": 4
    },
    {
      "id": "uuid",
      "name": "Quán E",
      "address": "200 Nguyễn Thái Bình, Q1",
      "googleMapsUrl": "https://maps.google.com/...",
      "priceTier": "40_70k",
      "priceDisplay": "35–50k/phần",
      "rating": 3.8,
      "thumbnailUrl": null,
      "matchedDishes": ["Bún bò Huế"],
      "score": 0.65,
      "rank": 5
    }
  ],
  "eliminated": [],
  "remaining": [],
  "finalRestaurant": null
}
// Client dùng 1 endpoint này cho cả results/picking/done screens
// Render theo status + populated fields
//
// Khi status=results:
//    eliminated = [], remaining = [], finalRestaurant = null
//    → Hiển thị full top 5, host thấy nút Boom
//
// Khi status=picking (sau boom):
//    eliminated = [{ id, name, rank }, { id, name, rank }]
//    remaining = [{ full restaurant object }, ...]
//    → Client so sánh eliminated IDs với restaurant cards đang hiển thị
//    → Play targeted animation loại 2 cards → hiển thị remaining 3
//
// Khi status=done (sau pick):
//    finalRestaurant = { full restaurant object }
//    → Celebration screen + Google Maps link


── PICK ─────────────────────────────────────────────────────────────────
POST /sessions/{pin}/boom
JSON
// Request [Auth: Host JWT]
{}
// Response 200
{
  "eliminated": [
    { "id": "uuid", "name": "Quán D", "rank": 4 },
    { "id": "uuid", "name": "Quán E", "rank": 5 }
  ],
  "remaining": [
    { "id": "uuid", "name": "Bún riêu Hà Nội", "rank": 1 },
    { "id": "uuid", "name": "Phở Thìn", "rank": 2 },
    { "id": "uuid", "name": "Quán Bún Bò Huế Đông Ba", "rank": 3 }
  ]
}
// Other clients poll → detect status='picking' → play boom animation immediately
// Validations:
// - Session status must be 'results'
// - Caller must be host
// Side effects:
// - Random pick 2 from top 5 to eliminate
// - Store boom_eliminated_ids on session
// - Session status → 'picking'
//
// Host UX: receives response instantly → play targeted animation
// Participant UX: detect via poll → GET /results → play targeted animation


POST /sessions/{pin}/pick
JSON
// Request [Auth: Host JWT]
{ "restaurantId": "uuid" }
// Response 200
{
  "finalRestaurant": {
    "id": "uuid",
    "name": "Bún riêu Hà Nội",
    "address": "123 Nguyễn Huệ, Q1",
    "googleMapsUrl": "https://maps.google.com/...",
    "priceDisplay": "35–55k/phần",
    "rating": 4.3,
    "thumbnailUrl": "https://cdn.../thumb.jpg"
  },
  "status": "done"
}
// Validations:
// - Session status must be 'picking'
// - restaurantId must be one of the 3 remaining (not eliminated)
// - Caller must be host
// Side effects:
// - Store final_restaurant_id on session
// - Session status → 'done'


── COLLECTIONS ──────────────────────────────────────────────────────────
GET /collections
JSON
// Response 200 [Public]
{
  "collections": [
    {
      "id": "uuid",
      "name": "Quanh Bitexco - Nguyễn Huệ",
      "description": "Khu vực Nguyễn Huệ, Hồ Tùng Mậu, Hàm Nghi — trung tâm Q1",
      "restaurantCount": 32,
      "coverageRadiusMeters": 250,
      "status": "active"
    },
    {
      "id": "uuid",
      "name": "Quanh Vincom Đồng Khởi",
      "description": "Khu Đồng Khởi, Lê Thánh Tôn, Lý Tự Trọng",
      "restaurantCount": 28,
      "coverageRadiusMeters": 250,
      "status": "active"
    },
    {
      "id": "uuid",
      "name": "Quanh Landmark 81",
      "description": "Khu vực Vinhomes Central Park, Bình Thạnh",
      "restaurantCount": 25,
      "coverageRadiusMeters": 250,
      "status": "active"
    }
  ]
}
// Chỉ trả collections có status='active'
// restaurantCount: count restaurants có status='active' trong collection
// Dùng cho: Session creation — host chọn collection


GET /collections/{id}
JSON
// Response 200 [Public]
{
  "id": "uuid",
  "name": "Quanh Bitexco - Nguyễn Huệ",
  "description": "Khu vực Nguyễn Huệ, Hồ Tùng Mậu, Hàm Nghi — trung tâm Q1",
  "landmarkLat": 10.7717,
  "landmarkLng": 106.7043,
  "coverageRadiusMeters": 250,
  "status": "active",
  "restaurants": [
    {
      "id": "uuid",
      "name": "Bún riêu Hà Nội",
      "address": "123 Nguyễn Huệ, Q1",
      "priceTier": "40_70k",
      "priceDisplay": "40–70k/phần",
      "rating": 4.3,
      "thumbnailUrl": "https://cdn.../thumb.jpg",
      "dishes": ["Bún riêu", "Bún cá"]
    },
    {
      "id": "uuid",
      "name": "Cơm Tấm Bụi Sài Gòn",
      "address": "45 Hàm Nghi, Q1",
      "priceTier": "under_40k",
      "priceDisplay": "Dưới 40k/phần",
      "rating": 4.0,
      "thumbnailUrl": null,
      "dishes": ["Cơm tấm", "Cơm sườn nướng"]
    }
  ],
  "restaurantCount": 32
}
// Dùng cho: Browse collection detail (optional MVP screen)
// restaurants[].dishes: tên món, không profile — chỉ informational


── CROWDSOURCE ──────────────────────────────────────────────────────────
POST /submissions
JSON
// Request [Auth: User JWT]
{
  "restaurantName": "Bún Chả Hương Liên",
  "address": "24 Lê Thanh Nghị, Hai Bà Trưng, Hà Nội",
  "googleMapsUrl": "https://maps.google.com/?q=Bun+Cha+Huong+Lien",
  "priceTier": "40_70k",
  "dishIds": ["uuid-bun-cha", "uuid-nem"],
  "notes": "Quán bún chả Obama, đông vào buổi trưa",
  "photoUrls": [
    "https://cdn.../user-upload-1.jpg"
  ]
}
// Response 201
{
  "submissionId": "uuid",
  "status": "pending",
  "restaurantName": "Bún Chả Hương Liên",
  "message": "Cảm ơn bạn! Đề xuất sẽ được admin duyệt sớm.",
  "createdAt": "2026-03-25T14:00:00Z"
}
// dishIds: references to existing dishes in dish pool
// photoUrls: pre-uploaded to S3 (client uploads direct to S3, sends URLs)
// Fuzzy dedup: server checks tên + address similarity → nếu trùng, trả gợi ý
//   (MVP: basic LIKE match; post-MVP: trigram similarity)


── ADMIN: SUBMISSIONS ───────────────────────────────────────────────────
GET /admin/submissions
JSON
// Response 200 [Auth: Admin JWT]
// Query params: ?status=pending&page=1&pageSize=20
{
  "submissions": [
    {
      "id": "uuid",
      "restaurantName": "Bún Chả Hương Liên",
      "address": "24 Lê Thanh Nghị, Hai Bà Trưng, Hà Nội",
      "googleMapsUrl": "https://maps.google.com/?q=...",
      "priceTier": "40_70k",
      "dishes": [
        { "id": "uuid", "name": "Bún chả" },
        { "id": "uuid", "name": "Nem" }
      ],
      "notes": "Quán bún chả Obama, đông vào buổi trưa",
      "photos": [
        { "id": "uuid", "url": "https://cdn.../user-upload-1.jpg", "displayOrder": 0 }
      ],
      "submittedBy": {
        "userId": "uuid",
        "fullName": "Nguyễn Văn Minh",
        "email": "minh@company.com"
      },
      "status": "pending",
      "createdAt": "2026-03-25T14:00:00Z",
      "reviewedBy": null,
      "reviewedAt": null
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "totalItems": 5,
    "totalPages": 1
  }
}


POST /admin/submissions/{id}/review
JSON
// Request [Auth: Admin JWT]
{
  "action": "approved",
  "collectionIds": ["uuid-collection-1"],
  "notes": "Đã xác nhận, thêm vào collection Bitexco"
}
// Response 200
{
  "submissionId": "uuid",
  "status": "approved",
  "restaurantCreated": {
    "id": "uuid",
    "name": "Bún Chả Hương Liên",
    "source": "crowdsource"
  },
  "addedToCollections": ["Quanh Bitexco - Nguyễn Huệ"],
  "reviewedBy": "admin@lunchsync.com",
  "reviewedAt": "2026-03-25T15:30:00Z",
  "message": "Đã duyệt và tạo restaurant + gắn collection"
}
// action: "approved" | "rejected"
// Khi approved:
//    1. Create restaurant row (source='crowdsource')
//    2. Link restaurant_dishes từ submission_dishes
//    3. Link restaurant_collections từ collectionIds
//    4. Update submission status
// Khi rejected:
//    1. Update submission status only
//    2. collectionIds không bắt buộc

Rejected example:
JSON
// Request [Auth: Admin JWT]
{
  "action": "rejected",
  "notes": "Quán đã đóng cửa, không còn hoạt động"
}
// Response 200
{
  "submissionId": "uuid",
  "status": "rejected",
  "restaurantCreated": null,
  "addedToCollections": [],
  "reviewedBy": "admin@lunchsync.com",
  "reviewedAt": "2026-03-25T15:35:00Z",
  "message": "Đã từ chối đề xuất"
}


── ADMIN: DISH MANAGEMENT ──────────────────────────────────────────────
GET /admin/dishes
JSON
// Response 200 [Auth: Admin JWT]
// Query params: ?search=phở&category=Phở%20%26%20Bún%20nước&page=1&pageSize=50
{
  "dishes": [
    {
      "id": "uuid",
      "name": "Phở bò",
      "category": "Phở & Bún nước",
      "profile": {
        "soupy": 0.9,
        "temperature": 0.9,
        "heaviness": 0.1,
        "flavor_intensity": 0.6,
        "spicy": -0.3,
        "texture_complexity": 0.4,
        "time_required": 0.2,
        "novelty": -0.9,
        "healthy": 0.3,
        "communal": -0.8
      },
      "version": 1,
      "restaurantCount": 8,
      "updatedAt": "2026-03-20T10:00:00Z",
      "updatedBy": null
    },
    {
      "id": "uuid",
      "name": "Phở gà",
      "category": "Phở & Bún nước",
      "profile": {
        "soupy": 0.9,
        "temperature": 0.85,
        "heaviness": -0.1,
        "flavor_intensity": 0.4,
        "spicy": -0.5,
        "texture_complexity": 0.3,
        "time_required": 0.1,
        "novelty": -0.8,
        "healthy": 0.4,
        "communal": -0.8
      },
      "version": 1,
      "restaurantCount": 5,
      "updatedAt": "2026-03-20T10:00:00Z",
      "updatedBy": null
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 50,
    "totalItems": 90,
    "totalPages": 2
  },
  "categories": [
    "Cơm", "Phở & Bún nước", "Bún khô/trộn", "Bánh",
    "Cháo & Súp", "Street food / Nhanh", "Healthy / Nhẹ",
    "Chia sẻ / Ngồi lâu", "Fusion", "Đặc sản vùng"
  ]
}
// restaurantCount: số restaurant phục vụ món này (cross-ref restaurant_dishes)
// categories: distinct list để FE render filter dropdown


GET /admin/dishes/{id}
JSON
// Response 200 [Auth: Admin JWT]
{
  "id": "uuid",
  "name": "Phở bò",
  "category": "Phở & Bún nước",
  "profile": {
    "soupy": 0.9,
    "temperature": 0.9,
    "heaviness": 0.1,
    "flavor_intensity": 0.6,
    "spicy": -0.3,
    "texture_complexity": 0.4,
    "time_required": 0.2,
    "novelty": -0.9,
    "healthy": 0.3,
    "communal": -0.8
  },
  "version": 1,
  "updatedAt": "2026-03-20T10:00:00Z",
  "updatedBy": null,
  "createdAt": "2026-03-15T08:00:00Z",
  "restaurants": [
    {
      "id": "uuid",
      "name": "Phở Thìn",
      "address": "45 Lý Tự Trọng, Q1",
      "priceTier": "40_70k",
      "collections": ["Quanh Bitexco - Nguyễn Huệ"]
    },
    {
      "id": "uuid",
      "name": "Phở Hòa Pasteur",
      "address": "260C Pasteur, Q3",
      "priceTier": "40_70k",
      "collections": ["Quanh Vincom Đồng Khởi"]
    }
  ],
  "restaurantCount": 8
}
// restaurants: danh sách quán phục vụ món này — giúp admin đánh giá coverage
// Dùng cho: Admin xem chi tiết + quyết định chỉnh profile


PUT /admin/dishes/{id}/profile
JSON
// Request [Auth: Admin JWT]
{
  "profile": {
    "soupy": 0.85,
    "temperature": 0.9,
    "heaviness": 0.2,
    "flavor_intensity": 0.6,
    "spicy": -0.3,
    "texture_complexity": 0.4,
    "time_required": 0.2,
    "novelty": -0.9,
    "healthy": 0.3,
    "communal": -0.8
  }
}
// Response 200
{
  "dish": { "id": "uuid", "name": "Phở bò", "version": 2 },
  "diff": [
    { "dimension": "soupy", "oldValue": 0.9, "newValue": 0.85, "delta": -0.05 },
    { "dimension": "heaviness", "oldValue": 0.1, "newValue": 0.2, "delta": 0.1 }
  ],
  "message": "Đã cập nhật 2 dimensions, cache updated"
}
// Validations:
// - All 10 dimensions must be present
// - Each value must be in range [-1.0, +1.0]
// - At least 1 value must differ from current (otherwise 200 with empty diff)
// Flow: validate → diff → update DB (version++) → hot-update cache → response
// Hiệu lực ngay, không cần redeploy


POST /admin/dishes/upload
JSON
// Request [Auth: Admin JWT] — bulk upload/update dish profiles
[
  {
    "name": "Phở bò",
    "category": "Phở & Bún nước",
    "profile": {
      "soupy": 0.85,
      "temperature": 0.9,
      "heaviness": 0.2,
      "flavor_intensity": 0.6,
      "spicy": -0.3,
      "texture_complexity": 0.4,
      "time_required": 0.2,
      "novelty": -0.9,
      "healthy": 0.3,
      "communal": -0.8
    }
  },
  {
    "name": "Bánh tráng nướng",
    "category": "Street food / Nhanh",
    "profile": {
      "soupy": -1.0,
      "temperature": 0.6,
      "heaviness": -0.5,
      "flavor_intensity": 0.7,
      "spicy": 0.3,
      "texture_complexity": 0.8,
      "time_required": -0.6,
      "novelty": 0.4,
      "healthy": -0.5,
      "communal": 0.3
    }
  }
]
// Response 200
{
  "summary": {
    "added": 1,
    "updated": 1,
    "unchanged": 0,
    "errors": 0,
    "totalInDb": 91
  },
  "details": {
    "added": ["Bánh tráng nướng"],
    "updated": [
      {
        "name": "Phở bò",
        "changes": [
          { "dimension": "soupy", "oldValue": 0.9, "newValue": 0.85, "delta":-0.05 },
          { "dimension": "heaviness", "oldValue": 0.1, "newValue": 0.2, "delta": 0.1 }
        ]
      }
    ],
    "unchanged": [],
    "errors": []
  },
  "cacheReloadedAt": "2026-03-25T14:30:00Z"
}
// Matching: by dish name (case-insensitive, trimmed)
// If name exists → compare profile → update if different
// If name not found → create new dish
// Flow: validate all → diff each → upsert DB → full cache reload → report
// Atomic: nếu bất kỳ item nào invalid, toàn bộ batch bị reject (transactional)


GET /admin/dishes/export
JSON
// Response 200 [Auth: Admin JWT]
// Content-Type: application/json
// Content-Disposition: attachment; filename="dish-profiles-2026-03-25.json"
{
  "exportedAt": "2026-03-25T14:30:00Z",
  "totalDishes": 90,
  "dishes": [
    {
      "name": "Cơm tấm",
      "category": "Cơm",
      "profile": {
        "soupy": -0.9,
        "temperature": 0.5,
        "heaviness": 0.7,
        "flavor_intensity": 0.7,
        "spicy": -0.2,
        "texture_complexity": 0.6,
        "time_required": -0.5,
        "novelty": -0.9,
        "healthy": -0.2,
        "communal": -0.9
      },
      "version": 1
    },
    {
      "name": "Phở bò",
      "category": "Phở & Bún nước",
      "profile": {
        "soupy": 0.85,
        "temperature": 0.9,
        "heaviness": 0.2,
        "flavor_intensity": 0.6,
        "spicy": -0.3,
        "texture_complexity": 0.4,
        "time_required": 0.2,
        "novelty": -0.9,
        "healthy": 0.3,
        "communal": -0.8
      },
      "version": 2
    }
  ]
}
// Format tương thích với POST /admin/dishes/upload — roundtrip export→edit→re-import
// Dùng cho: backup, offline editing trong spreadsheet, share giữa environments


POST /admin/dishes/cache/reload
JSON
// Request [Auth: Admin JWT]
{}
// Response 200
{
  "reloadedAt": "2026-03-25T14:35:00Z",
  "dishCount": 90,
  "cacheSizeBytes": 14820,
  "message": "Cache reloaded thành công"
}
// Dùng khi: trực tiếp sửa DB, hoặc nghi ngờ cache bị stale
// Flow: clear existing cache → reload all dishes from DB → rebuild Dict<Guid, double[]>
// Thường không cần gọi thủ công — PUT profile và POST upload tự reload


── API Error Responses ──────────────────────────────────────────────────
JSON
// Standard error format
{
  "error": {
    "code": "SESSION_NOT_FOUND",
    "message": "Không tìm thấy phiên với mã PIN này",
    "details": null
  }
}

Ví dụ validation error (có details):
JSON
// 400 VALIDATION_ERROR
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Dữ liệu không hợp lệ",
    "details": {
      "choices": "Phải đúng 8 ký tự, mỗi ký tự là 'A' hoặc 'B'",
      "participantId": "Không được để trống"
    }
  }
}

Ví dụ profile validation error:
JSON
// 400 VALIDATION_ERROR
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Profile không hợp lệ",
    "details": {
      "soupy": "Giá trị phải trong khoảng [-1.0, +1.0], nhận được: 1.5",
      "healthy": "Thiếu dimension bắt buộc"
    }
  }
}
