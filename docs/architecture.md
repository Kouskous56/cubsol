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

## Quyết định chưa triển khai

- Solver WASM và JavaScript fallback.
- Validator vật lý đầy đủ.
- Three.js renderer và animation queue.
- Image processor, camera và Web Worker.

Các module này thuộc các tuần sau và không được mô phỏng bằng dữ liệu giả trong
bản nền Tuần 1.
