<div align="center">
  <img src="https://raw.githubusercontent.com/FortAwesome/Font-Awesome/6.x/svgs/solid/utensils.svg" width="80" alt="LunchSync Logo" />
  <br/>
  <h1>🥗 LunchSync</h1>
  <p><b>Quyết định bữa trưa chỉ trong 3 phút – Nâng tầm bữa trưa văn phòng của bạn!</b></p>
  <p>
    <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" />
    <img src="https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white" />
    <img src="https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white" />
    <img src="https://img.shields.io/badge/Framer_Motion-white?style=for-the-badge&logo=framer" />
  </p>
</div>

<br/>

## Giới thiệu
**LunchSync** là ứng dụng web ưu tiên thiết bị di động (Mobile-first) giúp các nhóm đồng nghiệp quyết định nhanh chóng địa điểm ăn trưa mà không còn phải đau đầu vì câu hỏi kinh điển: *"Trưa nay ăn gì?"*. 

Thay vì cãi vã hay nhường nhau, LunchSync biến việc chọn món thành một trải nghiệm thú vị như "quẹt Tinder", với hệ thống tổng hợp thời gian thực thông minh.

##  Tính năng nổi bật
- **Xác thực an toàn với AWS Cognito:** Đăng ký và đăng nhập được quản lý xác thực bằng OTP qua hệ thống Amazon Cognito được tích hợp thẳng vào Frontend qua SDK chuyên dụng. 
- **Chế độ BOOM (Loại trừ):** Trong trường hợp khó quyết định giữa top lựa chọn, Host có thể kích hoạt **BOOM** – màn thiết kế animation sẽ văng các quán có hạng thấp ra khỏi màn hình và đưa Top 3 lên để chốt!
- **Sảnh chờ (Lobby) Real-time:** Hiển thị tức thì số lượng đã tham gia phòng, ai đã ở trong phòng chờ và ai đã hoàn thành lượt bình chọn thông qua API Polling.


## 🛠 Công nghệ sử dụng
- **Core Framework:** React 18, React Router v7.
- **Build Tool:** Vite 8 (Tối ưu hóa Code Splitting & Manual Chunking).
- **Authentication:** Amazon Cognito Identity JS SDK.
- **Styling:** Tailwind CSS v4, áp dụng triệt để bộ Token / Design System hiện đại với màu sắc hài hòa.
- **Animation:** Framer Motion (Sử dụng cho hiệu ứng quẹt thẻ mượt mà, layout exit/enter).
- **State Management:** Zustand (Store gọn nhẹ & hiệu năng cao cho Auth, Session).
- **Icons & Components:** FontAwesome, Material Symbols, Ant Design.

## 🚀 Môi trường & Triển khai (Deployment)
Toàn bộ dự án được thiết lập Pipeline CI/CD tự động bằng **GitHub Actions**. Backend tĩnh (Static Frontend) được build qua Vite và tự động đồng bộ hóa lên **AWS S3** và phân phối nội dung toàn cầu qua **AWS CloudFront**. Không còn phụ thuộc vào các nền tảng Hosting truyền thống.

## Cài đặt & Khởi chạy trực tiếp

```bash
# 1. Clone repository
git clone https://github.com/ThinhCri/lunch-sync-fe.git

# 2. Di chuyển vào thư mục dự án
cd lunch-sync-fe

# 3. Tạo file môi trường (env)
cp .env.example .env
# Chỉnh sửa file .env và điền các thông số Cognito tương ứng của bạn

# 4. Cài đặt các package phụ thuộc
npm install

# 5. Khởi động Development Server
npm run dev
```

Server sẽ khởi chạy mặc định tại cổng môi trường thiết lập (hoặc `http://localhost:5173`). Giao diện này nhắm đến đối tượng Mobile nên hãy **truy cập qua trình duyệt điện thoại**, hoặc ấn `F12` > Chọn Mobile View để có trải nghiệm thị giác đẹp và kích thước chuẩn xác nhất!

## Luồng sử dụng cơ bản
1. **Host** (Trưởng nhóm) gửi lời mời hoặc báo mã phòng (PIN).
2. **Thành viên mới (Guest)**: Truy cập thẳng ứng dụng, nhập `Mã phòng` và `Nickname` không cần đăng nhập dài dòng để join vào sảnh. Người dùng có tài khoản có thể khám phá hoặc dấn thân tạo bàn riêng.
3. Host bấm **Bắt đầu**, mọi người bước vào màn hình bình chọn và quẹt trái/phải các nhà hàng do hệ thống ngẫu nhiên đưa ra.
4. Ai xong trước sẽ ngồi ở **Phòng chờ** để nán đợi các đồng nghiệp khác rảnh tay.
5. Khi tất cả hoàn thành, Host chốt sổ và kéo ra **Bảng xếp hạng (Kết quả)**.
6. Nếu điểm số sít sao, Host thả nút **BOOM!** để loại đi các quán chót bảng, chỉ giữ lại vài sự quán có lượt Vote cao nhất để chốt kèo hẹn đồng nghiệp đi ăn!

