# BÁO CÁO TUẦN 4 — KOCIEMBA SOLVER ENGINE

Ngày hoàn tất: 27/07/2026

## 1. Mục tiêu

Tích hợp solver thật vào CubSol, nối luồng `VALIDATING → SOLVING → SOLVED/ERROR`
với Zustand và hiển thị lời giải WCA có thể duyệt từng bước. Không giả lập chuỗi
lời giải và chưa triển khai renderer 3D.

## 2. Solver Infrastructure

- Package chính: `kociemba-wasm@1.0.3`, binary WASM được nhúng trong bundle.
- `SolverEngine` nằm ở Application để implementation có thể thay thế.
- `KociembaSolver` nằm ở Infrastructure.
- Trình duyệt chạy solver trong Web Worker để tránh khóa giao diện.
- Worker có timeout 20 giây.
- Nếu Worker không khởi tạo hoặc lỗi khi solve, adapter fallback về WASM trên
  main thread thay vì làm mất phiên nhập màu.
- Initialization được cache; benchmark cục bộ cho thấy lần đầu khoảng 1,3–1,5
  giây, các lần warm khoảng 1 ms trên máy phát triển.
- Solved cube trả ngay `[]`, không gọi WASM và không hiển thị chuỗi identity dài.

## 3. Phòng vệ tính đúng

1. Validator vật lý chạy trước solver.
2. Cube được serialize theo `URFDLB`.
3. Output được parse bằng notation parser của Domain.
4. Các move được áp dụng lại vào trạng thái đầu vào.
5. Chỉ khi `isSolvedCube` trả `true`, Store mới nhận solution.
6. Output sai bị chuyển thành `INVALID_SOLUTION`, không hiển thị cho người dùng.
7. Nếu cube bị chỉnh trong lúc đang solve, kết quả cũ bị bỏ qua.

## 4. State machine và playback

- `SOLVING`: xóa solution cũ, khóa nút solve và hiển thị tiến trình.
- `SOLVED`: lưu `solutionMoves`, `solvingTimeMs`, đặt `currentStep = 0`.
- `ERROR`: giữ cube để người dùng sửa, xóa playback không còn tin cậy.
- Step Back/Forward luôn clamp trong `0..solutionMoves.length`.
- Play tự tiến mỗi 650 ms và tự dừng ở bước cuối.
- Slider cho phép nhảy tới bước bất kỳ.
- Danh sách WCA highlight move hiện tại và các move đã hoàn tất.

## 5. Kiểm thử

- Use case không khởi tạo engine khi cube đã solved.
- Từ chối output solver không thực sự giải cube.
- Integration test dùng WASM thật để giải scramble `R U F2 L'`.
- Kiểm tra malformed facelets bị chặn trước WASM.
- Store test validation gate, SOLVED state và toàn bộ playback boundary.
- Component test solved cube cho kết quả 0 bước.
- Toàn bộ test Tuần 1–3 tiếp tục được giữ.

## 6. Rủi ro còn lại

1. Fallback main-thread có thể đóng băng UI ngắn trên trình duyệt không hỗ trợ
   Worker; đây là chế độ dự phòng thay vì đường chạy mặc định.
2. Thời gian cold-start phụ thuộc thiết bị và chưa đạt mục tiêu <200 ms; warm solve
   đạt nhanh hơn nhiều.
3. Control Bar hiện điều khiển text/progress. Three.js sẽ tiêu thụ `currentStep`
   ở giai đoạn renderer, không được giả lập trong Tuần 4.
4. Chưa có hủy search giữa chừng ở native WASM; stale result được bỏ qua an toàn.

## 7. Tiêu chí hoàn thành

- WASM giải được scramble thật và output được domain xác minh.
- Validation, status transition, error handling và stale-result guard hoạt động.
- Text solution, timing, play/pause/step/reset/slider hoạt động.
- Typecheck, lint, boundary audit, tests, Next.js build và HTTP smoke test đạt.

## 8. Tinh chỉnh mô hình 3D và tutorial

- Three.js được tách thành client-only chunk bằng `next/dynamic`; trang có loading
  state rõ ràng trong lúc tải renderer.
- Loại `@react-three/fiber` và `@react-three/drei` vì implementation hiện dùng
  Three.js trực tiếp.
- Geometry, edge geometry và material được dùng chung giữa 26 cubie.
- Khi tô màu, renderer chỉ đổi material. Cubie chỉ được dựng lại sau animation để
  đồng bộ tọa độ, thay vì phá và tạo lại toàn bộ scene ở mỗi sticker.
- `dispose()` hủy render loop lẫn move animation, giải phóng shared resource và
  chủ động mất WebGL context.
- Tutorial tiến và lùi đều animate trước khi commit `currentStep`.
- Bổ sung test random scramble, tái dựng tutorial và animation tiến/lùi.

## 9. Kết quả kiểm thử cuối

- TypeScript, ESLint và Domain boundary audit: PASS.
- Unit/component/integration: 10 files, 77 tests PASS.
- Next.js 16 production build: PASS.
- Browser thật: WebGL khởi tạo, scramble hợp lệ, WASM solve thành công, tutorial
  `0 → 1 → 0`, không có console error/warning.
