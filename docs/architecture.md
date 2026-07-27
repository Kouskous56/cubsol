# Kiến trúc CubSol

## Quyết định nền tảng

CubSol giữ `vinext + Vite` làm lớp runtime và triển khai Sites. Phần nghiệp vụ
được tách khỏi framework để có thể chuyển sang Vite SPA thuần nếu cần.

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
- `app`: điểm vào của vinext, metadata và layout.

Domain không được import từ Application, Infrastructure hoặc Presentation.
Infrastructure triển khai interface do Application/Domain định nghĩa, không
được trở thành nguồn trạng thái nghiệp vụ duy nhất.

## Mô hình dữ liệu nền

- Mặt: `U, R, F, D, L, B`.
- Màu: `white, red, green, yellow, orange, blue`.
- Mỗi mặt là tuple bất biến gồm đúng 9 sticker.
- Thứ tự solver: `U → R → F → D → L → B`.
- `currentStep` về sau biểu thị số move đã hoàn tất và có miền
  `0..solutionMoves.length`.

## Quyết định chưa triển khai

- Solver WASM và JavaScript fallback.
- Validator vật lý đầy đủ.
- Three.js renderer và animation queue.
- Image processor, camera và Web Worker.

Các module này thuộc các tuần sau và không được mô phỏng bằng dữ liệu giả trong
bản nền Tuần 1.
