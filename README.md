# CubSol

CubSol là web app giải Rubik 3x3 theo hướng client-first: nhập trạng thái bằng
camera, ảnh hoặc bảng màu; xác thực tính khả thi; tìm lời giải ngắn; và hướng dẫn
từng bước trên mô hình 3D.

## Trạng thái

Tuần 1 đã thiết lập nền tảng dự án và giao diện responsive. Tuần 2 hoàn thiện
domain move engine, WCA notation và validator vật lý cho Rubik 3x3. Tuần 2.5
chuẩn hóa runtime Next.js để triển khai trực tiếp trên Vercel. Tuần 3 cung cấp
bảng nhập màu thủ công 6 mặt, palette có thể thao tác bằng bàn phím và phản hồi
validator trực tiếp. Tuần 4 tích hợp Kociemba WebAssembly trong Web Worker, xác
minh lời giải bằng domain move engine và cung cấp trình điều khiển từng bước.
Camera và Three.js thuộc các giai đoạn tiếp theo.

## Yêu cầu

- Node.js `>=22.13.0`
- pnpm `11.9.0`

## Lệnh phát triển

```bash
pnpm install
pnpm doctor
pnpm dev
pnpm typecheck
pnpm lint
pnpm test
pnpm build
```

Mô hình Rubik 3D dùng Three.js được tải theo chunk riêng, hỗ trợ tô sticker trực
tiếp và tutorial animation tiến/lùi sau khi Kociemba xác minh lời giải.

## Triển khai Vercel

Import repository `Kouskous56/cubsol` vào Vercel và giữ Root Directory ở thư mục
gốc. Vercel tự nhận diện Next.js, dùng pnpm từ `packageManager` và tạo Preview
Deployment cho pull request. Dự án hiện không cần biến môi trường để build.

Không commit thư mục `.vercel`, token hoặc các tệp `.env*`.

Nếu vừa cài Git, Node hoặc GitHub CLI trên Windows, hãy mở terminal mới để PATH
được nạp lại. Hướng dẫn và chẩn đoán chi tiết nằm tại
[`docs/environment.md`](docs/environment.md).

## Cấu trúc chính

```text
app/                         Điểm vào, layout và metadata
src/domain/                  Entity và logic Rubik thuần
src/application/             Store và use case
src/infrastructure/          Adapter kỹ thuật (các tuần sau)
src/presentation/            Giao diện
tests/                       Test setup và rendered HTML
docs/architecture.md         Quy tắc kiến trúc
```

## Quyền riêng tư

Kiến trúc mục tiêu xử lý ảnh và trạng thái Rubik ngay trên thiết bị. Không đưa
ảnh, chuỗi 54 sticker hoặc lịch sử giải vào analytics hay request bên ngoài.
