# BÁO CÁO TUẦN 3 — NHẬP MÀU THỦ CÔNG & VALIDATION UI

Ngày hoàn tất: 27/07/2026

## 1. Mục tiêu

Hoàn thiện bước đầu của Phase 1: người dùng có thể mở bảng nhập Rubik, chỉnh màu
trên sáu mặt 3×3 và kiểm tra trạng thái bằng validator vật lý đã xây ở Tuần 2.
Không giả lập solver hoặc lời giải khi solver thật chưa được tích hợp.

## 2. Chức năng hoàn thành

- Hiển thị đồng thời sáu mặt theo thứ tự `U R F D L B`.
- Mỗi mặt có lưới 3×3; tổng cộng 54 sticker.
- Sáu tâm được khóa để bảo toàn hệ quy chiếu màu.
- Palette gồm Trắng, Đỏ, Xanh lá, Vàng, Cam và Xanh dương.
- Chọn palette rồi chạm/click sticker để tô màu.
- Mọi nút đều có accessible name, focus bàn phím và trạng thái `aria-pressed`.
- Có thao tác đặt lại solved template.
- Kiểm tra color count, center, cubie set, corner/edge orientation và parity.
- Hiển thị lỗi cụ thể bằng vùng `role="alert"`; kết quả hợp lệ dùng `role="status"`.

## 3. Kiến trúc trạng thái

- `setSticker` chỉ sửa sticker ngoài tâm và tạo state frozen mới.
- Mỗi chỉnh sửa xóa kết quả validation cũ và dữ liệu playback cũ.
- `validateCube` gọi trực tiếp `validateCubeState` từ Domain.
- Store giữ `validationIssues` có mã ổn định; UI chỉ trình bày nội dung.
- UI không chứa thuật toán Rubik hoặc logic parity.

## 4. Kiểm thử

- Store: khởi tạo manual entry, cập nhật bất biến, khóa tâm, lỗi count và state hợp lệ.
- Component: mở đủ sáu grid, kiểm tra tâm disabled, tô màu bằng palette, hiển thị
  lỗi và chấp nhận solved template.
- Toàn bộ test cũ của move engine, notation và validator tiếp tục được giữ.
- Production build và HTTP smoke test là quality gate bắt buộc.
- Browser verification đã kiểm tra luồng mở editor, tô `U1` thành đỏ, nhận lỗi
  count, sáu tâm bị khóa, không có console error/error overlay.
- Viewport mobile 390×844 không có horizontal overflow.

## 5. Quyết định kỹ thuật

- Dùng solved template thay vì `null` sticker để `CubeState` trong Domain luôn hợp
  lệ về kiểu. Người dùng chỉnh 48 sticker ngoài tâm; sáu tâm xác định màu mặt.
- Không đưa draft nullable vào Domain. Khi camera/upload xuất hiện, dữ liệu chưa
  hoàn chỉnh sẽ thuộc Application/Infrastructure rồi mới chuyển thành CubeState.
- Client boundary nằm ở editor/store; page và layout vẫn giữ mô hình App Router.

## 6. Rủi ro còn lại

1. Chưa có undo/redo cho thao tác tô màu.
2. Validator hiện báo lỗi cấp trạng thái/cubie, chưa highlight chính xác sticker
   gây lỗi vì một lỗi vật lý thường liên quan nhiều sticker.
3. Chưa tích hợp solver nên trạng thái hợp lệ chỉ dừng ở bước xác nhận.
4. Trình duyệt có thể tạm khóa thao tác tab khi người dùng đang kéo/chuyển tab;
   verifier dùng một lần retry có kiểm soát thay vì kết luận ứng dụng bị lỗi.

## 7. Tiêu chí sang Tuần 4

- Manual Input hoạt động trên desktop và mobile theo CSS breakpoint.
- Store, component, domain tests đạt.
- Typecheck, lint, boundary audit, Next.js production build và HTTP smoke test đạt.
- Không có dữ liệu giả về lời giải hoặc thời gian giải.
