# BÁO CÁO TUẦN 2.5 — CHUYỂN RUNTIME SANG VERCEL

## 1. Mục tiêu

Chuẩn hóa CubSol thành ứng dụng Next.js nguyên bản để có thể import repository vào
Vercel và triển khai bằng Git integration mà không cần adapter Cloudflare riêng.

## 2. Công việc đã thực hiện

- Chuyển lệnh phát triển và production sang `next dev`, `next build`, `next start`.
- Cố định Node.js ở nhánh `22.x`, phù hợp môi trường phát triển và Vercel.
- Thêm `vercel.json` khai báo framework, pnpm và frozen lockfile.
- Loại bỏ vinext, Vite, Wrangler, Cloudflare Worker và cấu hình Sites không còn dùng.
- Loại bỏ adapter D1 chưa được sử dụng để runtime không còn phụ thuộc binding Cloudflare.
- Tách thư mục ví dụ D1 tùy chọn khỏi TypeScript graph của ứng dụng production.
- Loại bỏ type Cloudflare khỏi TypeScript.
- Thay smoke test Worker bằng smoke test khởi động server Next.js production thật,
  gọi HTTP và kiểm tra nội dung HTML quan trọng.
- Giữ nguyên domain engine, notation parser và validator Rubik của Tuần 2.

## 3. Quy trình triển khai

1. Import `Kouskous56/cubsol` trong Vercel.
2. Vercel tự nhận diện framework Next.js.
3. Giữ Root Directory là thư mục gốc repository.
4. Preview được tạo từ pull request; production được tạo từ nhánh `main`.

Không commit `.vercel`, token hoặc tệp `.env*`. CubSol hiện chưa cần biến môi trường
để build và hiển thị giao diện nền tảng.

## 4. Tiêu chí hoàn thành

- Cài dependency bằng frozen lockfile.
- Typecheck, lint, boundary check và unit test đạt.
- `next build` đạt.
- Server production trả HTML CubSol hợp lệ.
- Commit Tuần 2.5 được đẩy tiếp sau commit Tuần 2 trên cùng nhánh review.
