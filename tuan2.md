# Báo cáo Tuần 2 — Rubik Domain Engine

Ngày hoàn tất: 27/07/2026

## 1. Mục tiêu

Tuần 2 hoàn thiện lõi Rubik thuần TypeScript, không phụ thuộc UI, Zustand,
Three.js hay solver. Lõi phải đọc được WCA notation, áp dụng chính xác các face
moves, đảo ngược thuật toán và phát hiện trạng thái không thể tồn tại về mặt
vật lý.

## 2. Phạm vi đã hoàn thành

### WCA notation

- Hỗ trợ 18 moves: `U R F D L B`, prime và double.
- Parser chấp nhận khoảng trắng linh hoạt, chữ thường và Unicode prime.
- Từ chối rõ ràng wide moves, rotations và suffix không hợp lệ.
- Format, inverse và normalize các move liên tiếp cùng mặt.
- Kết quả parser/normalizer là mảng readonly.

### Facelet move engine

- Mỗi sticker được biểu diễn bằng vị trí `(x, y, z)` và vector pháp tuyến.
- Face move xoay layer bằng phép quay tọa độ nguyên ±90°.
- Không dùng 18 bảng permutation hard-code riêng rẽ.
- Hỗ trợ input dạng chuỗi hoặc mảng `Move`.
- Mọi state trả về đều được freeze ở runtime.
- Giữ nguyên center colors và chính xác 9 sticker cho mỗi màu.

### Validator vật lý

Validator chạy theo các tầng:

1. Kiểm tra đúng 9 sticker trên mỗi mặt.
2. Kiểm tra đúng 9 sticker cho mỗi màu.
3. Kiểm tra sáu center colors khác nhau.
4. Chuyển 54 facelets thành 8 corner và 12 edge cubies.
5. Kiểm tra mỗi cubie xuất hiện đúng một lần.
6. Kiểm tra tổng corner orientation chia hết cho 3.
7. Kiểm tra tổng edge orientation chia hết cho 2.
8. Kiểm tra parity corner permutation bằng edge permutation.

Các lỗi có mã ổn định để Application/UI có thể dịch và trình bày hướng sửa ở
giai đoạn sau.

## 3. Kiểm thử

Test bao phủ:

- Parser, formatter, inverse và normalization.
- Mỗi move cộng inverse trả về identity.
- Bốn quarter turns trả về identity.
- Double move bằng hai quarter turns.
- Chu kỳ sticker chuẩn của `F`.
- Bảo toàn centers và color counts.
- 200 thuật toán giả ngẫu nhiên, mỗi thuật toán 40 moves; tất cả đều được đảo
  ngược về solved và được validator chấp nhận.
- Solved cube và legal scramble.
- Sai color count.
- Một cạnh bị lật.
- Một góc bị xoắn.
- Hoán vị lẻ hai cạnh.
- Center colors trùng.

## 4. Quyết định kỹ thuật

- Chỉ hỗ trợ face turns ở Tuần 2. Wide moves, slice moves và cube rotations được
  từ chối thay vì diễn giải mơ hồ.
- Validator hoạt động trên center-derived facelets, không hard-code màu trắng
  luôn là `U`.
- `isSolvedCube` yêu cầu state hợp lệ vật lý trước khi kết luận solved.
- Domain public API được tập trung tại `src/domain/cube/index.ts`.

## 5. Rủi ro còn lại

1. Chưa có solver Kociemba/WASM; move engine chỉ mô phỏng và xác thực.
2. Chưa tạo hướng dẫn lỗi trực quan cho từng cubie sai.
3. Chưa benchmark trên thiết bị mobile yếu; property tests hiện ưu tiên tính
   đúng hơn benchmark.
4. Chưa hỗ trợ notation mở rộng ngoài 18 face moves.

## 6. Tiêu chí chuyển sang Tuần 3

- TypeScript, ESLint, peer dependency check và production build đạt.
- Toàn bộ unit/component/property tests đạt.
- GitHub CI đạt trên nhánh Tuần 2.
- `check:boundaries` xác nhận Domain không import framework hoặc infrastructure.

Sau khi đạt các tiêu chí trên, Tuần 3 có thể xây bảng nhập màu thủ công dựa trên
API domain ổn định mà không trộn logic Rubik vào component.
