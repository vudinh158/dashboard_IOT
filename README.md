# Bảng Điều Khiển Cảm Biến IoT (IoT Sensor Dashboard)



## Tổng Quan
Đây là ứng dụng fullstack Bảng Điều Khiển Cảm Biến IoT để giám sát dữ liệu cảm biến giả lập (nhiệt độ, độ ẩm). Công nghệ sử dụng:
- **Frontend**: React.js (Vite) cho giao diện dashboard (danh sách thiết bị, chi tiết thiết bị, trình mô phỏng).
- **Backend**: Node.js/Express API kết nối với AWS DynamoDB để lưu trữ dữ liệu.
- **Cơ Sở Dữ Liệu**: AWS DynamoDB (bảng: SensorReadings).
- **Trình Mô Phỏng**: Công cụ dựa trên trình duyệt để mô phỏng dữ liệu IoT.

Ứng dụng cho phép:
- Liệt kê thiết bị với dữ liệu đọc mới nhất.
- Xem chi tiết thiết bị và lịch sử dữ liệu.
- Mô phỏng dữ liệu cảm biến (POST /ingest) để cập nhật dashboard thời gian thực.

## Yêu Cầu Hệ Thống
- Node.js (phiên bản 18 trở lên)
- npm hoặc yarn
- Tài khoản AWS với người dùng IAM (để truy cập DynamoDB)
- AWS CLI (tùy chọn, để kiểm tra DynamoDB)

### Thiết Lập AWS (Bắt Buộc Cho Cơ Sở Dữ Liệu)
1. Tạo người dùng IAM (ví dụ: "dynamodb-local-dev") với chính sách "AmazonDynamoDBFullAccess".
2. Tạo Access Key ID và Secret Access Key.
3. Tạo bảng DynamoDB "SensorReadings" ở vùng ap-southeast-1:
   - Partition Key: `deviceId` (String)
   - Sort Key: `ts` (String) - cho truy vấn dựa trên thời gian.
   - Billing: On-demand.
   - Sử dụng AWS Console: DynamoDB > Tables > Create table.

## Cài Đặt
1. Clone kho lưu trữ:
   ```
   git clone https://github.com/username-cua-ban/iot-sensor-dashboard.git
   cd iot-sensor-dashboard
   ```

2. Thiết Lập Backend:
   - cd backend
   - Cài đặt dependencies:
     ```
     npm install
     ```
   - Tạo file `.env` trong backend/ (sao chép từ backend/.env.example nếu có, hoặc tạo mới):
     ```
     TABLE_NAME=SensorReadings
     AWS_ACCESS_KEY_ID=access_key_cua_ban
     AWS_SECRET_ACCESS_KEY=secret_key_cua_ban
     AWS_REGION=ap-southeast-1
     PORT=8080
     CORS_ORIGIN=http://localhost:5173
     ```
     - Thay thế bằng thông tin AWS của bạn.

3. Thiết Lập Frontend:
   - cd frontend
   - Cài đặt dependencies:
     ```
     npm install
     ```
   - Tạo file `.env` trong frontend/:
     ```
     VITE_API_BASE=http://localhost:8080
     ```

## Chạy Local
1. Khởi Động Backend:
   - cd backend
   - Chạy:
     ```
     npm run dev
     ```
   - Server chạy trên http://localhost:8080. Kiểm tra health: Mở trình duyệt hoặc dùng `curl http://localhost:8080/health` (nên trả về `{ "ok": true }`).

2. Khởi Động Frontend (trong terminal mới):
   - cd frontend
   - Chạy:
     ```
     npm run dev
     ```
   - Ứng dụng chạy trên http://localhost:5173. Mở trong trình duyệt.

3. Truy Cập Dashboard:
   - Chuyển đến http://localhost:5173.
   - Trang "Devices": Xem danh sách thiết bị (ban đầu rỗng nếu chưa có dữ liệu).
   - Trang "Simulator": Nhập ID thiết bị (ví dụ: esp32-1,esp32-2), đặt khoảng thời gian (ví dụ: 3000ms), click "Start" để mô phỏng dữ liệu. Kiểm tra logs để xem status 200. Dữ liệu sẽ cập nhật trong trang Devices.

## Kiểm Tra
- **API Endpoints** (sử dụng curl hoặc Postman):
  - Liệt kê thiết bị: `curl http://localhost:8080/devices` (trả về mảng thiết bị với dữ liệu mới nhất).
  - Nhập dữ liệu: `curl -X POST http://localhost:8080/ingest -H "Content-Type: application/json" -d "{\"deviceId\":\"esp32-1\",\"temperature\":25.5,\"humidity\":60}"` (trả về `{ "ok": true }`).
  - Dữ liệu mới nhất: `curl http://localhost:8080/devices/esp32-1/latest`.
  - Lịch sử dữ liệu: `curl "http://localhost:8080/devices/esp32-1/readings?limit=10"`.

- **Kiểm Tra UI**:
  - Trang Devices: Tải danh sách, click thiết bị để xem chi tiết (hiển thị biểu đồ/dữ liệu).
  - Simulator: Khởi động mô phỏng, xác nhận logs hiển thị POST thành công, làm mới Devices để xem cập nhật.
  - Trường hợp biên: Mô phỏng ID thiết bị không hợp lệ (nên log lỗi), dừng/khởi động nhiều lần.

## Khắc Phục Sự Cố
- **Lỗi 500 trên /devices hoặc /ingest**: Kiểm tra thông tin AWS trong backend/.env, quyền IAM (AmazonDynamoDBFullAccess), schema bảng (ts là String). Xem logs console để tìm lỗi AWS SDK (ví dụ: AccessDeniedException).
- **Lỗi CORS**: Đảm bảo CORS_ORIGIN trong backend/.env khớp với cổng frontend (http://localhost:5173).
- **Không có dữ liệu trong Devices**: Chạy simulator hoặc dùng curl để nhập dữ liệu mẫu. Kiểm tra AWS Console > DynamoDB > SensorReadings > Explore items.
- **Frontend không kết nối**: Xác nhận VITE_API_BASE trong frontend/.env trỏ đến http://localhost:8080. Khởi động lại dev server.
- **Lỗi type mismatch ts**: Đảm bảo ts được gửi dưới dạng chuỗi ISO (đã sửa trong code).

## Cấu Trúc Dự Án
- **backend/**: API Express, service DynamoDB, controllers, routes.
- **frontend/**: Ứng dụng React với Vite, pages (Devices, DeviceDetail, Simulator), gọi API.
- **simulate/**: Script mô phỏng Node.js tùy chọn (npm start trong simulate/).

## Đóng Góp
Fork repo, tạo branch, thực hiện thay đổi, và gửi Pull Request. Đảm bảo test pass và cập nhật README nếu cần.

## Giấy Phép
MIT License - tự do sử dụng và chỉnh sửa.
