# Báo cáo Tuần 1 — Nền tảng CubSol

Ngày hoàn tất: 27/07/2026

## 1. Mục tiêu

Tuần 1 tập trung tạo nền tảng có thể phát triển lâu dài, chưa triển khai solver,
camera hoặc mô hình Rubik 3D thật. Tiêu chí hoàn thành gồm: dự án build được,
kiến trúc có ranh giới rõ, state management hoạt động, có kiểm thử tự động và
giao diện nền phản ánh đúng trạng thái sản phẩm.

## 2. Công việc đã hoàn thành

### Môi trường và toolchain

- Chuẩn hóa một package manager: pnpm `11.9.0`.
- Cấu hình pnpm store cục bộ và allow-list build script cho các package native
  đã kiểm chứng.
- Sửa script để chạy tương thích Windows.
- Ghim Node.js tối thiểu `22.13.0`.
- Thiết lập TypeScript strict, ESLint, Vitest, Testing Library và jsdom.
- Bổ sung Cloudflare Worker types tương thích với Wrangler.

### Kiến trúc

- Giữ vinext/Vite làm runtime và hosting adapter.
- Tạo ranh giới `domain → application → presentation`.
- Ghi lại nguyên tắc phụ thuộc tại `docs/architecture.md`.
- Domain không phụ thuộc React, Zustand, Three.js hoặc Cloudflare.

### Domain Rubik nền

- Định nghĩa sáu mặt `U, R, F, D, L, B`.
- Định nghĩa sáu màu chuẩn.
- Mỗi mặt được biểu diễn bằng tuple bất biến đúng 9 sticker.
- Tạo factory cho cube hoàn chỉnh.
- Tạo serializer theo thứ tự Kociemba `URFDLB`.

Serializer hiện chuyển màu thành ký hiệu mặt dựa trên trạng thái solved chuẩn.
Việc ánh xạ màu–tâm tổng quát sẽ được hoàn thiện cùng validator, không coi
serializer nền hiện tại là implementation solver cuối cùng.

### State management

- Tạo Zustand store cho cube state, trạng thái ứng dụng, lỗi, solution, playback
  và bước hiện tại.
- Khi thay cube state, store xóa solution/playback cũ để tránh dữ liệu stale.
- Có action đưa phiên làm việc về trạng thái ban đầu.

### Giao diện

- Thay toàn bộ starter skeleton bằng giao diện CubSol responsive.
- Hoàn thiện phần giới thiệu, pipeline và ba phương thức nhập.
- Đánh dấu rõ tính năng chưa triển khai, không tạo nút chức năng giả.
- Hỗ trợ keyboard focus, reduced motion và bố cục mobile.
- Metadata tiếng Việt, Open Graph và X card dùng URL theo request host.
- Tạo ảnh social preview riêng tại `public/og.png`.

### CI và kiểm thử

- GitHub Actions chạy install, type-check, lint, unit test, build và SSR smoke
  test trên mỗi push/PR.
- Unit test domain kiểm tra 6 mặt, 54 sticker, phân bố 9 màu và thứ tự facelets.
- Unit test store kiểm tra trạng thái ban đầu và loại bỏ playback stale.
- SSR smoke test xác nhận nội dung CubSol, ngôn ngữ và loại bỏ starter metadata.

## 3. Kết quả kiểm chứng

| Hạng mục | Kết quả |
|---|---|
| TypeScript | Đạt |
| ESLint | Đạt |
| Unit tests | 5/5 đạt |
| SSR smoke test | 1/1 đạt |
| Peer dependency check | Đạt |
| Production build | Đạt |

## 4. Vấn đề đã xử lý

- WSL/Bash bị từ chối quyền: chuyển quy trình sang PowerShell.
- Node không nằm trong PATH: chỉ bổ sung PATH tạm thời cho tiến trình, không sửa
  môi trường hệ thống.
- Pnpm chặn postinstall: chỉ cho phép bốn package đã kiểm chứng.
- Hai lockfile: bỏ npm lockfile và giữ pnpm lockfile.
- Thiếu Cloudflare binding types: khai báo `DB` tùy chọn, không tạo database.
- Test runner không hiểu alias `@`: đồng bộ alias với TypeScript.

## 5. Rủi ro còn lại

1. Runtime là vinext/Vite thay vì Vite SPA thuần. Rủi ro được giảm bằng việc cô
   lập domain và application khỏi framework.
2. Workspace nằm trong OneDrive; dependency/cache lớn có thể gây đồng bộ chậm.
   Các thư mục này đã được loại khỏi Git.
3. Một số dependency gián tiếp của toolchain đã deprecated. Không nâng cưỡng ép
   vì bản hiện tại build ổn định.
4. Serializer hiện là nền cho solved color scheme, chưa thay thế ánh xạ dựa trên
   center colors và validator vật lý.
5. UI cube hiện là minh họa CSS, không phải Three.js renderer.

## 6. Phạm vi chưa thực hiện

- Phép xoay Rubik và cubie model.
- Validator count/parity đầy đủ.
- Kociemba solver và fallback.
- Bảng nhập màu thủ công.
- Three.js, camera và xử lý ảnh.
- PWA/offline.

Những phần này được giữ ngoài Tuần 1 để tránh trộn UI prototype với logic Rubik
chưa được kiểm chứng.

## 7. Đề xuất bước tiếp theo

Tuần 2 nên bắt đầu từ domain move engine: chuẩn hóa notation, triển khai phép
xoay facelets/cubies, inverse move và property tests. Chỉ sau khi domain đạt độ
tin cậy cao mới kết nối bảng nhập thủ công và solver.
