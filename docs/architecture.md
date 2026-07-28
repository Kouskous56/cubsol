# Kiến trúc CubSol

## Quyết định nền tảng

CubSol dùng Next.js App Router làm lớp runtime và Vercel làm nền tảng triển khai.
Phần nghiệp vụ được tách khỏi framework để có thể thay đổi presentation/runtime
mà không tác động đến move engine, notation parser hay validator.

## Ranh giới phụ thuộc

```text
Presentation → Application → Domain
                         ↘ Infrastructure
```

- `src/domain`: kiểu dữ liệu và quy tắc Rubik thuần TypeScript; không phụ thuộc
  React, Zustand, Three.js hay solver cụ thể.
- `src/application`: điều phối use case và trạng thái ứng dụng.
- `src/infrastructure`: adapter cho solver, xử lý ảnh, lưu trữ và renderer.
- `src/presentation`: component và hành vi giao diện.
- `app`: điểm vào của Next.js App Router, metadata và layout.

Domain không được import từ Application, Infrastructure hoặc Presentation.
Infrastructure triển khai interface do Application/Domain định nghĩa, không
được trở thành nguồn trạng thái nghiệp vụ duy nhất.

## Mô hình dữ liệu nền

- Mặt: `U, R, F, D, L, B`.
- Màu: `white, red, green, yellow, orange, blue`.
- Mỗi mặt là tuple bất biến gồm đúng 9 sticker.
- Thứ tự solver: `U → R → F → D → L → B`.
- Serializer ánh xạ sticker sang ký hiệu mặt bằng màu của sáu tâm và từ chối
  các tâm trùng màu.
- Move engine dùng tọa độ nguyên và vector pháp tuyến để sinh permutation cho
  18 face moves, không phụ thuộc bảng ánh xạ hard-code.
- Validator chuyển facelets sang 8 corner và 12 edge cubies, sau đó kiểm tra
  orientation sum và permutation parity.
- `currentStep` về sau biểu thị số move đã hoàn tất và có miền
  `0..solutionMoves.length`.
- Manual Input khởi tạo từ solved template với sáu tâm bị khóa. Mỗi lần sửa
  sticker tạo một `CubeState` frozen mới; UI không được mutate tuple của Domain.
- Application Store gọi validator Domain và chỉ giữ mã lỗi/kết quả. Presentation
  chịu trách nhiệm dịch kết quả thành hướng dẫn sửa, không tự triển khai parity.
- `SolverEngine` là port của Application. Kociemba WASM là adapter Infrastructure,
  chạy trong Web Worker khi trình duyệt hỗ trợ và fallback về main thread nếu
  worker không khởi tạo được.
- Mọi output solver phải parse qua notation Domain và được áp dụng lại bằng
  move engine; chỉ kết quả thực sự đưa cube về solved mới được commit vào Store.
- `currentStep` là số move đã hoàn tất, nằm trong `0..solutionMoves.length`.

## Renderer 3D và tutorial

- Three.js renderer được tải bằng client-only dynamic chunk.
- Geometry và material được chia sẻ giữa các cubie; thao tác tô màu chỉ cập nhật
  material, không dựng lại toàn bộ scene.
- Sau animation, renderer dựng lại cubie từ `CubeState` đã xác nhận để loại sai số
  transform và giữ Domain là nguồn sự thật.
- Tutorial luôn tái dựng bước đích từ `scrambledState` bất biến và prefix của lời
  giải; animation tiến/lùi hoàn tất trước khi Store commit `currentStep`.

## Quyết định chưa triển khai

- Image processor và camera.

Các module này thuộc các tuần sau và không được mô phỏng bằng dữ liệu giả trong
bản nền Tuần 1.
