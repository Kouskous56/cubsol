# CubSol

CubSol là web app giải Rubik 3x3 theo hướng client-first: nhập trạng thái bằng
camera, ảnh hoặc bảng màu; xác thực tính khả thi; tìm lời giải ngắn; và hướng dẫn
từng bước trên mô hình 3D.

## Trạng thái

Tuần 1 đã thiết lập nền tảng dự án, kiến trúc module, Zustand store, kiểu dữ
liệu Rubik ban đầu, kiểm thử và giao diện responsive. Solver, validator đầy đủ,
camera và Three.js thuộc các giai đoạn tiếp theo.

## Yêu cầu

- Node.js `>=22.13.0`
- pnpm `11.9.0`

## Lệnh phát triển

```bash
pnpm install
pnpm dev
pnpm typecheck
pnpm lint
pnpm test
pnpm build
```

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
